import {GitDetector} from './git-detector';

describe('GitDetails', () => {
  it('should return the current gitUrl', async () => {
    const remote = 'git@github.com:ashblue/oyster-package-generator.git';
    let http = remote.replace(
      'git@github.com:',
      'https://github.com/');
    http = http.replace('.git', '');

    const gitRemoteOriginUrl = jest.fn()
      .mockImplementation(() => Promise.resolve(remote));

    const gitDetector = new GitDetector(gitRemoteOriginUrl);
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

    const gitDetector = new GitDetector(gitRemoteOriginUrl);
    const details = await gitDetector.getDetails();

    expect(details.gitUrlNoHttp).toBe(noHttp);
  });
});
