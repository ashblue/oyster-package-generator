import path from 'path';
import * as shell from 'shelljs';
import CommandInstall from './command-install';
import InstallQuestions from './install-questions/install-questions';
import GitDetector from './git-detector/git-detector';
import * as CopyFolder from './copy-folder/copy-folder';
import PackageBuilder from './package-builder/package-builder';

jest.spyOn(console, 'log').mockImplementation();

jest.mock('shelljs', () => ({
  exec: jest.fn(),
}));

jest.mock('./install-questions/install-questions');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockInstallQuestions: jest.Mock<any> = InstallQuestions as any;

jest.mock('./git-detector/git-detector');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockGitDetector: jest.Mock<any> = GitDetector as any;

jest.mock('./copy-folder/copy-folder');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockCopyFolder: {
  copyFolder: jest.Mock<any>;
  findPreExistingFiles: jest.Mock<any>;
} = CopyFolder as any;

jest.mock('./package-builder/package-builder');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockPackageBuilder: jest.Mock<any> = PackageBuilder as any;

describe('CommandInstall class', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface IOptions {
    failPackageBuild?: boolean;
  }

  const setup = (options: IOptions = {}) => {
    const responseInstallQuestions = jest.fn();
    mockInstallQuestions.mockImplementation(() => responseInstallQuestions);

    const responseGitDetector = jest.fn();
    mockGitDetector.mockImplementation(() => responseGitDetector);

    const instancePackageBuilder = { build: jest.fn() };
    instancePackageBuilder.build.mockImplementation(() => Promise.resolve(!options.failPackageBuild));
    mockPackageBuilder.mockImplementation(() => instancePackageBuilder);

    return {
      commandInstall: new CommandInstall(),
      instancePackageBuilder,
      responseGitDetector,
      responseInstallQuestions,
    };
  };

  describe('run method', () => {
    it('should create a package builder with the expected arguments', async () => {
      const {
        commandInstall,
        responseInstallQuestions,
        responseGitDetector,
      } = setup();

      await commandInstall.run();

      expect(mockPackageBuilder).toHaveBeenCalledWith(
        mockCopyFolder.copyFolder, mockCopyFolder.findPreExistingFiles, responseInstallQuestions, responseGitDetector);
    });

    it('should trigger build on the package builder', async () => {
      const { commandInstall, instancePackageBuilder } = setup();

      await commandInstall.run();

      expect(instancePackageBuilder.build).toHaveBeenCalledWith(
        path.resolve(__dirname, './templates'),
        './',
      );
    });

    it('should run shell.exec(\'npm install\')', async () => {
      const { commandInstall } = setup();

      await commandInstall.run();

      expect(shell.exec).toHaveBeenCalledWith('npm install');
    });

    it('should not run shell.exec if packageBuilder.build returns false', async () => {
      const { commandInstall } = setup({
        failPackageBuild: true,
      });

      await commandInstall.run();

      expect(shell.exec).not.toHaveBeenCalled();
    });
  });
});
