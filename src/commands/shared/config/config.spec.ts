import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { A } from '../../../utils/builders/a';
import Config from './config';
import IConfigRaw from './i-config-raw';

jest.mock('path');
jest.mock('fs');

describe('Config class', () => {
  interface IOptions {
    configRaw?: IConfigRaw;
    packageJsonPath?: string;
    packageJsonContents?: string;
  }

  const setup = (options: IOptions = {}) => {
    const optionDefaults: IOptions = {
      configRaw: A.configRaw().build(),
    };

    const { configRaw, packageJsonContents, packageJsonPath } = {
      ...optionDefaults,
      ...options,
    };

    jest.spyOn(path, 'resolve').mockReturnValue(packageJsonPath as any);
    jest.spyOn(fs, 'readFileSync').mockReturnValue(packageJsonContents as any);

    return {
      config: new Config(configRaw as IConfigRaw),
    };
  };

  describe('constructor', () => {
    it('should convert config raw to config interface', () => {
      const configRaw = A.configRaw().build();

      const { config } = setup({ configRaw });

      expect(config).toMatchObject(configRaw);
    });
  });

  describe('syncVersion method', () => {
    const version = '3.2.1';
    const packageJsonPath = nanoid();
    const packageJsonContents = JSON.stringify({ version });

    it('should sync the current oyster package.json version', () => {
      const { config } = setup({ packageJsonContents });
      config.syncVersion();

      expect(config.oysterVersion).toEqual(version);
    });

    it('should call readFileSync with the expected arguments', () => {
      const { config } = setup({ packageJsonContents, packageJsonPath });
      config.syncVersion();

      expect(fs.readFileSync).toHaveBeenCalledWith(packageJsonPath);
    });

    it('should call path.resolve with the expected arguments', () => {
      const { config } = setup({ packageJsonContents, packageJsonPath });
      config.syncVersion();

      expect(path.resolve).toHaveBeenCalledWith(
        __dirname,
        './../../../../package.json',
      );
    });
  });
});
