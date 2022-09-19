import { Question } from 'inquirer';
import InstallQuestions from './install-questions';

const findQuestionMatch = (
  questions: Question[],
  name: string,
  type: string,
): Question | undefined =>
  questions.find((v) => v.name === name && v.type === type);

describe('InstallQuestions class', () => {
  describe('requiredString method', () => {
    it('should return true if string is not empty', () => {
      expect(InstallQuestions.requiredString('a')).toBeTruthy();
    });

    it('should return false if string is empty', () => {
      expect(InstallQuestions.requiredString('')).toBeFalsy();
    });

    it('should return false if string is empty after trimming', () => {
      expect(InstallQuestions.requiredString(' ')).toBeFalsy();
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
          Promise.resolve({ keywords }),
        );

        const terminal = new InstallQuestions(_inquirerStub);
        return await terminal.askQuestions();
      };

      it('should return an empty array for no keywords', async () => {
        const answers = await getAnswers('');

        expect(answers.keywords).toEqual([]);
      });

      it('should return a keyword', async () => {
        const answers = await getAnswers('a');

        expect(answers.keywords).toEqual(['a']);
      });

      it('should return two keyword', async () => {
        const answers = await getAnswers('a, b');

        expect(answers.keywords).toEqual(['a', 'b']);
      });
    });

    describe('ask name', () => {
      it('should ask for the name', async () => {
        const terminal = new InstallQuestions(_inquirerStub);
        await terminal.askName();

        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          _inquirerStub.prompt.mock.calls[0][0],
          'name',
          'input',
        );

        expect(match).not.toBeUndefined();
      });
    });

    describe('question inputs', () => {
      beforeEach(async () => {
        const terminal = new InstallQuestions(_inquirerStub);
        await terminal.askQuestions();
      });

      it('should ask for the display name', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          _inquirerStub.prompt.mock.calls[0][0],
          'displayName',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for the description', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          _inquirerStub.prompt.mock.calls[0][0],
          'description',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for the unity version', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          _inquirerStub.prompt.mock.calls[0][0],
          'unityVersion',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for the author name', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          _inquirerStub.prompt.mock.calls[0][0],
          'authorName',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for the author email', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          _inquirerStub.prompt.mock.calls[0][0],
          'authorEmail',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for the author url', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          _inquirerStub.prompt.mock.calls[0][0],
          'authorUrl',
          'input',
        );

        expect(match).not.toBeUndefined();
      });

      it('should ask for keywords', () => {
        const match = findQuestionMatch(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          _inquirerStub.prompt.mock.calls[0][0],
          'keywords',
          'input',
        );

        expect(match).not.toBeUndefined();
      });
    });
  });
});
