import chalk from 'chalk';
import { readFileSync } from 'fs';
import { IGitDetector } from '../install/git-detector/git-detector';
import Config from '../shared/config/config';
import { IConfigManager } from '../shared/config/manager/config-manager';
import { IBuiltPackageJson } from '../shared/i-built-package-json';

export default class CommandGenerateConfig {
  constructor(
    private _configManager: IConfigManager,
    private _gitDetector: IGitDetector,
  ) {}

  public async run(): Promise<void> {
    const startMessage = chalk.blue(
      'Attempting to generate an .oyster.json file',
    );
    console.log(startMessage);

    const packageJsonRaw = readFileSync('package.json').toString();
    const packageJson = JSON.parse(packageJsonRaw) as IBuiltPackageJson;

    const repo = await this._gitDetector.getDetails();

    const packageScopeParts = packageJson.name.split('.');
    packageScopeParts.pop();
    const packageScope = packageScopeParts.join('.');

    const config = new Config({
      packageName: packageJson.name,
      packageScope,
      repo,
      displayName: packageJson.displayName,
      description: packageJson.description,
      unityVersion: packageJson.unity,
      oysterVersion: '',
      keywords: packageJson.keywords,
      author: packageJson.author,
    });

    config.syncVersion();

    this._configManager.generate(config);

    const successMessage = chalk.green(
      '.oyster.json file successfully created',
    );
    console.log(successMessage);
  }
}
