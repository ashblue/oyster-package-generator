import CommandController from './commands-controller';
import CommandGenerateConfig from './generate-config/command-generate-config';
import CommandInstall from './install/command-install';
import CommandUpgrade from './upgrade/command-upgrade';

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock('nodegit', () => {});

jest.mock('./install/command-install');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockCommandInstall: jest.Mock<any> = CommandInstall as any;

jest.mock('./upgrade/command-upgrade');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockCommandUpgrade: jest.Mock<any> = CommandUpgrade as any;

jest.mock('./generate-config/command-generate-config');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockCommandGenerateConfig: jest.Mock<any> = CommandGenerateConfig as any;

describe('CommandController class', () => {
  const setup = () => {
    const instanceCommandInstall = { run: jest.fn() };
    mockCommandInstall.mockImplementation(() => instanceCommandInstall);

    const instanceCommandUpgrade = { run: jest.fn() };
    mockCommandUpgrade.mockImplementation(() => instanceCommandUpgrade);

    const instanceCommandGenerateConfig = { run: jest.fn() };
    mockCommandGenerateConfig.mockImplementation(
      () => instanceCommandGenerateConfig,
    );

    jest.spyOn(console, 'log').mockImplementation();

    return {
      commands: new CommandController(),
      instanceCommandInstall,
      instanceCommandUpgrade,
      instanceCommandGenerateConfig,
    };
  };

  it('should run', () => {
    const { commands } = setup();

    expect(commands).toBeTruthy();
  });

  describe('upgrade command', () => {
    it('should run the upgrade command', () => {
      const argument = 'upgrade';

      const { commands, instanceCommandUpgrade } = setup();
      commands.run(argument);

      expect(instanceCommandUpgrade.run).toHaveBeenCalled();
    });

    it('should not run the install command', () => {
      const argument = 'upgrade';

      const { commands, instanceCommandInstall } = setup();
      commands.run(argument);

      expect(instanceCommandInstall.run).not.toHaveBeenCalled();
    });

    it('should not trigger a console log message', () => {
      const argument = 'upgrade';

      const { commands } = setup();
      commands.run(argument);

      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe('init command', () => {
    it("should run the install command on 'init' argument", () => {
      const argument = 'init';

      const { commands, instanceCommandInstall } = setup();
      commands.run(argument);

      expect(instanceCommandInstall.run).toHaveBeenCalled();
    });

    it("should not run the console log on the 'init' argument", () => {
      const argument = 'init';

      const { commands } = setup();
      commands.run(argument);

      expect(console.log).not.toHaveBeenCalled();
    });

    it('if the argument does not have a match, display console log help', () => {
      const argument = 'asdf';

      const { commands } = setup();
      commands.run(argument);

      expect(console.log).toHaveBeenCalled();
    });
  });

  describe('generate-config command', () => {
    it('should run the command', () => {
      const argument = 'generate-config';

      const { commands, instanceCommandGenerateConfig } = setup();
      commands.run(argument);

      expect(instanceCommandGenerateConfig.run).toHaveBeenCalled();
    });
  });
});
