import rimraf from 'rimraf';

const {spawnSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'test/output';

function createCommand(options = []) {
  return `./src/index.js ${options.join(' ')} test/svgs ${OUTPUT_FILE}`.split(' ');
}

function clean() {
  return new Promise((res, rej) => {
    rimraf(path.resolve('.', `${OUTPUT_FILE}/*`), err => {
      if (err) {
        rej(err);
      } else {
        res();
      }
    });
  });
}

describe('index', () => {
  const filePath = path.resolve('.', OUTPUT_FILE, 'components/test.js');
  const tsFilePath = path.resolve('.', OUTPUT_FILE, 'components/test.tsx');

  beforeAll(async () => {
    await clean();
  });

  afterEach(async () => {
    await clean();
  });

  describe('--typescript', () => {
    it('should create typescript file', done => {
      const spawnedProcess = spawnSync('node', createCommand(['--typescript']));

      fs.readFile(tsFilePath, {encoding: 'utf-8'}, (err, data) => {
        if (!err) {
          expect(data).toBeTruthy();
        } else {
          expect(true).toBeFalsy();
        }
        done();
      });
      expect(spawnedProcess.output.toString()).toContain('Created: test/output/components/test.tsx');
    });
  });

  describe('--monochrome', () => {
    it('should strip out fills', done => {
      spawnSync('node', createCommand(['--monochrome']));

      fs.readFile(filePath, {encoding: 'utf-8'}, (err, data) => {
        if (!err) {
          expect(data.replace(/fill="currentColor"/g, '').indexOf('fill=')).toBe(-1);
        } else {
          expect(true).toBeFalsy();
        }
        done();
      });
    });
  });

  describe('--keep-colors', () => {
    it('should strip out fills', done => {
      spawnSync('node', createCommand(['--keep-colors']));

      fs.readFile(filePath, {encoding: 'utf-8'}, (err, data) => {
        if (!err) {
          expect(data.replace(/fill="currentColor"/g, '').indexOf('fill="green"')).toBeGreaterThan(-1);
        } else {
          expect(true).toBeFalsy();
        }
        done();
      });
    });
  });

  describe('--named-export', () => {
    it('should create file with named export', done => {
      spawnSync('node', createCommand(['--named-export']));

      fs.readFile(filePath, {encoding: 'utf-8'}, (err, data) => {
        if (!err) {
          expect(data.indexOf('export const test')).toBeGreaterThan(-1);
        } else {
          expect(true).toBeFalsy();
        }
        done();
      });
    });
  });

  describe('--no-sub-dir', () => {
    it('should create file in output dir, without "components" sub dir', done => {
      spawnSync('node', createCommand(['--no-sub-dir']));
      const filePath = path.resolve('.', OUTPUT_FILE, 'test.js');

      fs.readFile(filePath, {encoding: 'utf-8'}, (err, data) => {
        if (!err) {
          expect(data).toBeTruthy();
        } else {
          expect(true).toBeFalsy();
        }
        done();
      });
    });
  });
});
