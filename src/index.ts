import * as path from 'path';
import chalk from 'chalk';
import * as inquirer from 'inquirer';
import {copyFolder, findPreExistingFiles} from './copy-folder/copy-folder';
import {GitDetector} from './git-detector/git-detector';
import {PackageBuilder} from './package-builder/package-builder';
import {Terminal} from './terminal/terminal';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const shell = require('shelljs');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const gitRemoteOriginUrl = require('git-remote-origin-url');

const runBuild = async () => {
  const terminal = new Terminal(inquirer);
  const gitDetector = new GitDetector(gitRemoteOriginUrl);
  const packageBuilder = new PackageBuilder(
    copyFolder, findPreExistingFiles, terminal, gitDetector);

  return packageBuilder.build(
    path.resolve(__dirname, '../src/templates'),
    './',
  );
};

const init = async () => {
  const buildStatus = await runBuild();
  if (!buildStatus) {
    return;
  }

  console.log(chalk.yellow('Installing dependencies, please wait. ' +
    'May take several minutes...'));

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
  shell.exec('npm install');

  console.log(chalk.greenBright('Oyster package generator complete'));
};

void init();
