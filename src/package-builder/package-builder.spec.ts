import Mock = jest.Mock;
import chalk from 'chalk';
import {ICopyFolderResults, IKeyValuePair} from '../copy-folder/copy-folder';
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
    let _findPreExistingFiles: Mock;
    let _terminal: any;
    let _gitDetector: any;

    const SOURCE = 'src/templates';
    const DESTINATION = 'tmp/package-builder-test';

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

      _findPreExistingFiles = jest.fn().mockImplementation(() => []);

      _terminal = {
        askName: jest.fn().mockImplementation(() => Promise.resolve('com.a.b')),
        askQuestions: jest.fn().mockImplementation(() => Promise.resolve({
          displayName: 'A B',
        })),
      };

      _packageBuilder = new PackageBuilder(
        _copyFolder,
        _findPreExistingFiles,
        _terminal,
        _gitDetector);
    });

    describe('standard run', () => {
      beforeEach(async () => {
        await _packageBuilder.Build(SOURCE, DESTINATION);
      });

      it('should give the copy folder a source and destination', async () => {
        expect(_copyFolder.mock.calls[0][0])
          .toEqual(SOURCE);

        expect(_copyFolder.mock.calls[0][1])
          .toEqual(DESTINATION);

      });

      it('should add a replace variable to copyFolder for packageScope', async () => {
        const match = findVariableMatch(
          _copyFolder.mock.calls[0][2].replaceVariables,
          'packageScope',
          'com.a');

        expect(match).not.toBeUndefined();
      });

      it('should add a replace variable to copyFolder for year', async () => {
        const match = findVariableMatch(
          _copyFolder.mock.calls[0][2].replaceVariables,
          'year',
          new Date().getFullYear().toString());

        expect(match).not.toBeUndefined();
      });
    });

    it('should combine terminal answers as variable replacement options on copyFolder', async () => {
      const name = await _terminal.askName();
      const replaceVariables: IKeyValuePair[] = [
        {
          value: 'a',
          variable: 'b',
        },
      ];

      const answers = replaceVariables.reduce((map, obj) => {
        // @ts-ignore
        map[obj.variable] = obj.value;
        return map;
      }, {});

      _terminal.askQuestions.mockImplementation(() => Promise.resolve(answers));
      await _packageBuilder.Build(SOURCE, DESTINATION);

      const matchA = findVariableMatch(
        _copyFolder.mock.calls[0][2].replaceVariables,
        'name',
        name);
      expect(matchA).not.toBeUndefined();

      const matchB = findVariableMatch(
        _copyFolder.mock.calls[0][2].replaceVariables,
        replaceVariables[0].variable,
        replaceVariables[0].value);
      expect(matchB).not.toBeUndefined();
    });

    it('should pass git detector data as replace variables', async () => {
      const results: IGitDetails = {
        gitUrl: 'a',
        gitUrlNoHttp: 'b',
      };
      _gitDetector.getDetails
        .mockImplementation(() => Promise.resolve(results));

      await _packageBuilder.Build(SOURCE, DESTINATION);

      const replacements = Object.keys(results).map((key) => {
        return {
          // @ts-ignore
          value: results[key],
          variable: key,
        } as IKeyValuePair;
      });

      replacements.forEach((replace) => {
        const match = findVariableMatch(
          _copyFolder.mock.calls[0][2].replaceVariables,
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

      await _packageBuilder.Build(SOURCE, DESTINATION);

      expect(_terminal.askQuestions).not.toHaveBeenCalled();
    });

    describe('duplicate files found', () => {
      beforeEach(async () => {
        _findPreExistingFiles.mockImplementation(() => ['a']);
        await _packageBuilder.Build(SOURCE, DESTINATION);
      });

      it('should ask for the name', async () => {
        expect(_terminal.askName).toHaveBeenCalled();
      });

      it('should not ask full questions', async () => {
        expect(_terminal.askQuestions).not.toHaveBeenCalled();
      });

      it('should print a message that duplicate files were found', async () => {
        expect(_consoleSpy).toHaveBeenCalledWith(
          chalk.yellow('Files discovered with matching names.'));
      });

      it('should print all duplicate files found', async () => {
        expect(_consoleSpy).toHaveBeenCalledWith(chalk.yellow('- a'));
      });
    });

    it('should print a success message', async () => {
      await _packageBuilder.Build(SOURCE, DESTINATION);

      expect(_consoleSpy).toHaveBeenCalledWith(
        chalk.green('Package generation complete'));
    });
  });
});
