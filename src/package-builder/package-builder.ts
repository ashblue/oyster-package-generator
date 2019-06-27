import chalk from 'chalk';
import {
  copyFolderType,
  ICopyFolderOptions,
  ICopyFolderResults,
  ICopyLocation,
  IKeyValuePair,
} from '../copy-folder/copy-folder';
import {GitDetector} from '../git-detector/git-detector';
import {Terminal} from '../terminal/terminal';

export class PackageBuilder {
  private readonly _copyFolder: copyFolderType;
  private readonly _terminal: Terminal;
  private _gitDetector: GitDetector;

  constructor(copyFolder: copyFolderType, terminal: Terminal, gitDetector: GitDetector) {
    this._copyFolder = copyFolder;
    this._terminal = terminal;
    this._gitDetector = gitDetector;
  }

  public async Build(locations: ICopyLocation[]) {
    const isGitRepo = await this.verifyGitRepo();
    if (!isGitRepo) {
      return;
    }

    const answers = await this._terminal.askQuestions();

    const replaceVariables: IKeyValuePair[] = [
      {
        value: answers.name.split('.', 2).join('.'),
        variable: 'packageScope',
      },
      {
        value: new Date().getFullYear().toString(),
        variable: 'year',
      },
    ];

    const gitDetails = await this._gitDetector.getDetails();
    Object.keys(gitDetails).forEach((key) => {
      replaceVariables.push({
        // @ts-ignore
        value: gitDetails[key],
        variable: key,
      });
    });

    for (const key in answers) {
      if (!key) { continue; }

      // @ts-ignore
      const value: string = answers[key];
      replaceVariables.push({
        value,
        variable: key,
      });
    }

    const options: ICopyFolderOptions = {replaceVariables};
    const copyFolderResults = await this._copyFolder(locations, options);

    this.printResultsMessage(copyFolderResults);
  }

  private async verifyGitRepo(): Promise<boolean> {
    const gitRepo = await this._gitDetector.checkIfGitRepo();
    if (!gitRepo.isGitRepo) {
      // tslint:disable-next-line:no-console
      console.log(chalk.redBright('Aborting package generation'));
      // tslint:disable-next-line:no-console
      console.log(chalk.yellow('Please ensure this is a Git repo with the origin remote properly set'));
    }

    return gitRepo.isGitRepo;
  }

  private printResultsMessage(copyFolderResults: ICopyFolderResults) {
    if (copyFolderResults.skippedFilePaths.length > 0) {
      // tslint:disable-next-line:no-console
      console.log(chalk.redBright('Package generation aborted.'));

      // tslint:disable-next-line:no-console
      console.log(chalk.yellow('Files discovered with matching names.'));

      // tslint:disable-next-line:no-console
      console.log(
        chalk.gray(
          'Please delete listed files and rerun the command. ' +
          'Make sure to backup files before deleting.',
        ),
      );

      copyFolderResults.skippedFilePaths.forEach((f) => {
        // tslint:disable-next-line:no-console
        console.log(chalk.yellow(`- ${f}`));
      });
    } else {
      // tslint:disable-next-line:no-console
      console.log(chalk.green('Package generation complete'));
    }
  }
}
