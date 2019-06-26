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
    await copyFolder([{
      destination: DEST,
      source: TMP_ASSETS,
    }]);

    expect(fs.existsSync(DEST)).toBeTruthy();
  });

  it('should copy files', async () => {
    fs.writeFileSync(`${TMP_ASSETS}/file.txt`, 'lorem ipsum');

    await copyFolder([{
      destination: DEST,
      source: TMP_ASSETS,
    }]);

    expect(fs.existsSync(`${DEST}/file.txt`)).toBeTruthy();
  });

  it('should copy folders', async () => {
    fs.mkdirSync(`${TMP_ASSETS}/Runtime`);

    await copyFolder([{
      destination: DEST,
      source: TMP_ASSETS,
    }]);

    expect(fs.existsSync(`${DEST}/Runtime`)).toBeTruthy();
  });

  describe('file overwrite prevention', () => {
    it('should never replace pre-existing files', async () => {
      fs.mkdirSync(DEST, {recursive: true});
      fs.writeFileSync(`${TMP_ASSETS}/file.txt`, 'new');
      fs.writeFileSync(`${DEST}/file.txt`, 'old');

      await copyFolder([{
        destination: DEST,
        source: TMP_ASSETS,
      }]);
      const contents = fs.readFileSync(`${DEST}/file.txt`).toString();

      expect(contents).toEqual('old');
    });

    it('should never replace pre-existing files with variable injection', async () => {
      const name = 'LoremIpsum';
      const sourcePath = `${TMP_ASSETS}/{name}`;
      const destPath = `${DEST}/${name}`;
      const destFile = `${destPath}/file.txt`;

      fs.mkdirSync(sourcePath, {recursive: true});
      fs.mkdirSync(destPath, {recursive: true});
      fs.writeFileSync(`${sourcePath}/file.txt`, 'new');
      fs.writeFileSync(destFile, 'old');

      await copyFolder(
        [
          {
            destination: DEST,
            source: TMP_ASSETS,
          }],
        {
          replaceVariables: [
            {
              value: name,
              variable: 'name',
            },
          ],
        },
      );
      const contents = fs.readFileSync(destFile).toString();

      expect(contents).toEqual('old');
    });

    it('should return files that are skipped', async () => {
      fs.mkdirSync(DEST, {recursive: true});
      fs.writeFileSync(`${TMP_ASSETS}/file.txt`, 'new');
      fs.writeFileSync(`${DEST}/file.txt`, 'old');

      const results = await copyFolder([{
        destination: DEST,
        source: TMP_ASSETS,
      }]);

      expect(results.skippedFilePaths[0]).toEqual(`${DEST}/file.txt`);
      expect(results.skippedFilePaths.length).toEqual(1);
    });

    it('should return files that are skipped with variable names', async () => {
      const name = 'LoremIpsum';
      const sourcePath = `${TMP_ASSETS}/{name}`;
      const destPath = `${DEST}/${name}`;
      const destFile = `${destPath}/file.txt`;

      fs.mkdirSync(sourcePath, {recursive: true});
      fs.mkdirSync(destPath, {recursive: true});
      fs.writeFileSync(`${sourcePath}/file.txt`, 'new');
      fs.writeFileSync(destFile, 'old');

      const results = await copyFolder(
        [{
          destination: DEST,
          source: TMP_ASSETS,
        }],
        {
          replaceVariables: [
            {
              value: name,
              variable: 'name',
            },
          ],
        });

      expect(results.skippedFilePaths[0]).toEqual(destFile);
      expect(results.skippedFilePaths.length).toEqual(1);
    });
  });

  describe('variable renaming', () => {
    it('should rename root folder with a given variable name', async () => {
      fs.mkdirSync('tmp/{name}');

      await copyFolder(
        [{destination: 'tmp/dist/{name}', source: 'tmp/{name}'}],
        {
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

      await copyFolder(
        [{destination: DEST, source: TMP_ASSETS}],
        {
        replaceVariables: [
          {
            value: 'LoremIpsum',
            variable: 'name',
          },
        ],
      });

      expect(fs.existsSync(`${DEST}/LoremIpsum`)).toBeTruthy();
    });

    it('should not fail when renaming nested folders', async () => {
      fs.mkdirSync(`${TMP_ASSETS}/{name}`);
      fs.writeFileSync(`${TMP_ASSETS}/{name}/file.txt`, '{name}');

      await copyFolder(
        [{destination: DEST, source: TMP_ASSETS}],
        {
          replaceVariables: [
            {
              value: 'LoremIpsum',
              variable: 'name',
            },
          ],
        });

      expect(fs.existsSync(`${DEST}/LoremIpsum`)).toBeTruthy();
    });

    it('should replace a variable in any discovered text files', async () => {
      fs.writeFileSync(`${TMP_ASSETS}/file.txt`, '{name}');

      await copyFolder(
        [{destination: DEST, source: TMP_ASSETS}],
        {
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

    it('should replace multiple variable in any discovered text files', async () => {
      const nameValue = 'LoremIpsum';
      fs.writeFileSync(`${TMP_ASSETS}/file.txt`, '{name}{name}');

      await copyFolder(
        [{destination: DEST, source: TMP_ASSETS}],
        {
          replaceVariables: [
            {
              value: 'LoremIpsum',
              variable: 'name',
            },
          ],
        });

      const contents = fs.readFileSync(`${DEST}/file.txt`).toString();

      expect(contents).toContain(`${nameValue}${nameValue}`);
    });
  });
});
