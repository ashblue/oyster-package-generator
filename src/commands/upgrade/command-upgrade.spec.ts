import path from 'path';
import del from 'del';
import chalk from 'chalk';
import * as nodegit from 'nodegit';
import IConfig from '../shared/config/i-config';
import IConfigRaw from '../shared/config/i-config-raw';
import { IKeyValuePair } from '../shared/copy-folder/copy-folder';
import { IConfigManager } from '../shared/config/manager/config-manager';
import * as replacementVariables from '../shared/replacement-variables/replacement-variables';
import * as copyFileUtil from '../shared/copy-folder/copy-folder';
import { A } from '../../utils/builders/a';
import CommandUpgrade from './command-upgrade';
import Mock = jest.Mock;
import * as shelljs from 'shelljs';

jest.mock('del');
jest.mock('fs');
jest.mock('../shared/copy-folder/copy-folder');
jest.mock('../shared/replacement-variables/replacement-variables');
jest.mock('../shared/config/config');
jest.mock('shelljs', () => ({
  exec: jest.fn(),
}));

jest.mock('nodegit', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Repository: {
    open: jest.fn(),
  },
}));
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/naming-convention
const mockNodegit: { Repository: { open: Mock } } = nodegit as any;

describe('CommandUpgrade class', () => {
  interface IOptions {
    gitModifiedStatus?: boolean;
    configRaw?: IConfigRaw | null;
  }

  const setup = (options: IOptions = {}) => {
    const optionDefaults: IOptions = {
      gitModifiedStatus: false,
      configRaw: A.configRaw().build(),
    };

    const { gitModifiedStatus, configRaw } = { ...optionDefaults, ...options };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let config: IConfig = null as any;
    if (configRaw) {
      config = { ...configRaw, syncVersion: jest.fn() };
    }

    const configManager: IConfigManager = {
      read: jest.fn().mockReturnValue(config),
      generate: jest.fn(),
    };

    mockNodegit.Repository.open.mockImplementation(() => {
      const changes: any[] = [];
      if (gitModifiedStatus) changes.push({});

      return Promise.resolve({
        getStatus: () => Promise.resolve(changes),
      });
    });

    spyOn(console, 'error').and.callFake(() => null);
    spyOn(console, 'log').and.callFake(() => null);

    return {
      config,
      upgrade: new CommandUpgrade(configManager),
      configManager,
    };
  };

  it('should render', () => {
    const { upgrade } = setup();

    expect(upgrade).toBeTruthy();
  });

  describe('run() method', () => {
    describe('oyster project config', () => {
      it('should display an error if missing', async () => {
        const config = null;
        const errorMessage = chalk.yellow(
          'No .oyster.json file detected. Please add one and try again',
        );

        const { upgrade } = setup({ configRaw: config });
        await upgrade.run();

        expect(console.error).toHaveBeenCalledWith(errorMessage);
      });

      it('should not delete files if missing', async () => {
        const config = null;

        const { upgrade } = setup({ configRaw: config });
        await upgrade.run();

        expect(del.sync).not.toHaveBeenCalled();
      });
    });

    describe('git has active changes', () => {
      it('should print an error message', async () => {
        const gitModifiedStatus = true;
        const errorMessage = chalk.yellow(
          'Active changes detected in your Git files. Please commit your files and try again.',
        );

        const { upgrade } = setup({ gitModifiedStatus });
        await upgrade.run();

        expect(console.error).toHaveBeenCalledWith(errorMessage);
      });

      it('should not print an error message if no changes', async () => {
        const gitModifiedStatus = false;

        const { upgrade } = setup({ gitModifiedStatus });
        await upgrade.run();

        expect(console.error).not.toHaveBeenCalled();
      });

      it('should not delete files', async () => {
        const gitModifiedStatus = true;

        const { upgrade } = setup({ gitModifiedStatus });
        await upgrade.run();

        expect(del.sync).not.toHaveBeenCalled();
      });
    });

    it('should delete a list of specific files', async () => {
      const deleteFiles = [
        '.github/workflows',
        '.husky',
        '.editorconfig',
        '.nvmrc',
        '.releaserc',
        'build.js',
        'commitlint.config.js',
        'package.json',
        'package-lock.json',
        'publish-nightly.sh',
        '.gitignore',
      ];

      const { upgrade } = setup();
      await upgrade.run();

      expect(del.sync).toHaveBeenCalledWith(deleteFiles);
    });

    describe('replacing files', () => {
      it('should copy the specified files with variables to the destination', async () => {
        const replaceVariables: IKeyValuePair[] = [];
        const sourcePath = path.resolve(__dirname, './../../../src/templates');
        const destinationPath = '.';

        const copyFileOrFolder = [
          '.github/workflows',
          '.husky',
          '.editorconfig',
          '.nvmrc',
          '.releaserc',
          'build.js',
          'commitlint.config.js',
          'package.json',
          'publish-nightly.sh',
          '.gitignore',
        ];

        spyOn(
          replacementVariables,
          'getReplacementKeyValuePairs',
        ).and.returnValue(replaceVariables);

        const { upgrade } = setup();
        await upgrade.run();

        copyFileOrFolder.forEach((file) => {
          const dest = `${destinationPath}/${file}`;
          let src = `${sourcePath}/${file}`;
          if (file === '.gitignore') {
            src = `${sourcePath}/{gitignore}`;
          } else if (file === 'package.json') {
            src = `${sourcePath}/{packageJson}`;
          }

          expect(copyFileUtil.copyFileFolder).toHaveBeenCalledWith(src, dest, {
            replaceVariables,
          });
        });
      });

      it('should call getReplacementKeyValuePairs with the expected config', async () => {
        const config = A.configRaw().build();

        const { upgrade } = setup({ configRaw: config });
        await upgrade.run();

        expect(
          replacementVariables.getReplacementKeyValuePairs,
        ).toHaveBeenCalledWith(expect.objectContaining(config));
      });

      it('should sync the config version', async () => {
        const configRaw = A.configRaw().build();

        const { upgrade, config } = setup({ configRaw });
        await upgrade.run();

        expect(config.syncVersion).toHaveBeenCalled();
      });

      it('should write the config version', async () => {
        const configRaw = A.configRaw().build();

        const { upgrade, configManager, config } = setup({ configRaw });
        await upgrade.run();

        expect(configManager.generate).toHaveBeenCalledWith(config);
      });
    });

    describe('npm install', () => {
      it('should print a message while the install is ongoing', async () => {
        const message =
          'Re-installing packages, please wait. May take several minutes.';

        const { upgrade } = setup();
        await upgrade.run();

        expect(console.log).toHaveBeenCalledWith(
          expect.stringContaining(message),
        );
      });

      it('should run npm install', async () => {
        const command = 'npm install';

        const { upgrade } = setup();
        await upgrade.run();

        expect(shelljs.exec).toHaveBeenCalledWith(command);
      });
    });

    it('should display an install message when everything is complete', async () => {
      const oysterVersion = '1.2.3';
      const message = `Upgrade to Oyster version ${oysterVersion} complete`;
      const configRaw = A.configRaw().withOysterVersion(oysterVersion).build();

      const { upgrade } = setup({ configRaw });
      await upgrade.run();

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(message),
      );
    });
  });
});
