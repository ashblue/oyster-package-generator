const gitRemoteOriginUrl = require('git-remote-origin-url');

import * as inquirer from 'inquirer';
import {copyFolder} from './copy-folder/copy-folder';
import {GitDetector} from './git-detector/git-detector';
import {PackageBuilder} from './package-builder/package-builder';
import {Terminal} from './terminal/terminal';

async function runBuild() {
  const terminal = new Terminal(inquirer);
  const gitDetector = new GitDetector(gitRemoteOriginUrl);
  const packageBuilder = new PackageBuilder(copyFolder, terminal, gitDetector);
  return packageBuilder.Build([
    {
      destination: 'Assets',
      source: 'src/templates/assets',
    },
  ]);
}

runBuild();
