import chalk from 'chalk';
import {
  copyFolderType,
  ICopyFolderOptions,
  ICopyFolderResults,
  ICopyLocation,
  IKeyValuePair,
} from '../copy-folder/copy-folder';
import {Terminal} from '../terminal/terminal';

export class PackageBuilder {
  private readonly _copyFolder: copyFolderType;
  private readonly _terminal: Terminal;

  constructor(copyFolder: copyFolderType, terminal: Terminal) {
    this._copyFolder = copyFolder;
    this._terminal = terminal;
  }

  public async Build(locations: ICopyLocation[]) {
    const answers = await this._terminal.askQuestions();

    const replaceVariables: IKeyValuePair[] = [
      {
        value: answers.name.split('.', 2).join('.'),
        variable: 'packageScope',
      },
    ];
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
