import Mock = jest.Mock;
import chalk from 'chalk';
import {ICopyFolderOptions, ICopyFolderResults, IKeyValuePair} from '../copy-folder/copy-folder';
import {PackageBuilder} from './package-builder';

describe('PackageBuilder', () => {
  describe('Build method', () => {
    let _consoleSpy: jest.SpyInstance;
    let _copyFolder: Mock;
    let _terminal: any;

    beforeEach(() => {
      _consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      _copyFolder = jest.fn().mockImplementation(() => Promise.resolve({
        skippedFilePaths: [],
      } as ICopyFolderResults));

      _terminal = {
        askQuestions: jest.fn().mockImplementation(() => Promise.resolve({})),
      };
    });

    it('should give the copy folder source as src/templates/Assets', async () => {
      const packageBuilder = new PackageBuilder(_copyFolder, _terminal);
      const source = 'src/templates/assets';

      await packageBuilder.Build(source, '');

      expect(_copyFolder.mock.calls[0][0])
        .toEqual(source);
    });

    it('should give the copyFolder destination of Assets', async () => {
      const packageBuilder = new PackageBuilder(_copyFolder, _terminal);
      const destination = 'dist/Assets';

      await packageBuilder.Build('', destination);

      expect(_copyFolder.mock.calls[0][1])
        .toEqual(destination);
    });

    it('should send terminal answers as variable replacement option on copyFolder', async () => {
      const replaceVariables: IKeyValuePair[] = [
        {
          value: 'a',
          variable: 'name',
        },
      ];

      const options: ICopyFolderOptions = {
        replaceVariables,
      };

      const answers = replaceVariables.reduce((map, obj) => {
        // @ts-ignore
        map[obj.variable] = obj.value;
        return map;
      }, {});

      _terminal.askQuestions.mockImplementation(() => Promise.resolve(answers));
      const packageBuilder = new PackageBuilder(_copyFolder, _terminal);
      await packageBuilder.Build('', '');

      expect(_copyFolder.mock.calls[0][2])
        .toMatchObject(options);
    });

    describe('when discovering duplicate files', () => {
      it('should print a message that duplicate files were found', async () => {
        _copyFolder.mockImplementation(() => Promise.resolve({
          skippedFilePaths: ['a'],
        } as ICopyFolderResults));

        const packageBuilder = new PackageBuilder(_copyFolder, _terminal);
        const source = 'src/templates/assets';

        await packageBuilder.Build(source, '');

        expect(_consoleSpy).toHaveBeenCalledWith(
          chalk.yellow('Files discovered with matching names.'));
      });

      it('should print all duplicate files found', async () => {
        _copyFolder.mockImplementation(() => Promise.resolve({
          skippedFilePaths: ['a'],
        } as ICopyFolderResults));

        const packageBuilder = new PackageBuilder(_copyFolder, _terminal);
        const source = 'src/templates/assets';

        await packageBuilder.Build(source, '');

        expect(_consoleSpy).toHaveBeenCalledWith(chalk.yellow('- a'));
      });

      it('should print a success message if no duplicates were found', async () => {
        const packageBuilder = new PackageBuilder(_copyFolder, _terminal);
        const source = 'src/templates/assets';

        await packageBuilder.Build(source, '');

        expect(_consoleSpy).toHaveBeenCalledWith(
          chalk.green('Package generation complete'));
      });
    });
  });
});
