import Commands from './commands';
import CommandInstall from './install/command-install';

jest.mock('./install/command-install');
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const mockCommandInstall: jest.Mock<any> = CommandInstall as any;

describe('Commands class', () => {
  const setup = () => {
    const instanceCommandInstall = { run: jest.fn() };

    mockCommandInstall.mockImplementation(() => instanceCommandInstall);
    jest.spyOn(console, 'log').mockImplementation();

    return {
      commands: new Commands(),
      instanceCommandInstall,
    };
  };

  it('should run', () => {
    const { commands } = setup();

    expect(commands).toBeTruthy();
  });

  describe('run method', () => {
    it('should run the install command on \'init\' argument', () => {
      const argument = 'init';

      const { commands, instanceCommandInstall } = setup();
      commands.run(argument);

      expect(instanceCommandInstall.run).toHaveBeenCalledWith();
    });

    it('should not run the console log on the \'init\' argument', () => {
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
});
