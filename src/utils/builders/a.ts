import { BuilderBuiltPackageJson } from './builder-built-package-json';
import BuilderConfigRaw from './builder-config-raw';

export const A = {
  configRaw: (): BuilderConfigRaw => new BuilderConfigRaw(),
  builtPackageJson: (): BuilderBuiltPackageJson =>
    new BuilderBuiltPackageJson(),
};
