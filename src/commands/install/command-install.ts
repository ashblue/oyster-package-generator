import path from 'path';
import chalk from 'chalk';
import * as inquirer from 'inquirer';
import { exec } from 'shelljs';
import ConfigManager from '../shared/config/manager/config-manager';
import {
  copyFileFolder,
  findPreExistingFiles,
} from '../shared/copy-folder/copy-folder';
import GitDetector from './git-detector/git-detector';
import InstallQuestions from './install-questions/install-questions';
import PackageBuilder from './package-builder/package-builder';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-var-requires
const gitRemoteOriginUrl = require('git-remote-origin-url');

export default class CommandInstall {
  public async run(): Promise<void> {
    const buildStatus = await this.runPackageBuilder();
    if (!buildStatus) {
      return;
    }

    console.log(
      chalk.yellow(
        'Installing dependencies, please wait. May take several minutes...',
      ),
    );

    exec('npm install');

    console.log(chalk.greenBright('Oyster package generator complete'));
  }

  private runPackageBuilder() {
    const terminal = new InstallQuestions(inquirer);
    const gitDetector = new GitDetector(gitRemoteOriginUrl);
    const configManager = new ConfigManager();
    const packageBuilder = new PackageBuilder(
      copyFileFolder,
      findPreExistingFiles,
      terminal,
      gitDetector,
      configManager,
    );

    return packageBuilder.build(
      path.resolve(__dirname, './../../../src/templates'),
      './',
    );
  }
}
