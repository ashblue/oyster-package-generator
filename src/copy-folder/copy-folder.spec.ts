import * as del from 'del';
import * as fs from 'fs';
import {copyFolder} from './copy-folder';

describe('copyFolder', () => {
  const TMP_ASSETS = 'tmp/assets';
  const DEST = 'tmp/dist/assets';

  beforeEach(() => {
    del.sync('tmp');
    fs.mkdirSync(TMP_ASSETS, {recursive: true});
  });

  it('should copy the folder to the appointed destination', async () => {
    await copyFolder(TMP_ASSETS, DEST);

    expect(fs.existsSync(DEST)).toBeTruthy();
  });

  it('should copy files', async () => {
    fs.writeFileSync(`${TMP_ASSETS}/file.txt`, 'lorem ipsum');

    await copyFolder(TMP_ASSETS, DEST);

    expect(fs.existsSync(`${DEST}/file.txt`)).toBeTruthy();
  });

  it('should copy folders', async () => {
    fs.mkdirSync(`${TMP_ASSETS}/Runtime`);

    await copyFolder(TMP_ASSETS, DEST);

    expect(fs.existsSync(`${DEST}/Runtime`)).toBeTruthy();
  });

  describe('variable renaming', () => {
    it('should rename root folder with a given variable name', async () => {
      fs.mkdirSync('tmp/{name}');

      await copyFolder('tmp/{name}', 'tmp/dist/{name}', {
        replaceVariables: [
          {
            value: 'LoremIpsum',
            variable: 'name',
          },
        ],
      });

      expect(fs.existsSync(`tmp/dist/LoremIpsum`)).toBeTruthy();
    });

    it('should rename folders with a given variable name', async () => {
      fs.mkdirSync(`${TMP_ASSETS}/{name}`);

      await copyFolder(TMP_ASSETS, DEST, {
        replaceVariables: [
          {
            value: 'LoremIpsum',
            variable: 'name',
          },
        ],
      });

      expect(fs.existsSync(`${DEST}/LoremIpsum`)).toBeTruthy();
    });

    it('should replace variables in any discovered text files', async () => {
      fs.writeFileSync(`${TMP_ASSETS}/file.txt`, '{name}');

      await copyFolder(TMP_ASSETS, DEST, {
        replaceVariables: [
          {
            value: 'LoremIpsum',
            variable: 'name',
          },
        ],
      });

      const contents = fs.readFileSync(`${DEST}/file.txt`).toString();

      expect(contents).toContain('LoremIpsum');
    });
  });
});
