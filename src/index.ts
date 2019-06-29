const gitRemoteOriginUrl = require('git-remote-origin-url');
const shell = require('shelljs');

import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as path from 'path';
import {copyFolder, findPreExistingFiles} from './copy-folder/copy-folder';
import {GitDetector} from './git-detector/git-detector';
import {PackageBuilder} from './package-builder/package-builder';
import {Terminal} from './terminal/terminal';

async function runBuild() {
  const terminal = new Terminal(inquirer);
  const gitDetector = new GitDetector(gitRemoteOriginUrl);
  const packageBuilder = new PackageBuilder(
    copyFolder, findPreExistingFiles, terminal, gitDetector);

  return packageBuilder.Build(
    path.resolve(__dirname, '../src/templates'),
    './',
  );
}

async function init() {
  const buildStatus = await runBuild();
  if (!buildStatus) {
    return;
  }

  // tslint:disable-next-line:no-console
  console.log(chalk.yellow('Installing dependencies, please wait. ' +
    'May take several minutes...'));

  shell.exec('npm install');

  // tslint:disable-next-line:no-console
  console.log(chalk.greenBright('Oyster package generator complete'));
}

init();
