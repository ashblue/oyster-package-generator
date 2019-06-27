import Mock = jest.Mock;
import chalk from 'chalk';
import {ICopyFolderResults, ICopyLocation, IKeyValuePair} from '../copy-folder/copy-folder';
import {PackageBuilder} from './package-builder';

function findVariableMatch(variables: IKeyValuePair[], variable: string, value: string): IKeyValuePair | undefined {
  return variables.find((v: IKeyValuePair) => {
      if (v.variable === variable && v.value === value) {
        return true;
      }

      return false;
    });
}

describe('PackageBuilder', () => {
  describe('Build method', () => {
    let _consoleSpy: jest.SpyInstance;
    let _copyFolder: Mock;
    let _terminal: any;

    const SOURCE = 'src/templates/assets';
    const DESTINATION = 'dist/Assets';
    const LOCATION: ICopyLocation[] = [{
      destination: DESTINATION,
      source: SOURCE,
    }];

    beforeEach(() => {
      _consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      _copyFolder = jest.fn().mockImplementation(() => Promise.resolve({
        skippedFilePaths: [],
      } as ICopyFolderResults));

      _terminal = {
        askQuestions: jest.fn().mockImplementation(() => Promise.resolve({
          name: 'com.a.b',
        })),
      };
    });

    it('should give the copy folder a source and destination', async () => {
      const packageBuilder = new PackageBuilder(_copyFolder, _terminal);

      await packageBuilder.Build(LOCATION);

      expect(_copyFolder.mock.calls[0][0])
        .toMatchObject(LOCATION);
    });

    it('should add a replace variable to copyFolder for packageScope', async () => {
      const packageBuilder = new PackageBuilder(_copyFolder, _terminal);

      await packageBuilder.Build(LOCATION);

      const match = findVariableMatch(
        _copyFolder.mock.calls[0][1].replaceVariables,
        'packageScope',
        'com.a');

      expect(match).not.toBeUndefined();
    });

    it('should add a replace variable to copyFolder for year', async () => {
      const packageBuilder = new PackageBuilder(_copyFolder, _terminal);

      await packageBuilder.Build(LOCATION);

      const match = findVariableMatch(
        _copyFolder.mock.calls[0][1].replaceVariables,
        'year',
        new Date().getFullYear().toString());

      expect(match).not.toBeUndefined();
    });

    it('should send terminal answers as variable replacement option on copyFolder', async () => {
      const replaceVariables: IKeyValuePair[] = [
        {
          value: 'a',
          variable: 'name',
        },
      ];

      const answers = replaceVariables.reduce((map, obj) => {
        // @ts-ignore
        map[obj.variable] = obj.value;
        return map;
      }, {});

      _terminal.askQuestions.mockImplementation(() => Promise.resolve(answers));
      const packageBuilder = new PackageBuilder(_copyFolder, _terminal);
      await packageBuilder.Build(LOCATION);

      const match = findVariableMatch(
        _copyFolder.mock.calls[0][1].replaceVariables,
        replaceVariables[0].variable,
        replaceVariables[0].value);

      expect(match).not.toBeUndefined();
    });

    describe('when discovering duplicate files', () => {
      it('should print a message that duplicate files were found', async () => {
        _copyFolder.mockImplementation(() => Promise.resolve({
          skippedFilePaths: ['a'],
        } as ICopyFolderResults));

        const packageBuilder = new PackageBuilder(_copyFolder, _terminal);
        await packageBuilder.Build(LOCATION);

        expect(_consoleSpy).toHaveBeenCalledWith(
          chalk.yellow('Files discovered with matching names.'));
      });

      it('should print all duplicate files found', async () => {
        _copyFolder.mockImplementation(() => Promise.resolve({
          skippedFilePaths: ['a'],
        } as ICopyFolderResults));

        const packageBuilder = new PackageBuilder(_copyFolder, _terminal);

        await packageBuilder.Build(LOCATION);

        expect(_consoleSpy).toHaveBeenCalledWith(chalk.yellow('- a'));
      });

      it('should print a success message if no duplicates were found', async () => {
        const packageBuilder = new PackageBuilder(_copyFolder, _terminal);

        await packageBuilder.Build(LOCATION);

        expect(_consoleSpy).toHaveBeenCalledWith(
          chalk.green('Package generation complete'));
      });
    });
  });
});
