const gitRemoteOriginUrl = require('git-remote-origin-url');

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

  return packageBuilder.Build([
    {
      destination: 'Assets',
      source: path.resolve(__dirname, '../src/templates/assets'),
    },
    {
      destination: './',
      source: path.resolve(__dirname, '../src/templates/root'),
    },
  ]);
}

runBuild();
