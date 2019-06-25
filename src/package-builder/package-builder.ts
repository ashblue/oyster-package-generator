import {copyFolderType, ICopyFolderOptions, IKeyValuePair} from '../copy-folder/copy-folder';
import {Terminal} from '../terminal/terminal';

export class PackageBuilder {
  private readonly _copyFolder: copyFolderType;
  private readonly _terminal: Terminal;

  constructor(copyFolder: copyFolderType, terminal: Terminal) {
    this._copyFolder = copyFolder;
    this._terminal = terminal;
  }

  public async Build(source: string, destination: string) {
    const answers = await this._terminal.askQuestions();

    const replaceVariables: IKeyValuePair[] = [];
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

    await this._copyFolder(source, destination, options);
  }
}
