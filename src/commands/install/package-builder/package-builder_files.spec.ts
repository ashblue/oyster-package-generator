import chalk from 'chalk';
import path from 'path';
import {
  ICopyFolderResults,
  IKeyValuePair,
} from '../../shared/copy-folder/copy-folder';
import { IGitDetails, IRepoStatus } from '../git-detector/git-detector';
import PackageBuilder from './package-builder';
import Mock = jest.Mock;

const findVariableMatch = (
  variables: IKeyValuePair[],
  variable: string,
  value: string,
): IKeyValuePair | undefined =>
  variables.find((v: IKeyValuePair) => v.key === variable && v.value === value);

/**
 * This test suite was written with older standards without mocks, spies, and stubs. Move tests
 * over to the non deprecated child test file
 */
describe('PackageBuilder class', () => {
  describe('build method', () => {
    let _packageBuilder: PackageBuilder;
    let _consoleSpy: jest.SpyInstance;
    let _copyFolder: Mock;
    let _findPreExistingFiles: Mock;
    let _terminal: any;
    let _gitDetector: any;

    const SOURCE = 'src/templates';
    const DESTINATION = path.resolve(
      __dirname,
      '../../../../tmp/package-builder-test',
    );

    beforeEach(() => {
      _gitDetector = {
        checkIfGitRepo: jest.fn().mockImplementation(() =>
          Promise.resolve({
            isGitRepo: true,
            message: 'null',
          } as IRepoStatus),
        ),
        getDetails: jest.fn().mockImplementation(() => Promise.resolve({})),
      };

      _consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      _copyFolder = jest.fn().mockImplementation(() =>
        Promise.resolve({
          skippedFilePaths: [],
        } as ICopyFolderResults),
      );

      _findPreExistingFiles = jest.fn().mockImplementation(() => []);

      _terminal = {
        askName: jest.fn().mockImplementation(() => Promise.resolve('com.a.b')),
        askQuestions: jest.fn().mockImplementation(() =>
          Promise.resolve({
            displayName: 'A B',
          }),
        ),
      };

      _packageBuilder = new PackageBuilder(
        _copyFolder,
        _findPreExistingFiles,
        _terminal,
        _gitDetector,
        { generate: jest.fn() } as any,
      );
    });

    describe('build method', () => {
      describe('standard run', () => {
        beforeEach(async () => {
          await _packageBuilder.build(SOURCE, DESTINATION);
        });

        it('should give the copy folder a source and destination', () => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(_copyFolder.mock.calls[0][0]).toEqual(SOURCE);

          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(_copyFolder.mock.calls[0][1]).toEqual(DESTINATION);
        });

        it('should add a replace variable to copyFolder for packageScope', () => {
          const match = findVariableMatch(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            _copyFolder.mock.calls[0][2].replaceVariables,
            'packageScope',
            'com.a',
          );

          expect(match).not.toBeUndefined();
        });

        it('should add a replace variable to copyFolder for .gitignore', () => {
          const match = findVariableMatch(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            _copyFolder.mock.calls[0][2].replaceVariables,
            'gitignore',
            '.gitignore',
          );

          expect(match).not.toBeUndefined();
        });

        it('should add a replace variable to copyFolder for year', () => {
          const match = findVariableMatch(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            _copyFolder.mock.calls[0][2].replaceVariables,
            'year',
            new Date().getFullYear().toString(),
          );

          expect(match).not.toBeUndefined();
        });
      });

      it('should combine terminal answers as variable replacement options on copyFolder', async () => {
        // eslint-disable-next-line max-len
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
        const name: string = await _terminal.askName();
        const replaceVariables: IKeyValuePair[] = [
          {
            value: 'a',
            key: 'authorName',
          },
        ];

        const answers = replaceVariables.reduce(
          (map: { [key: string]: any }, obj) => {
            map[obj.key] = obj.value;
            return map;
          },
          {},
        );

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        _terminal.askQuestions.mockImplementation(() =>
          Promise.resolve(answers),
        );
        await _packageBuilder.build(SOURCE, DESTINATION);

        const matchA = findVariableMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          _copyFolder.mock.calls[0][2].replaceVariables,
          'packageName',
          name,
        );

        expect(matchA).not.toBeUndefined();

        const matchB = findVariableMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          _copyFolder.mock.calls[0][2].replaceVariables,
          replaceVariables[0].key,
          replaceVariables[0].value,
        );

        expect(matchB).not.toBeUndefined();
      });

      it('should pass git detector data as replace variables', async () => {
        const results: IGitDetails = {
          gitUrl: 'a',
          gitUrlNoHttp: 'b',
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        _gitDetector.getDetails.mockImplementation(() =>
          Promise.resolve(results),
        );

        await _packageBuilder.build(SOURCE, DESTINATION);

        const replacements = Object.keys(results).map(
          (key) =>
            ({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              value: (results as any)[key] as string,
              key,
            } as IKeyValuePair),
        );

        replacements.forEach((replace) => {
          const match = findVariableMatch(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            _copyFolder.mock.calls[0][2].replaceVariables,
            replace.key,
            replace.value,
          );

          expect(match).not.toBeUndefined();
        });
      });

      it('should not ask questions if the repo is not a git repository', async () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        _gitDetector.checkIfGitRepo.mockImplementation(() =>
          Promise.resolve({
            isGitRepo: false,
            message: '',
          }),
        );

        await _packageBuilder.build(SOURCE, DESTINATION);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(_terminal.askQuestions).not.toHaveBeenCalled();
      });

      describe('duplicate files found', () => {
        beforeEach(async () => {
          _findPreExistingFiles.mockImplementation(() => ['a']);
          await _packageBuilder.build(SOURCE, DESTINATION);
        });

        it('should ask for the name', () => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(_terminal.askName).toHaveBeenCalled();
        });

        it('should not ask full questions', () => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(_terminal.askQuestions).not.toHaveBeenCalled();
        });

        it('should print a message that duplicate files were found', () => {
          expect(_consoleSpy).toHaveBeenCalledWith(
            chalk.yellow('Files discovered with matching names.'),
          );
        });

        it('should print all duplicate files found', () => {
          expect(_consoleSpy).toHaveBeenCalledWith(chalk.yellow('- a'));
        });
      });

      it('should print a success message', async () => {
        await _packageBuilder.build(SOURCE, DESTINATION);

        expect(_consoleSpy).toHaveBeenCalledWith(
          chalk.green('Package generation complete'),
        );
      });
    });
  });
});
