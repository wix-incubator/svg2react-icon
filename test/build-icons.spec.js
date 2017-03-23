const buildIcons = require('../src/build-icons');
jest.mock('fs-extra');
jest.mock('svgo');
jest.mock('glob');
jest.mock('../src/svg-optimizer');
jest.mock('esformatter');

describe('Build icons', () => {
  let fsMock, globMock, optimizerMock, esformatterMock;
  let svgFiles;
  const inputDir = '', outputDir = '/dist';

  beforeEach(() => {
    fsMock = require('fs-extra');
    globMock = require('glob');
    optimizerMock = require('../src/svg-optimizer');
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

    optimizerMock.mockImplementation(content => {
      return new Promise(resolve => {
        resolve(content);
      });
    });

    esformatterMock.format.mockImplementation(obj => obj);

    fsMock.readFileSync.mockImplementation(fileName => {
      const foundFiles = svgFiles.filter(file => file.name === fileName);

      if (foundFiles.length > 0) {
        return foundFiles[0].raw;
      }

      throw 'File not found!';
    });

    globMock.mockImplementation((globFilter, handler) => {
      const fileNames = svgFiles.map(file => file.name);
      handler(null, fileNames);
    });
  });

  afterEach(() => {
    // no unexpected file should be written
    expect(fsMock.writeFileSync).not.toHaveBeenCalled();
  });

  const withSvgFiles = (...files) => {
    svgFiles = [...files];
  };

  const expectIconFiles = (...svgFiles) => {
    const totalFileWriteCount = svgFiles.length + 1;
    let indexJs = '';
    expect(esformatterMock.format.mock.calls.length).toEqual(svgFiles.length);
    expect(optimizerMock.mock.calls.length).toEqual(svgFiles.length);
    expect(fsMock.writeFileSync.mock.calls.length).toEqual(totalFileWriteCount);

    svgFiles.forEach((val, index) => {
      const regexp = new RegExp(`.*/components/${val.name}.js`);
      expect(fsMock.writeFileSync.mock.calls[index][0]).toMatch(regexp);
      expect(fsMock.writeFileSync.mock.calls[index][1]).toMatch(val.expected);
      indexJs += `export {default as ${val.name}} from './components/${val.name}';\n`;
    });

    expect(fsMock.writeFileSync.mock.calls[totalFileWriteCount - 1][0]).toMatch(/.*\/dist\/index\.js$/);
    expect(fsMock.writeFileSync.mock.calls[totalFileWriteCount - 1][1]).toEqual(indexJs || '\n');

    expect(fsMock.copySync.mock.calls[0][0]).toMatch(/.*\/icon-base\/Icon\.js/);
    expect(fsMock.copySync.mock.calls[0][1]).toMatch(/.*\/dist\/Icon\.js/);
    expect(fsMock.copySync.mock.calls[1][0]).toMatch(/.*\/icon-base\/Icon\.scss/);
    expect(fsMock.copySync.mock.calls[1][1]).toMatch(/.*\/dist\/Icon\.scss/);

    resetMocks();
  };
  const expectTypeScriptIconFiles = (...svgFiles) => {
    const totalFileWriteCount = svgFiles.length + 1;
    let indexTs = '';
    expect(esformatterMock.format.mock.calls.length).toEqual(svgFiles.length);
    expect(optimizerMock.mock.calls.length).toEqual(svgFiles.length);
    expect(fsMock.writeFileSync.mock.calls.length).toEqual(totalFileWriteCount);

    svgFiles.forEach((val, index) => {
      const regexp = new RegExp(`.*/components/${val.name}.tsx`);
      expect(fsMock.writeFileSync.mock.calls[index][0]).toMatch(regexp);
      expect(fsMock.writeFileSync.mock.calls[index][1]).toMatch(val.expected);
      indexTs += `export {default as ${val.name}} from './components/${val.name}';\n`;
    });

    expect(fsMock.writeFileSync.mock.calls[totalFileWriteCount - 1][0]).toMatch(/.*\/dist\/index\.ts$/);
    expect(fsMock.writeFileSync.mock.calls[totalFileWriteCount - 1][1]).toEqual(indexTs || '\n');

    expect(fsMock.copySync.mock.calls[0][0]).toMatch(/.*\/icon-base\/Icon\.tsx/);
    expect(fsMock.copySync.mock.calls[0][1]).toMatch(/.*\/dist\/Icon\.tsx/);
    expect(fsMock.copySync.mock.calls[1][0]).toMatch(/.*\/icon-base\/Icon\.scss/);
    expect(fsMock.copySync.mock.calls[1][1]).toMatch(/.*\/dist\/Icon\.scss/);

    resetMocks();
  };

  it('should clean previous output dir and copy base files', () => {
    withSvgFiles();
    const promise = buildIcons(inputDir, outputDir);

    expect(fsMock.removeSync.mock.calls[0][0]).toMatch(/.*\/dist$/);
    expect(fsMock.mkdirsSync.mock.calls[0][0]).toMatch(/.*\/dist/);
    expect(fsMock.mkdirsSync.mock.calls[1][0]).toMatch(/.*\/dist\/components/);

    return promise.then(() => {
      expectIconFiles();
    });
  });

  it('should create a simple svg component', () => {
    const file1 = {
      name: 'Icon1',
      raw: '<svg><g></g></svg>',
      expected: /export default Icon1;/
    };
    withSvgFiles(file1);

    return buildIcons(inputDir, outputDir).then(() => {
      expectIconFiles(file1);
    });
  });

  it('should create multiple svg components', () => {
    const file1 = {
      name: 'Icon1',
      raw: '<svg><g></g></svg>',
      expected: /export default Icon1;/
    };
    const file2 = {
      name: 'Icon2',
      raw: '<svg><g></g></svg>',
      expected: /export default Icon2;/
    };
    withSvgFiles(file1, file2);

    return buildIcons(inputDir, outputDir).then(() => {
      expectIconFiles(file1, file2);
    });
  });

  describe('svg modifications', () => {
    it('should transform kebab-case attributes to camelCase', () => {
      const file1 = {
        name: 'Icon2',
        raw: `<svg><g first-attr="val1"><g second-attr="val2"></g></g></svg>`,
        expected: /firstAttr="val1".*secondAttr="val2"/
      };
      withSvgFiles(file1);

      return buildIcons(inputDir, outputDir).then(() => {
        expectIconFiles(file1);
      });
    });

    it('should transform html attributes to React attributes', () => {
      const file1 = {
        name: 'Icon3',
        raw: `<svg><g xlink:href="link"><g class="class"></g></g></svg>`,
        expected: /xlinkHref="link".*className="class"/
      };
      withSvgFiles(file1);

      return buildIcons(inputDir, outputDir).then(() => {
        expectIconFiles(file1);
      });
    });

    it('should replace fill & stroke attributes with current color value', () => {
      const file1 = {
        name: 'Icon4',
        raw: `<svg><g fill="#000000"><g stroke="#FFF"></g></g></svg>`,
        expected: /fill="currentColor".*stroke="currentColor"/
      };
      withSvgFiles(file1);

      return buildIcons(inputDir, outputDir).then(() => {
        expectIconFiles(file1);
      });
    });

    it('should keep none value for stoke & fille attributes', () => {
      const file1 = {
        name: 'Icon5',
        raw: `<svg><g stroke="none"><g fill="none"></g></g></svg>`,
        expected: /stroke="none".*fill="none"/
      };
      withSvgFiles(file1);

      return buildIcons(inputDir, outputDir).then(() => {
        expectIconFiles(file1);
      });
    });

    it('should create typescript files if isTypeScriptOutput flag is set', () => {
      const file1 = {
        name: 'Icon5',
        raw: `<svg><g stroke="none"><g fill="none"></g></g></svg>`,
        expected: /stroke="none".*fill="none"/
      };
      withSvgFiles(file1);

      return buildIcons(inputDir, outputDir, true).then(() => {
        expectTypeScriptIconFiles(file1);
      });
    });
  });
});
