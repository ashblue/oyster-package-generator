import * as fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { nanoid } from 'nanoid';
import { copyFileFolder, findPreExistingFiles } from './copy-folder';
import spyOn = jest.spyOn;

jest.mock('fs');
jest.mock('path');
jest.mock('glob');
jest.mock('del');
jest.mock('fs-extra');

describe('copyFolder helpers', () => {
  describe('copyFileFolder method', () => {
    interface IOptions {
      isFile?: boolean;
      destination?: string;
      tmpPath?: string;
      newPathAlreadyExists?: boolean;
    }

    const setup = async (options: IOptions = {}) => {
      const optionsDefault = {
        isFile: false,
        destination: 'b',
        tmpPath: nanoid(),
        newPathAlreadyExists: false,
      };

      const { isFile, destination, tmpPath, newPathAlreadyExists } = {
        ...optionsDefault,
        ...options,
      };

      jest.spyOn(glob, 'sync').mockReturnValue([]);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      jest.spyOn(fs, 'statSync').mockReturnValue({
        isFile: () => isFile,
        isDirectory: () => !isFile,
      } as any);
      jest.spyOn(path, 'resolve').mockReturnValue(tmpPath);
      jest.spyOn(fs, 'readFileSync').mockReturnValue('');
      jest.spyOn(fs, 'existsSync').mockReturnValue(newPathAlreadyExists);

      await copyFileFolder('a', destination);
    };

    it('should run without errors', async () => {
      await setup();
    });

    it('renaming files has an existing path with a replacement return it', async () => {
      const newPathAlreadyExists = true;
      const isFile = true;
      const tmpPath = '{a}';

      await setup({ tmpPath, newPathAlreadyExists, isFile });

      expect(fs.existsSync).toHaveBeenCalled();
    });

    describe('when source is a file', () => {
      it('should not make a destination directory', async () => {
        const isFile = true;

        await setup({ isFile });

        expect(fs.mkdirSync).not.toHaveBeenCalled();
      });

      it('should not call a glob.sync', async () => {
        const isFile = true;

        await setup({ isFile });

        expect(glob.sync).not.toHaveBeenCalled();
      });
    });

    describe('when source is a folder', () => {
      it('should make a destination directory if the source is a folder', async () => {
        const tmpPath = nanoid();

        await setup({ tmpPath });

        expect(fs.mkdirSync).toHaveBeenCalledWith(tmpPath, { recursive: true });
      });

      it('should use a glob sync on the destination', async () => {
        const tmpPath = nanoid();
        const destination = `${tmpPath}/**/*`;
        const options = { dot: true };

        await setup({ tmpPath });

        expect(glob.sync).toHaveBeenCalledWith(destination, options);
      });
    });
  });

  describe('findPreExistingFiles', () => {
    it('should replace broken paths with a slash', () => {
      spyOn(glob, 'sync').mockReturnValue(['a']);

      findPreExistingFiles('a', 'b', []);
    });
  });
});
