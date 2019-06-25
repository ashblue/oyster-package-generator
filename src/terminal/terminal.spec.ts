import chalk from 'chalk';
import { Terminal } from './terminal';

describe('Terminal', () => {
  describe('requiredString method', () => {
    it('should return true if string is not empty', () => {
       expect(Terminal.requiredString('a')).toBeTruthy();
    });

    it('should return false if string is empty', () => {
      expect(Terminal.requiredString('')).toBeFalsy();
    });

    it('should return false if string is empty after trimming', () => {
      expect(Terminal.requiredString(' ')).toBeFalsy();
    });
  });

  describe('askQuestions method', () => {
    let _inquirerStub: any;

    beforeEach(async () => {
      _inquirerStub = {
        prompt: jest.fn().mockImplementation(() => Promise.resolve({})),
      };

      const terminal = new Terminal(_inquirerStub);
      await terminal.askQuestions();
    });

    it('should ask for the name', () => {
      const packageNameFormat = chalk.blue('com.<company-name>.<package-name>');
      const packageNameExample = chalk.blue('com.unity.timeline');

      expect(_inquirerStub.prompt.mock.calls[0][0][0])
        .toMatchObject({
          message: `Package name? Internal ID that's permanent. Example ${packageNameFormat} or ${packageNameExample}`,
          name: 'name',
          type: 'input',
          validate: Terminal.requiredString,
        });
    });

    it('should ask for the display name', () => {
      const example = chalk.blue('Unity Timeline');
      const exampleAlt = chalk.blue('ProBuilder');

      expect(_inquirerStub.prompt.mock.calls[0][0][1])
        .toMatchObject({
          message: `Package display name? Should be user-friendly. Example ${example} or ${exampleAlt}`,
          name: 'displayName',
          type: 'input',
          validate: Terminal.requiredString,
        });
    });

    it('should ask for the description', () => {
      expect(_inquirerStub.prompt.mock.calls[0][0][2])
        .toMatchObject({
          message: `Package description?. Will appear in the package manager window`,
          name: 'description',
          type: 'input',
        });
    });

    it('should ask for the unity version', () => {
      const example = chalk.blue('2019.1');

      expect(_inquirerStub.prompt.mock.calls[0][0][3])
        .toMatchObject({
          message: `Minimum Unity version?. No version indicates all versions of Unity. Example ${example}`,
          name: 'version',
          type: 'input',
        });
    });
  });
});
