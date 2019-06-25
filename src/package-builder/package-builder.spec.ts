import {ICopyFolderOptions, IKeyValuePair} from '../copy-folder/copy-folder';
import {PackageBuilder} from './package-builder';
import Mock = jest.Mock;

describe('PackageBuilder', () => {
  describe('Build method', () => {
    let _copyFolder: Mock;

    beforeEach(() => {
      _copyFolder = jest.fn();
    });

    it('should give the copy folder source as src/templates/Assets', async () => {
      const terminal = {
        askQuestions: jest.fn().mockImplementation(() => Promise.resolve({})),
      } as any;
      const packageBuilder = new PackageBuilder(_copyFolder, terminal);
      const source = 'src/templates/assets';

      await packageBuilder.Build(source, '');

      expect(_copyFolder.mock.calls[0][0])
        .toEqual(source);
    });

    it('should give the copyFolder destination of Assets', async () => {
      const terminal = {
        askQuestions: jest.fn().mockImplementation(() => Promise.resolve({})),
      } as any;
      const packageBuilder = new PackageBuilder(_copyFolder, terminal);
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

      const terminal = {
        askQuestions: jest.fn().mockImplementation(() => Promise.resolve(answers)),
      } as any;

      const packageBuilder = new PackageBuilder(_copyFolder, terminal);
      await packageBuilder.Build('', '');

      expect(_copyFolder.mock.calls[0][2])
        .toMatchObject(options);
    });
  });
});
