import chalk from 'chalk';
import Config from '../../shared/config/config';
import ConfigManager from '../../shared/config/manager/config-manager';
import {
  CopyFolderType,
  FindPreExistingFilesType,
} from '../../shared/copy-folder/copy-folder';
import { getReplacementKeyValuePairs } from '../../shared/replacement-variables/replacement-variables';
import GitDetector from '../git-detector/git-detector';
import InstallQuestions from '../install-questions/install-questions';

export default class PackageBuilder {
  private readonly _copyFolder: CopyFolderType;
  private readonly _terminal: InstallQuestions;
  private readonly _gitDetector: GitDetector;
  private readonly _findPreExistingFiles: FindPreExistingFilesType;
  private readonly _config: ConfigManager;

  constructor(
    copyFolder: CopyFolderType,
    findPreExistingFiles: FindPreExistingFilesType,
    terminal: InstallQuestions,
    gitDetector: GitDetector,
    config: ConfigManager,
  ) {
    this._copyFolder = copyFolder;
    this._findPreExistingFiles = findPreExistingFiles;
    this._terminal = terminal;
    this._gitDetector = gitDetector;
    this._config = config;
  }

  public async build(source: string, destination: string): Promise<boolean> {
    const isGitRepo = await this.verifyGitRepo();
    if (!isGitRepo) {
      return false;
    }

    const packageName = await this._terminal.askName();
    const fileDuplicates = this._findPreExistingFiles(source, destination, [
      { key: 'packageName', value: packageName },
    ]);

    if (fileDuplicates.length > 0) {
      this.printDuplicatesMessage(fileDuplicates);
      return false;
    }

    const config = await this.createConfig(packageName);
    const replaceVariables = getReplacementKeyValuePairs(config);

    await this._copyFolder(source, destination, { replaceVariables });
    this._config.generate(config);
    this.printResultsMessage();

    return true;
  }

  private async createConfig(packageName: string) {
    const answers = await this._terminal.askQuestions();
    const packageScope = packageName.split('.', 2).join('.');
    const gitDetails = await this._gitDetector.getDetails();
    const {
      displayName,
      description,
      unityVersion,
      keywords,
      authorName,
      authorUrl,
      authorEmail,
    } = answers;

    const config = new Config({
      packageName,
      displayName,
      description,
      oysterVersion: 'empty',
      unityVersion,
      packageScope,
      keywords,

      author: {
        name: authorName,
        url: authorUrl,
        email: authorEmail,
      },

      repo: {
        ...gitDetails,
      },
    });

    config.syncVersion();

    return config;
  }

  private async verifyGitRepo(): Promise<boolean> {
    const gitRepo = await this._gitDetector.checkIfGitRepo();
    if (!gitRepo.isGitRepo) {
      console.log(chalk.redBright('Aborting package generation'));
      console.log(
        chalk.yellow(
          'Please ensure this is a Git repo with the origin remote properly set',
        ),
      );
    }

    return gitRepo.isGitRepo;
  }

  private printDuplicatesMessage(duplicates: string[]) {
    console.log(chalk.redBright('Package generation aborted.'));
    console.log(chalk.yellow('Files discovered with matching names.'));

    console.log(
      chalk.gray(
        'Please delete listed files and rerun the command. ' +
          'Make sure to backup files before deleting.',
      ),
    );

    duplicates.forEach((f) => {
      console.log(chalk.yellow(`- ${f}`));
    });
  }

  private printResultsMessage() {
    console.log(chalk.green('Package generation complete'));
  }
}
