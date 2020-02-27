const buildIcons = require('../src/build-icons');
jest.mock('fs-extra');
jest.mock('svgo');
jest.mock('glob');
jest.mock('../src/lib/svg-optimizer');
jest.mock('esformatter');

describe('Build icons', () => {
  let fsMock, globMock, optimizerMock, esformatterMock;
  let svgFiles;
  const inputDir = 'src', outputDir = '/dist';

  beforeEach(() => {
    fsMock = require('fs-extra');
    globMock = require('glob');
    optimizerMock = require('../src/lib/svg-optimizer');
    esformatterMock = require('esformatter');
  });

  const resetMocks = () => {
    fsMock.copySync.mockReset();
    fsMock.writeFileSync.mockReset();
    esformatterMock.format.mockReset();
    optimizerMock.mockReset();
  };

  beforeEach(() => {
    resetMocks();

    optimizerMock.mockImplementation(content => Promise.resolve(content));

    esformatterMock.format.mockImplementation(obj => obj);

    fsMock.readFileSync.mockImplementation(fileName => {
      const foundFiles = svgFiles.filter(file => file.name === fileName);

      if (foundFiles.length > 0) {
        return foundFiles[0].raw;
      }

      throw 'File not found!';
    });

    globMock.sync.mockImplementation(() => svgFiles.map(file => file.name));
  });

  afterEach(() => {
    // no unexpected file should be written
    expect(fsMock.writeFileSync).not.toHaveBeenCalled();
  });

  const withSvgFiles = (...files) => {
    svgFiles = [...files];
  };

  const expectIconFiles = (svgFiles = [], options = {}) => {
    const totalFileWriteCount = svgFiles.length + 1;
    let indexJs = '';
    expect(esformatterMock.format.mock.calls.length).toEqual(svgFiles.length);
    expect(optimizerMock.mock.calls.length).toEqual(svgFiles.length);
    expect(fsMock.writeFileSync.mock.calls.length).toEqual(totalFileWriteCount);

    svgFiles.forEach((val, index) => {
      const filePath = fsMock.writeFileSync.mock.calls[index][0];
      const fileContent = fsMock.writeFileSync.mock.calls[index][1];
      const subDir = options.subDir ? '/components' : '';
      const regexp = new RegExp(`${subDir}/${val.name}.${options.typescript ? 'ts' : 'js'}`);

      expect(filePath).toMatch(regexp);
      val.expects.forEach(expected => {
        if (expected instanceof RegExp) {
          expect(fileContent).toMatch(expected);
        } else {
          expect(fileContent).not.toMatch(expected.not);
        }
      });

      indexJs += `export {${options.namedExport ? '' : 'default as '}${val.name}} from '.${subDir}/${val.name}';\n`;
    });

    if (indexJs) {
      indexJs = '/* eslint-disable */\n' +
        '/* tslint:disable */\n' +
        indexJs +
        '/* tslint:enable */\n' +
        '/* eslint-enable */\n';
    }

    const regexp = new RegExp(`.*/dist/index.${options.typescript ? 'ts' : 'js'}$`);
    expect(fsMock.writeFileSync.mock.calls[totalFileWriteCount - 1][0]).toMatch(regexp);
    expect(fsMock.writeFileSync.mock.calls[totalFileWriteCount - 1][1]).toEqual(indexJs || '\n');

    resetMocks();
  };

  it('should clean previous output dir and copy base files', () => {
    withSvgFiles();
    const promise = buildIcons({inputDir, outputDir});

    expect(fsMock.removeSync.mock.calls[0][0]).toMatch(/.*\/dist$/);
    expect(fsMock.mkdirsSync.mock.calls[0][0]).toMatch(/.*\/dist/);

    return promise.then(() => {
      expectIconFiles();
    });
  });

  it('should create a simple svg component', () => {
    const file1 = {
      name: 'Icon1',
      raw: '<svg><g></g></svg>',
      expects: [/export default Icon1;/]
    };
    withSvgFiles(file1);

    return buildIcons({inputDir, outputDir}).then(() => {
      expectIconFiles([file1]);
    });
  });

  it('should create multiple svg components', () => {
    const file1 = {
      name: 'Icon1',
      raw: '<svg><g></g></svg>',
      expects: [/export default Icon1;/]
    };
    const file2 = {
      name: 'Icon2',
      raw: '<svg><g></g></svg>',
      expects: [/export default Icon2;/]
    };
    withSvgFiles(file1, file2);

    return buildIcons({inputDir, outputDir}).then(() => {
      expectIconFiles([file1, file2]);
    });
  });

  describe('svg modifications', () => {
    it('should transform kebab-case attributes to camelCase', () => {
      const file1 = {
        name: 'Icon2',
        raw: `<svg><g first-attr="val1"><g second-attr="val2"></g></g></svg>`,
        expects: [/firstAttr="val1".*secondAttr="val2"/]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir}).then(() => {
        expectIconFiles([file1]);
      });
    });

    it('should transform html attributes to React attributes', () => {
      const file1 = {
        name: 'Icon3',
        raw: `<svg><g xlink:href="link"><g class="class"></g></g></svg>`,
        expects: [/xlinkHref="link".*className="class"/]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir}).then(() => {
        expectIconFiles([file1]);
      });
    });

    it('should replace fill & stroke attributes with current color value', () => {
      const file1 = {
        name: 'Icon4',
        raw: `<svg><g fill="#000000"><g stroke="#FFF"></g></g></svg>`,
        expects: [/fill="currentColor".*stroke="currentColor"/]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir}).then(() => {
        expectIconFiles([file1]);
      });
    });

    it('should keep none value for stroke & fill attributes', () => {
      const file1 = {
        name: 'Icon5',
        raw: `<svg><g stroke="none"><g fill="none"></g></g></svg>`,
        expects: [/stroke="none".*fill="none"/]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir}).then(() => {
        expectIconFiles([file1]);
      });
    });

    it('should not replace fill & stroke attributes with current color value, if `keepColors` flag is set', () => {
      const file1 = {
        name: 'Icon4',
        raw: `<svg><g fill="#000000"><g stroke="#FFF"></g></g></svg>`,
        expects: [/fill="#000000".*stroke="#FFF"/]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir, keepColors: true}).then(() => {
        expectIconFiles([file1]);
      });
    });

    it('doesn\'t replace fill & stroke attributes with current color value, with `keepColors` flag, even if `monochrome` is set', () => {
      const file1 = {
        name: 'Icon4',
        raw: `<svg><g fill="#000000"><g stroke="#FFF"></g></g></svg>`,
        expects: [/fill="#000000".*stroke="#FFF"/]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir, keepColors: true, monochrome: true}).then(() => {
        expectIconFiles([file1]);
      });
    });

    it('should create typescript files if typescript flag is set', () => {
      const file1 = {
        name: 'Icon5',
        raw: `<svg><g stroke="none"><g fill="none"></g></g></svg>`,
        expects: [/stroke="none".*fill="none"/]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir, typescript: true}).then(() => {
        expectIconFiles([file1], {typescript: true});
      });
    });

    it('should save width and height attributes', () => {
      const file1 = {
        name: 'Icon7',
        raw: `<svg width="24" height="24" viewBox="0 0 24 24"><polygon points="12"/></svg>`,
        expects: [/widthFromSvg = 24 || '1em'/]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir}).then(() => {
        expectIconFiles([file1]);
      });
    });

    it('should hide width or height attributes when width or height not defined', () => {
      const file1 = {
        name: 'Icon8',
        raw: `<svg viewBox="0 0 24 24"><polygon points="12"/></svg>`,
        expects: [/widthFromSvg = undefined || '1em'/]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir}).then(() => {
        expectIconFiles([file1]);
      });
    });

    describe('`displayName`', () => {
      it('should be included in javascript', () => {
        const file1 = {
          name: 'IAmTheOneWhoKnocks',
          raw: `<svg viewBox="0 0 24 24"><polygon points="12"/></svg>`,
          expects: [/IAmTheOneWhoKnocks.displayName = 'IAmTheOneWhoKnocks';/]
        };
        withSvgFiles(file1);

        return buildIcons({inputDir, outputDir}).then(() => {
          expectIconFiles([file1]);
        });
      });

      it('should be included in typescript', () => {
        const file1 = {
          name: 'IAmTheOneWhoTypes',
          raw: `<svg viewBox="0 0 24 24"><polygon points="12"/></svg>`,
          expects: [/IAmTheOneWhoTypes.displayName = 'IAmTheOneWhoTypes';/]
        };
        withSvgFiles(file1);

        return buildIcons({inputDir, outputDir, typescript: true}).then(() => {
          expectIconFiles([file1], {typescript: true});
        });
      });
    });
  });

  describe('named-export', () => {
    it('should generate named exports - javascript', () => {
      const file1 = {
        name: 'Icon5',
        raw: `<svg><g stroke="none"><g fill="none"></g></g></svg>`,
        expects: [
          /export const Icon5/,
          {not: /export default/}
        ]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir, namedExport: true}).then(() => {
        expectIconFiles([file1], {namedExport: true});
      });
    });

    it('should generate named exports - typescript', () => {
      const file1 = {
        name: 'Icon5',
        raw: `<svg><g stroke="none"><g fill="none"></g></g></svg>`,
        expects: [
          /export const Icon5/,
          {not: /export default/}
        ]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir, typescript: true, namedExport: true}).then(() => {
        expectIconFiles([file1], {typescript: true, namedExport: true});
      });
    });
  });

  describe('no-sub-dir', () => {
    it('should generate all files in one folder without sub directory', () => {
      const file1 = {
        name: 'Icon1',
        raw: '<svg><g></g></svg>',
        expects: [/export default Icon1;/]
      };
      withSvgFiles(file1);

      return buildIcons({inputDir, outputDir, subDir: false}).then(() => {
        expectIconFiles([file1], {subDir: false});
      });
    });
  });
});
