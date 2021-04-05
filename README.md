# Oyster Package Generator

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Setting up a Unity Package Manger project with cloud builds, automated version numbers, and documentation can take several hours. Oyster Package Generator creates all of this for you by answering a few simple questions about your project.

![Oyster Package Generator CLI](src/images/cli-example.png)

Features

* Cloud deploy your Unity Package automatically to NPM
* Automatically generates the standard Unity [package structure](https://docs.unity3d.com/Manual/cus-layout.html) for you
* Version numbers are automatically created from your commits
* Auto-deploying nightly builds as you make commits
* Change logs are generated from commits
* Allows you to work inside a Unity project without cloning nested repos in `Assets`

**Support**

Join the [Discord Community](https://discord.gg/8QHFfzn) if you have questions or need help.

# Getting Started

In order to use Oyster Package Generator you'll need the following.

* [Git](https://git-scm.com/) installed
* [Node.js](https://nodejs.org/en/) version 14 installed
* [GitHub](https://github.com/) account (uses GitHub specific publishing features)
* Window Note: Due to various Linux install scripts this does not work on Windows machines

## Quick Start

If you don't care about all the granular details just do the following.

1. Create a new Unity project and navigate to the root
1. Setup Git (skip if already setup)
    1. Run `git init` to prep everything for Git
    1. Run `git remote add origin YOUR_REPO`. Replace `YOUR_REPO` with the proper repo URL (such as git@github.com:ashblue/oyster-package-generator.git). This needs to be done before oyster runs. Reason being it hard writes some Git addresses into your project
1. Run `npx oyster-package-generator` and answer the prompts. Wait for the install script to finish
1. Install Semantic Release for cloud deploys
    1. Run `npm install -g semantic-release-cli`
    1. Then run `semantic-release-cli setup` and answer the prompts to setup GitHub Actions. This will setup cloud deployments for you
1. Set your default GitHub branch to `develop` instead of `master`. While not required, this will make pull requests and maintaining your repo easier

Once setup all commits to the `master` branch will generate a new release. All commits to the `develop` branch will generate an unversioned nightly build.

## Running the CLI

To generate your project you'll need to setup a GitHub repo if you haven't in a Unity project. Make sure you set the `origin` remote as the origin is used to auto populate some of the files.

Run the following command and answer the question prompts.

```bash
npx oyster-package-generator
```

Please note if you plan on using Oyster a lot you should globally install it for speed purposes. `npx` can be quite slow since it doesn't cache.

```bash
npm install -g oyster-package-generator

# Run the program
oyster
```

You're done. If you want to [setup cloud builds manually](#setting-up-cloud-builds) you'll need to do a few extra things.

### Making commits to your project

All commits should be made with the following command. Your project will use [Commitizen](https://github.com/commitizen/cz-cli) and enforce syntax via [Commitlint](https://commitlint.js.org).

```bash
npm run commit
```

### Git Flow

You should install and use the [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) branching strategy when working with Oyster generated packages. 

Why do I need GitFlow you might ask? Commits to Oyster's `develop` branch automatically create nightly builds. Commits to `master` automatically generate package releases. Therefore it's a good idea to work out of Git Flow's feature branches and use the branching strategy.

In short **you must** have a `develop` and `master` branch for cloud builds to work properly.

### Licensing

Oyster Package Generator automatically includes an MIT license in the project. You can easily change this by deleting/changing the `package.json` license key and the `LICENSE.md` file if you desire.

## Roadmap

To view the latest upcoming features you can check the roadmap here.

https://trello.com/b/Z9P0XMl6/oyster-package-generator

## Setting up cloud builds

Cloud and nightly builds are done with GitHub actions. If you're running a GitHub project you only need to add an NPM token.

### The quick way

Oyster package manager is compatible with [semantic-release-cli](https://github.com/semantic-release/cli). Run the following commands from the root of your project, fill in the questions, choose GitHub actions, and your keys will automatically be configured.

```bash
npm install -g semantic-release-cli
semantic-release-cli setup
```

### The hard way

To get builds automatically deploying you'll need an NPM token. To get one we'll have to [generate an authentication key](https://docs.npmjs.com/creating-and-viewing-authentication-tokens). You must have an [npm](https://www.npmjs.com) account to generate a token. 

Add the key to your repo [secrets](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository) as `NPM_TOKEN`.

## Development Environment

To run this project locally you'll need to clone this repo and run the following in your project root. [NVM](https://github.com/nvm-sh/nvm) is highly recommended to sync your local Node.js version.

```bash
nvm use
npm install
npm build
```

After the processes are complete, you'll need to setup the oyster command locally to test it. This is important since you probably want to execute the command in various Unity projects. We can easily do this by running the following.

```bash
npm link
```

When the link is complete you can run `oyster` in the terminal. Which will execute the last build created from `npm run build`.

If you ever want to remove the global `oyster` command just run the following in the project root. This will remove the command entirely and uninstall it.

```bash
npm unlink
```

### Pull Requests / Contributing

Please see the [Contributing Guidelines](CONTRIBUTING.md) document for more info.

