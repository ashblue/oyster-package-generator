import * as fs from 'fs';
import * as del from 'del';
import {copyFolder, findPreExistingFiles} from './copy-folder';

const TMP_ASSETS = 'tmp/assets';
const DEST = 'tmp/dist';

beforeEach(() => {
  del.sync(TMP_ASSETS);
  del.sync(DEST);
  fs.mkdirSync(TMP_ASSETS, {recursive: true});
  fs.mkdirSync(DEST, {recursive: true});
});

describe('findPreExistingFiles method', () => {
  it('should detect pre-existing files if they exist', () => {
    fs.mkdirSync(DEST, {recursive: true});
    fs.writeFileSync(`${TMP_ASSETS}/file.txt`, 'new');
    fs.writeFileSync(`${DEST}/file.txt`, 'old');

    const results = findPreExistingFiles(
      TMP_ASSETS,
      DEST,
      []);

    expect(results[0]).toContain('file.txt');
  });

  it('should detect pre-existing hidden files if they exist', () => {
    fs.mkdirSync(DEST, {recursive: true});
    fs.writeFileSync(`${TMP_ASSETS}/.file.txt`, 'new');
    fs.writeFileSync(`${DEST}/.file.txt`, 'old');

    const results = findPreExistingFiles(
      TMP_ASSETS,
      DEST,
      []);

    expect(results[0]).toContain('.file.txt');
  });

  it('should skip ds store files', () => {
    fs.mkdirSync(DEST, {recursive: true});
    fs.writeFileSync(`${TMP_ASSETS}/.DS_Store`, 'new');
    fs.writeFileSync(`${DEST}/.DS_Store`, 'old');

    const results = findPreExistingFiles(
      TMP_ASSETS,
      DEST,
      []);

    expect(results.length).toEqual(0);
  });

  it('should not return non-matching pre-existing files', () => {
    fs.mkdirSync(DEST, {recursive: true});
    fs.writeFileSync(`${TMP_ASSETS}/file.txt`, 'new');

    const results = findPreExistingFiles(
      TMP_ASSETS,
      DEST,
      []);

    expect(results.length).toEqual(0);
  });

  it('should never replace pre-existing files with variable injection', () => {
    const name = 'LoremIpsum';
    const sourcePath = `${TMP_ASSETS}/{name}`;
    const destPath = `${DEST}/${name}`;
    const destFile = `${destPath}/file.txt`;

    fs.mkdirSync(sourcePath, {recursive: true});
    fs.mkdirSync(destPath, {recursive: true});
    fs.writeFileSync(`${sourcePath}/file.txt`, 'new');
    fs.writeFileSync(destFile, 'old');

    const results = findPreExistingFiles(
      TMP_ASSETS,
      DEST,
      [
        {
          value: name,
          variable: 'name',
        },
      ],
    );

    expect(results[0]).toContain('file.txt');
  });
});

describe('copyFolder method', () => {
  it('should copy the folder to the appointed destination', async () => {
    await copyFolder(TMP_ASSETS, DEST);

    expect(fs.existsSync(DEST)).toBeTruthy();
  });

  it('should copy files', async () => {
    fs.writeFileSync(`${TMP_ASSETS}/file.txt`, 'lorem ipsum');

    await copyFolder(TMP_ASSETS, DEST);

    expect(fs.existsSync(`${DEST}/file.txt`)).toBeTruthy();
  });

  it('should copy hidden files', async () => {
    fs.writeFileSync(`${TMP_ASSETS}/.file.txt`, 'lorem ipsum');

    await copyFolder(TMP_ASSETS, DEST);

    expect(fs.existsSync(`${DEST}/.file.txt`)).toBeTruthy();
  });

  it('should copy folders', async () => {
    fs.mkdirSync(`${TMP_ASSETS}/Runtime`);

    await copyFolder(TMP_ASSETS, DEST);

    expect(fs.existsSync(`${DEST}/Runtime`)).toBeTruthy();
  });

  describe('variable renaming', () => {
    it('should rename folders with a given variable name', async () => {
      fs.mkdirSync(`${TMP_ASSETS}/{name}`);

      await copyFolder(
        TMP_ASSETS,
        DEST,
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

    it('should rename files with a given variable name', async () => {
      fs.writeFileSync(`${TMP_ASSETS}/{name}.txt`, 'Lorem Ipsum');

      await copyFolder(
        TMP_ASSETS,
        DEST,
        {
          replaceVariables: [
            {
              value: 'LoremIpsum',
              variable: 'name',
            },
          ],
        });

      expect(fs.existsSync(`${DEST}/LoremIpsum.txt`)).toBeTruthy();
    });

    it('should not fail when renaming nested folders', async () => {
      fs.mkdirSync(`${TMP_ASSETS}/{name}`);
      fs.writeFileSync(`${TMP_ASSETS}/{name}/file.txt`, '{name}');

      await copyFolder(
        TMP_ASSETS,
        DEST,
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
        TMP_ASSETS,
        DEST,
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

    it('should not replace variables in text files that are not from the source', async () => {
      fs.writeFileSync(`${TMP_ASSETS}/file.txt`, '{name}');
      fs.writeFileSync(`${DEST}/old.txt`, '{name}');

      await copyFolder(
        TMP_ASSETS,
        DEST,
        {
          replaceVariables: [
            {
              value: 'LoremIpsum',
              variable: 'name',
            },
          ],
        });

      const contents = fs.readFileSync(`${DEST}/old.txt`).toString();

      expect(contents).toContain('{name}');
    });

    it('should replace multiple variables in any discovered text files', async () => {
      const nameValue = 'LoremIpsum';
      fs.writeFileSync(`${TMP_ASSETS}/file.txt`, '{name}{name}');

      await copyFolder(
        TMP_ASSETS,
        DEST,
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
