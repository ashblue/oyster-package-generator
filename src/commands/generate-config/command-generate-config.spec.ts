import * as fs from 'fs';
import { nanoid } from 'nanoid';
import path from 'path';
import { A } from '../../utils/builders/a';
import { IGitDetector } from '../install/git-detector/git-detector';
import IConfigRaw from '../shared/config/i-config-raw';
import { IConfigManager } from '../shared/config/manager/config-manager';
import { IBuiltPackageJson } from '../shared/i-built-package-json';
import CommandGenerateConfig from './command-generate-config';

jest.mock('fs');

describe('CommandGenerateConfig class', () => {
  interface IOptions {
    packageJson?: IBuiltPackageJson;
    oysterVersion?: string;
    gitUrl?: string;
    gitUrlNoHttp?: string;
  }

  const setup = (options: IOptions = {}) => {
    const optionDefaults: IOptions = {
      packageJson: A.builtPackageJson().build(),
    };

    const { oysterVersion, gitUrl, gitUrlNoHttp, packageJson } = {
      ...optionDefaults,
      ...options,
    };

    jest.spyOn(fs, 'readFileSync').mockImplementation((filePathRaw: any) => {
      const filePath = filePathRaw as string;
      switch (filePath) {
        case 'package.json':
          return JSON.stringify(packageJson);
        case path.resolve(__dirname, '../../../package.json'):
          return JSON.stringify({ version: oysterVersion });
      }

      throw new Error(`Unknown path queried: ${filePath}`);
    });

    jest.spyOn(console, 'log').mockImplementation(() => {
      null;
    });

    const configManager: IConfigManager = {
      generate: jest.fn(),
      read: jest.fn(),
    };

    const gitDetector: IGitDetector = {
      getDetails: jest.fn().mockReturnValue(
        Promise.resolve({
          gitUrl,
          gitUrlNoHttp,
        }),
      ),
    };

    return {
      genConfig: new CommandGenerateConfig(configManager, gitDetector),
      configManager,
    };
  };

  describe('run method', () => {
    it('should write local package.json contents to equivalent .oyster.json file', async () => {
      const oysterVersion = '1.2.3';
      const gitUrl = 'myGitRepo';
      const gitUrlNoHttp = 'myGitRepoNoHttp';

      const packageJson: IBuiltPackageJson = {
        author: {
          email: 'asdf@asdf.com',
          name: 'Asdf Qwerty',
          url: 'https://asdf.com',
        },
        description: nanoid(),
        displayName: 'A B',
        keywords: ['a', 'b', 'c'],
        name: 'com.a.b',
        unity: '2019.1',
      };

      const packageScopeParts = packageJson.name.split('.');
      packageScopeParts.pop();
      const packageScope = packageScopeParts.join('.');

      const expectedConfig: IConfigRaw = {
        packageName: packageJson.name,
        displayName: packageJson.displayName,
        description: packageJson.description,
        oysterVersion,
        unityVersion: packageJson.unity,
        packageScope: packageScope,
        keywords: packageJson.keywords,
        author: packageJson.author,
        repo: {
          gitUrl,
          gitUrlNoHttp,
        },
      };

      const { genConfig, configManager } = setup({
        packageJson,
        oysterVersion,
        gitUrl,
        gitUrlNoHttp,
      });
      await genConfig.run();

      expect(configManager.generate).toHaveBeenCalledWith(expectedConfig);
    });

    it('should print a success message on completion', async () => {
      const message = '.oyster.json file successfully created';

      const { genConfig } = setup();
      await genConfig.run();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(message),
      );
    });
  });
});
