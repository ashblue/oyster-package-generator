import path from 'path';
import del from 'del';
import chalk from 'chalk';
import { Repository } from 'nodegit';
import { exec } from 'shelljs';
import { IConfigManager } from '../shared/config/manager/config-manager';
import IConfig from '../shared/config/i-config';
import { copyFileFolder } from '../shared/copy-folder/copy-folder';
import { getReplacementKeyValuePairs } from '../shared/replacement-variables/replacement-variables';

export default class CommandUpgrade {
  private _configManager: IConfigManager;

  private _targetFiles = [
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

  constructor(config: IConfigManager) {
    this._configManager = config;
  }

  public async run(): Promise<void> {
    const isModified = await this.getIsRepoModified();
    if (isModified) {
      const isModifiedErrorMessage = chalk.yellow(
        'Active changes detected in your Git files. Please commit your files and try again.',
      );
      console.error(isModifiedErrorMessage);
      return;
    }

    const config = this.getConfig();
    if (!config) {
      const noConfigMessage = chalk.yellow(
        'No .oyster.json file detected. Please add one and try again',
      );
      console.error(noConfigMessage);
      return;
    }

    del.sync(this._targetFiles);
    await this.copyFiles(config);

    const installingMessage = chalk.yellow(
      'Re-installing packages, please wait. May take several minutes.',
    );
    console.log(installingMessage);
    exec('npm install');

    const completeMessage = chalk.green(
      `Upgrade to Oyster version ${config.oysterVersion} complete`,
    );
    console.log(completeMessage);
  }

  private async getIsRepoModified() {
    const repo = await Repository.open('.git');
    const status = await repo.getStatus();

    return status.length > 0;
  }

  private getConfig() {
    const config = this._configManager.read();
    if (!config) return null;

    config.syncVersion();
    return config;
  }

  private async copyFiles(config: IConfig) {
    const replaceVariables = getReplacementKeyValuePairs(config);
    const sourcePath = path.resolve(__dirname, './../../../src/templates');
    const destinationPath = '.';

    for (const file of this._targetFiles) {
      let src = `${sourcePath}/${file}`;
      const dest = `${destinationPath}/${file}`;

      const infoMsg = chalk.gray(`updating file ${dest}`);
      console.log(infoMsg);

      if (file === '.gitignore') {
        src = `${sourcePath}/{gitignore}`;
      } else if (file === 'package-lock.json') {
        del.sync(dest);
        continue;
      }

      await copyFileFolder(src, dest, { replaceVariables });
    }

    this._configManager.generate(config);
  }
}
