import Mock = jest.Mock;
import chalk from 'chalk';
import {ICopyFolderResults, ICopyLocation, IKeyValuePair} from '../copy-folder/copy-folder';
import {IGitDetails, IRepoStatus} from '../git-detector/git-detector';
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
    let _packageBuilder: PackageBuilder;
    let _consoleSpy: jest.SpyInstance;
    let _copyFolder: Mock;
    let _terminal: any;
    let _gitDetector: any;

    const SOURCE = 'src/templates/assets';
    const DESTINATION = 'dist/Assets';
    const LOCATION: ICopyLocation[] = [{
      destination: DESTINATION,
      source: SOURCE,
    }];

    beforeEach(() => {
      _gitDetector = {
        checkIfGitRepo: jest.fn()
          .mockImplementation(() => Promise.resolve({
            isGitRepo: true,
            message: 'null',
          } as IRepoStatus)),
        getDetails: jest.fn()
          .mockImplementation(() => Promise.resolve({})),
      };

      _consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      _copyFolder = jest.fn().mockImplementation(() => Promise.resolve({
        skippedFilePaths: [],
      } as ICopyFolderResults));

      _terminal = {
        askQuestions: jest.fn().mockImplementation(() => Promise.resolve({
          name: 'com.a.b',
        })),
      };

      _packageBuilder = new PackageBuilder(_copyFolder, _terminal, _gitDetector);
    });

    describe('standard run', () => {
      beforeEach(async () => {
        await _packageBuilder.Build(LOCATION);
      });

      it('should give the copy folder a source and destination', async () => {
        expect(_copyFolder.mock.calls[0][0])
          .toMatchObject(LOCATION);
      });

      it('should add a replace variable to copyFolder for packageScope', async () => {
        const match = findVariableMatch(
          _copyFolder.mock.calls[0][1].replaceVariables,
          'packageScope',
          'com.a');

        expect(match).not.toBeUndefined();
      });

      it('should add a replace variable to copyFolder for year', async () => {
        const match = findVariableMatch(
          _copyFolder.mock.calls[0][1].replaceVariables,
          'year',
          new Date().getFullYear().toString());

        expect(match).not.toBeUndefined();
      });
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
      await _packageBuilder.Build(LOCATION);

      const match = findVariableMatch(
        _copyFolder.mock.calls[0][1].replaceVariables,
        replaceVariables[0].variable,
        replaceVariables[0].value);

      expect(match).not.toBeUndefined();
    });

    it('should pass git detector data as replace variables', async () => {
      const results: IGitDetails = {
        gitUrl: 'a',
        gitUrlNoHttp: 'b',
      };
      _gitDetector.getDetails
        .mockImplementation(() => Promise.resolve(results));

      await _packageBuilder.Build(LOCATION);

      const replacements = Object.keys(results).map((key) => {
        return {
          // @ts-ignore
          value: results[key],
          variable: key,
        } as IKeyValuePair;
      });

      replacements.forEach((replace) => {
        const match = findVariableMatch(
          _copyFolder.mock.calls[0][1].replaceVariables,
          replace.variable,
          replace.value);

        expect(match).not.toBeUndefined();
      });
    });

    it('should not ask questions if the repo is not a git repository', async () => {
      _gitDetector.checkIfGitRepo.mockImplementation(() => Promise.resolve({
        isGitRepo: false,
        message: '',
      }));

      await _packageBuilder.Build(LOCATION);

      expect(_terminal.askQuestions).not.toHaveBeenCalled();
    });

    describe('when discovering duplicate files', () => {
      it('should print a message that duplicate files were found', async () => {
        _copyFolder.mockImplementation(() => Promise.resolve({
          skippedFilePaths: ['a'],
        } as ICopyFolderResults));

        await _packageBuilder.Build(LOCATION);

        expect(_consoleSpy).toHaveBeenCalledWith(
          chalk.yellow('Files discovered with matching names.'));
      });

      it('should print all duplicate files found', async () => {
        _copyFolder.mockImplementation(() => Promise.resolve({
          skippedFilePaths: ['a'],
        } as ICopyFolderResults));

        await _packageBuilder.Build(LOCATION);

        expect(_consoleSpy).toHaveBeenCalledWith(chalk.yellow('- a'));
      });

      it('should print a success message if no duplicates were found', async () => {
        await _packageBuilder.Build(LOCATION);

        expect(_consoleSpy).toHaveBeenCalledWith(
          chalk.green('Package generation complete'));
      });
    });
  });
});
