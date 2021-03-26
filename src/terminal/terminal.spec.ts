import {Question} from 'inquirer';
import { Terminal } from './terminal';

const findQuestionMatch = (
  questions: Question[],
  name: string,
  type: string,
): Question | undefined => questions.find((v) => v.name === name && v.type === type);

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

    beforeEach(() => {
      _inquirerStub = {
        prompt: jest.fn().mockImplementation(() => Promise.resolve({})),
      };
    });

    describe('keyword conversion', () => {
      const getAnswers = async (keywords: string) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
        _inquirerStub.prompt.mockImplementation(() =>
          Promise.resolve({keywords}));

        const terminal = new Terminal(_inquirerStub);
        return await terminal.askQuestions();
      };

      it('should return an empty array for no keywords', async () => {
        const answers = await getAnswers('');

        expect(answers.keywords)
          .toBe(JSON.stringify([], null, 2));
      });

      it('should return a keyword', async () => {
        const answers = await getAnswers('a');

        expect(answers.keywords)
          .toBe(JSON.stringify(['a'], null, 2));
      });

      it('should return two keyword', async () => {
        const answers = await getAnswers('a, b');

        expect(answers.keywords)
          .toBe(JSON.stringify(['a', 'b'], null, 2));
      });
    });

    describe('ask name', () => {
      it('should ask for the name', async () => {
        const terminal = new Terminal(_inquirerStub);
        await terminal.askName();

        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          _inquirerStub.prompt.mock.calls[0][0],
          'name',
          'input',
        );

        expect(match).not.toBeUndefined();
      });
    });

    describe('question inputs', () => {
      beforeEach(async () => {
        const terminal = new Terminal(_inquirerStub);
        await terminal.askQuestions();
      });

      it('should ask for the display name', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          _inquirerStub.prompt.mock.calls[0][0],
          'displayName',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for the description', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          _inquirerStub.prompt.mock.calls[0][0],
          'description',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for the unity version', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          _inquirerStub.prompt.mock.calls[0][0],
          'version',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for the author name', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          _inquirerStub.prompt.mock.calls[0][0],
          'authorName',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for the author email', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          _inquirerStub.prompt.mock.calls[0][0],
          'authorEmail',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for the author url', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          _inquirerStub.prompt.mock.calls[0][0],
          'authorUrl',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for keywords', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          _inquirerStub.prompt.mock.calls[0][0],
          'keywords',
          'input',
        );

        expect(match).not.toBeUndefined();
      });
    });
  });
});
