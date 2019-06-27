import {Question} from 'inquirer';
import { Terminal } from './terminal';

function findQuestionMatch(questions: Question[], name: string, type: string): Question | undefined {
  return questions.find((v) => {
    if (v.name === name && v.type === type) {
      return true;
    }

    return false;
  });
}

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
      const match = findQuestionMatch(
        _inquirerStub.prompt.mock.calls[0][0],
        'name',
        'input',
        );

      expect(match).not.toBeUndefined();
    });

    it('should ask for the display name', () => {
      const match = findQuestionMatch(
        _inquirerStub.prompt.mock.calls[0][0],
        'displayName',
        'input',
      );

      expect(match).not.toBeUndefined();
    });

    it('should ask for the description', () => {
      const match = findQuestionMatch(
        _inquirerStub.prompt.mock.calls[0][0],
        'description',
        'input',
      );

      expect(match).not.toBeUndefined();
    });

    it('should ask for the unity version', () => {
      const match = findQuestionMatch(
        _inquirerStub.prompt.mock.calls[0][0],
        'version',
        'input',
      );

      expect(match).not.toBeUndefined();
    });

    it('should ask for the author name', () => {
      const match = findQuestionMatch(
        _inquirerStub.prompt.mock.calls[0][0],
        'authorName',
        'input',
      );

      expect(match).not.toBeUndefined();
    });

    it('should ask for the author email', () => {
      const match = findQuestionMatch(
        _inquirerStub.prompt.mock.calls[0][0],
        'authorEmail',
        'input',
      );

      expect(match).not.toBeUndefined();
    });

    it('should ask for the author url', () => {
      const match = findQuestionMatch(
        _inquirerStub.prompt.mock.calls[0][0],
        'authorUrl',
        'input',
      );

      expect(match).not.toBeUndefined();
    });
  });
});
