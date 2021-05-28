import IConfigRaw from './i-config-raw';

export default interface IConfig extends IConfigRaw {
  syncVersion(): void;
}
