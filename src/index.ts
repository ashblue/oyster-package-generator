import * as inquirer from 'inquirer';
import {copyFolder} from './copy-folder/copy-folder';
import {PackageBuilder} from './package-builder/package-builder';
import {Terminal} from './terminal/terminal';

async function runBuild() {
  const terminal = new Terminal(inquirer);
  const packageBuilder = new PackageBuilder(copyFolder, terminal);
  return packageBuilder.Build('src/templates/assets', 'Assets');
}

runBuild();
