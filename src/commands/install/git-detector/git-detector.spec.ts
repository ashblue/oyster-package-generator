import GitDetector from './git-detector';

describe('GitDetector', () => {
  describe('isGitRepo', () => {
    it('should resolve if there is no error', async () => {
      const gitRemoteOriginUrl = jest.fn()
        .mockImplementation(() => Promise.resolve());

      const gitDetector = new GitDetector(gitRemoteOriginUrl as any);
      const result = await gitDetector.checkIfGitRepo();

      expect(result.isGitRepo).toBe(true);
    });

    it('should track an error if promise rejects', async () => {
      const gitRemoteOriginUrl = jest.fn()
        .mockImplementation(() => Promise.reject());

      const gitDetector = new GitDetector(gitRemoteOriginUrl as any);
      const result = await gitDetector.checkIfGitRepo();

      expect(result.isGitRepo).toBe(false);
    });

    it('should return a message promise rejects', async () => {
      const gitRemoteOriginUrl = jest.fn()
        .mockImplementation(() => Promise.reject('a'));

      const gitDetector = new GitDetector(gitRemoteOriginUrl as any);
      const result = await gitDetector.checkIfGitRepo();

      expect(result.message).toBe('a');
    });
  });

  describe('getDetails', () => {
    it('should return the current gitUrl', async () => {
      const remote = 'git@github.com:ashblue/oyster-package-generator.git';
      let http = remote.replace(
        'git@github.com:',
        'https://github.com/');
      http = http.replace('.git', '');

      const gitRemoteOriginUrl = jest.fn()
        .mockImplementation(() => Promise.resolve(remote));

      const gitDetector = new GitDetector(gitRemoteOriginUrl as any);
      const details = await gitDetector.getDetails();

      expect(details.gitUrl).toBe(http);
    });

    it('should return the current gitUrlNoHttp', async () => {
      const remote = 'git@github.com:ashblue/oyster-package-generator.git';
      let noHttp = remote.replace(
        'git@github.com:',
        'github.com/');
      noHttp = noHttp.replace('.git', '');

      const gitRemoteOriginUrl = jest.fn()
        .mockImplementation(() => Promise.resolve(remote));

      const gitDetector = new GitDetector(gitRemoteOriginUrl as any);
      const details = await gitDetector.getDetails();

      expect(details.gitUrlNoHttp).toBe(noHttp);
    });
  });
});
