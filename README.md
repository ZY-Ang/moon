# [Moon](https://paywithmoon.com/) &middot; [![CircleCI](https://circleci.com/gh/paywithmoon/moon/tree/master.svg?style=svg&circle-token=8eefab7e2547ccc1a17e25f2d05e857d62a786a4)](https://circleci.com/gh/paywithmoon/moon/tree/master)

Moon is a platform that allows users to shop anywhere online with cryptocurrency.

## Installation

1. Install nodejs version `8.11.3` or higher. (Recommended to use `nvm` or `n` for switching between node versions)
2. Clone this repo
3. `cd` into the project directory on the command line/terminal
4. Run either:
   - `npm run install-all` to install packages for all projects at once, or;
   - `npm install` on the individual projects you are working on to reduce project size.
5. 

## Front End Developers Look Here!

You will most likely be working with the `browser-extension` or `dashboard` projects.

### browser-extension

This is a custom webpack-bundled react app with heavy usage of browser extension APIs. Stuff you might need to learn before starting here:

- `javascript`
- `react`
- `webpack`
- `Web Extension APIs` ([chrome/opera](https://developer.chrome.com/extensions/api_index) and [firefox](https://developer.mozilla.org/kab/docs/Mozilla/Add-ons/WebExtensions))
- [`serverless framework`](https://serverless.com/) (Manages our backend, contains data that is fed as environment variables to the front end)
- `aws AppSync` (AWS' managed GraphQL provider)
- `aws Lambda` (AWS cloud function)
- `auth0` (Our authentication service)

To get started,

1. Ask for a AWS `credentials` file from your supervisor. You need these to run the build script.
2. Create a folder `.aws` in `~/.aws` (Mac) or `C:/Users/<Your Username>/.aws` and put the `credentials` file in the folder.
3. Run `cd browser-extension`
4. Run `npm run build`
5. Open up chrome/opera.
6. Head to [chrome://extensions](chrome://extensions)
7. Enable/Enter developer mode
8. Click "Load Unpacked Extension"
9. Navigate to `<Your Repository Directory>/browser-extension/build` on Windows Explorer/Finder/File Explorer and load the __entire__ folder
10. A new window should open up, telling you you've installed the extension, if you're installing it for the first time.

### dashboard

This is a standard `create-react-app` application. Stuff you might need to learn before starting here:

- `javascript`
- `create-react-app`
- `react`
- `aws` (Our backend is mostly on `aws`)
- `auth0` (Our authentication service)
- `firebase` (We host the dashboard on `firebase`)

To get started,

1. Run `cd dashboard`
2. Run `npm start`
3. See `create-react-app` documentation for more information

## Back End Developers Look Here!

TODO: Add some architecture stuff here

### Serverless

1. Ask for a AWS `credentials` file from your supervisor. You need these to run the build script.
2. Create a folder `.aws` in `~/.aws` (Mac) or `C:/Users/<Your Username>/.aws` and put the `credentials` file in the folder.
3. If you ran `npm run install-all` during the installation, you should be all good! Otherwise, run `npm install` where necessary.
4. Run one of the deploy commands in the various `package.json` files in the project to see it in action

### NodeJS, AWS Lambda

TODO: Add some stuff here

### Databases

Don't touch these unless you're absolutely sure you know what you're doing.


## Notes

1. Read our company [philosophy](https://github.com/paywithmoon/philosophy/blob/master/README.md) on how to treat your coworkers nicely
