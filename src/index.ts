import Commands from './commands/commands';

/* istanbul ignore file */
const commandInstall = new Commands();
commandInstall.run(process.argv[process.argv.length - 1]);
