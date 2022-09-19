# [3.0.0](https://github.com/ashblue/oyster-package-generator/compare/v2.1.0...v3.0.0) (2022-09-19)


### Bug Fixes

* **git:** fixes Windows crash with nodegit ([e086187](https://github.com/ashblue/oyster-package-generator/commit/e086187639e3640c78a7b3cd499178320225ae43)), closes [#37](https://github.com/ashblue/oyster-package-generator/issues/37)


### Features

* **ci:** another CI run fix ([72df678](https://github.com/ashblue/oyster-package-generator/commit/72df678688f97e83a8894cf9a45201bd9984556f))
* **ci:** cI no longer runs husky hooks ([365e049](https://github.com/ashblue/oyster-package-generator/commit/365e049b160d894d6bcc6cb39fb0f7fd147d0eab))
* **node:** upgraded to node v16 and all corresponding packages ([b67c434](https://github.com/ashblue/oyster-package-generator/commit/b67c434fa1b4301ddc34a0ceac5de25ad328a970)), closes [#57](https://github.com/ashblue/oyster-package-generator/issues/57)
* **readme:** updated gitignore template to 2022 ([e6f3421](https://github.com/ashblue/oyster-package-generator/commit/e6f3421aef6d2b163c8fe465667b185d1bd4d91f))


### BREAKING CHANGES

* **node:** Running on v14 will most likely crash. Without v16 all Oyster commands will
probably break
