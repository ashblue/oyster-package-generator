# [2.1.0](https://github.com/ashblue/oyster-package-generator/compare/v2.0.0...v2.1.0) (2021-06-01)


### Bug Fixes

* **init wizard:** leaving the Unity version blank now respects blank values ([95f185e](https://github.com/ashblue/oyster-package-generator/commit/95f185e37213f669976514d76a4c807d1aa6da4b))


### Features

* **cli:** oyster install moved to `oyster init` namespace ([02f6326](https://github.com/ashblue/oyster-package-generator/commit/02f6326c9a3592426a39488e47aec0bbd7d08c53))
* **command:** `oyster generate-config` auto create a .oyster.json file for older projects ([c73874b](https://github.com/ashblue/oyster-package-generator/commit/c73874b7e138efd3906a8ea2946f246b83ba26ed))
* **command upgrade:** `npx oyster-package-generator upgrade` can now be used to upgrade a project ([11ca4cf](https://github.com/ashblue/oyster-package-generator/commit/11ca4cf6858fd5bf2b76d89d3c657ce778667b9c))

# [2.0.0](https://github.com/ashblue/oyster-package-generator/compare/v1.0.0...v2.0.0) (2021-04-10)


### Bug Fixes

* **jest:** fix for failing on Windows 10 ([1fe1d98](https://github.com/ashblue/oyster-package-generator/commit/1fe1d982241537b0736c10866217be89ee305842))
* **package.json:** now updates the version number in `master` on release ([49a0f74](https://github.com/ashblue/oyster-package-generator/commit/49a0f742e4bcb954ffd53aabb97e506dea1d77a2))
* **packages:** updated all packages and Node.js to latest stable version ([48e6ddd](https://github.com/ashblue/oyster-package-generator/commit/48e6dddb8eb82d7153dac1e3097291f273cd07be))
* **templates:** patched several build bugs in the generated template files ([916c6d4](https://github.com/ashblue/oyster-package-generator/commit/916c6d4866b11fa56d643004e230d4cc2207f9c5))
* **windows:** fix for Windows NVM not finding the .nvmrc patch version ([4a1c936](https://github.com/ashblue/oyster-package-generator/commit/4a1c936bac1a60743769285fe46f8e60e2293279))


### Code Refactoring

* **node:** upgraded node version to 14 to patch various packages ([7b266f7](https://github.com/ashblue/oyster-package-generator/commit/7b266f7b1d76b0d6d59be6b5fa24dd96fbb6a28b))


### Features

* **templates:** updated all packages to latest versions ([a1ad1f1](https://github.com/ashblue/oyster-package-generator/commit/a1ad1f1bba20c7c7730144ec967865323131d3a2))


### BREAKING CHANGES

* **node:** You can no longer use Node 12 which will break the library for some users. 14 is
now required due to several changes to how file manipulation is done.

# 1.0.0 (2019-08-18)


### Features

* commitizen added to format commits ([ed23053](https://github.com/ashblue/oyster-package-generator/commit/ed23053))
