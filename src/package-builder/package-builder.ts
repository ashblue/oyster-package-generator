import chalk from 'chalk';
import {
  CopyFolderType,
  FindPreExistingFilesType,
  ICopyFolderOptions,
  IKeyValuePair,
} from '../copy-folder/copy-folder';
import { GitDetector } from '../git-detector/git-detector';
import { Terminal } from '../terminal/terminal';

export class PackageBuilder {
  private readonly _copyFolder: CopyFolderType;
  private readonly _terminal: Terminal;
  private readonly _gitDetector: GitDetector;
  private readonly _findPreExistingFiles: FindPreExistingFilesType;

  constructor(
    copyFolder: CopyFolderType,
    findPreExistingFiles: FindPreExistingFilesType,
    terminal: Terminal,
    gitDetector: GitDetector) {
    this._copyFolder = copyFolder;
    this._findPreExistingFiles = findPreExistingFiles;
    this._terminal = terminal;
    this._gitDetector = gitDetector;
  }

  public async build(source: string, destination: string): Promise<boolean> {
    const isGitRepo = await this.verifyGitRepo();
    if (!isGitRepo) {
      return false;
    }

    const name = await this._terminal.askName();
    const fileDuplicates = this._findPreExistingFiles(
      source,
      destination,
      [{variable: 'name', value: name}]);

    if (fileDuplicates.length > 0) {
      this.printDuplicatesMessage(fileDuplicates);
      return false;
    }

    const answers = await this._terminal.askQuestions();
    answers.name = name;

    const replaceVariables: IKeyValuePair[] = [
      {
        value: name.split('.', 2).join('.'),
        variable: 'packageScope',
      },
      {
        value: new Date().getFullYear().toString(),
        variable: 'year',
      },
      // Because NPM doesn't include .gitignore files
      {
        value: '.gitignore',
        variable: 'gitignore',
      },
    ];

    const gitDetails = await this._gitDetector.getDetails();
    Object.keys(gitDetails).forEach((key) => {
      replaceVariables.push({
        value: gitDetails[key],
        variable: key,
      });
    });

    for (const key in answers) {
      if (!key) {
        continue;
      }

      const value: string = answers[key];
      replaceVariables.push({
        value,
        variable: key,
      });
    }

    const options: ICopyFolderOptions = {replaceVariables};
    await this._copyFolder(source, destination, options);

    this.printResultsMessage();

    return true;
  }

  private async verifyGitRepo(): Promise<boolean> {
    const gitRepo = await this._gitDetector.checkIfGitRepo();
    if (!gitRepo.isGitRepo) {
      console.log(chalk.redBright('Aborting package generation'));
      console.log(chalk.yellow('Please ensure this is a Git repo with the origin remote properly set'));
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
