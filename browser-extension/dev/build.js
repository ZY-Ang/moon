/*
 * Copyright (c) 2018 moon
 */

const AdmZip = require("adm-zip");
const AWS = require("aws-sdk");
const fs = require("fs");
const shell = require("shelljs");

const build = async () => {
    console.log("================== ENVIRONMENT VARIABLES ==================");
    const DEFAULT_NODE_ENV = 'development';
    console.log(`NODE_ENV:\t\t\t\t${shell.env.NODE_ENV}${!shell.env.NODE_ENV?` => ${DEFAULT_NODE_ENV}`:''}`);
    shell.env.NODE_ENV = process.env.NODE_ENV || DEFAULT_NODE_ENV;
    const DEFAULT_AWS_PROFILE = `moon-${shell.env.NODE_ENV}`;
    console.log(`AWS_PROFILE:\t\t\t${shell.env.AWS_PROFILE}${!shell.env.AWS_PROFILE?` => ${DEFAULT_AWS_PROFILE}`:''}`);
    shell.env.AWS_PROFILE = process.env.AWS_PROFILE || DEFAULT_AWS_PROFILE;
    console.log(`AWS_ACCESS_KEY_ID:\t\t${shell.env.AWS_ACCESS_KEY_ID}`);
    console.log(`AWS_SECRET_ACCESS_KEY:\t${shell.env.AWS_SECRET_ACCESS_KEY}`);
    const credentials = (
        shell.env.AWS_ACCESS_KEY_ID &&
        shell.env.AWS_SECRET_ACCESS_KEY &&
        shell.env.CI === true // AWS.Credentials only on CI
    )
        ? new AWS.Credentials(shell.env.AWS_ACCESS_KEY_ID, shell.env.AWS_SECRET_ACCESS_KEY)
        : new AWS.SharedIniFileCredentials({profile: shell.env.AWS_PROFILE});
    shell.env.AWS_ACCOUNT_ID = await new Promise((resolve, reject) =>
        (new AWS.STS({credentials}))
            .getCallerIdentity({}, (err, data) => {
                if (err) {
                    console.error("Error while calling sts.getCallerIdentity. You most likely forgot to set up aws credentials. See https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/loading-node-credentials-shared.html for more information");
                    reject(err);
                } else if (!data.Account) {
                    console.error("Error while getting data.Account. This is unexpected.");
                    reject(data);
                } else {
                    resolve(data.Account);
                }
            })
    );
    console.log(`AWS_ACCOUNT_ID:\t\t\t${(shell.env.AWS_ACCOUNT_ID)}`);
    const DEFAULT_REGION = 'us-east-1';
    console.log(`AWS_REGION:\t\t\t\t${shell.env.AWS_REGION}${!shell.env.AWS_REGION?` => ${DEFAULT_REGION}`:''}`);
    shell.env.AWS_REGION = process.env.AWS_REGION || DEFAULT_REGION;
    const DEFAULT_BROWSER = 'chrome';
    console.log(`BROWSER:\t\t\t\t${shell.env.BROWSER}${!shell.env.BROWSER?` => ${DEFAULT_BROWSER}`:''}`);
    shell.env.BROWSER = process.env.BROWSER || DEFAULT_BROWSER;
    const SOURCE_MAPS_FLAG = (shell.env.NODE_ENV === 'production') ? ' --no-source-maps' : '';
    console.log("===========================================================\n");
    console.log("=================== BUILD CONFIGURATION ===================");
    console.log(`credentials:\t\t\t${credentials.constructor.name}`);
    console.log("===========================================================\n");

    const DIR_BUILD = `build/`;
    const DIR_DEV = `dev/`;
    const DIR_SOURCE = `src/`;
    const DIR_FILES = `files/`;

// 1. Delete all build files in the build folder of the browser extension
    console.log("Clearing build folder...");
    shell.rm('-f', `${DIR_BUILD}*`);
    console.log("Force recreating build folder...");
    shell.mkdir('-p', DIR_BUILD);
    console.log("===========================================================\n");

// 2. Build react app content script
    console.log("Building content-script...");
    const PATH_CONTENT_ENTRY = `${DIR_SOURCE}app/index.js`;

    if (shell.exec(`parcel build ${PATH_CONTENT_ENTRY} -d ${DIR_BUILD} -o app.js${SOURCE_MAPS_FLAG}`).code !== 0) {
        shell.echo('Error: build failed - unable to build chrome content script');
        shell.exit(1);
    }
    console.log("===========================================================\n");

// 3. Build background script
    console.log("Building background-script...");
    const PATH_BACKGROUND_ENTRY = `${DIR_SOURCE}background/index.js`;

    if (shell.exec(`parcel build ${PATH_BACKGROUND_ENTRY} -d ${DIR_BUILD} -o background.js${SOURCE_MAPS_FLAG}`).code !== 0) {
        shell.echo('Error: build failed - unable to build chrome background script');
        shell.exit(1);
    }
    console.log("===========================================================\n");

// 4. Build manifest.json
    // 4i. Build the manifest builder to sync asset imports
    console.log("Building manifestBuilder.js...");
    const FILE_MANIFEST_BUILDER = 'manifestBuilder.js';
    const PATH_MANIFEST_BUILDER_ENTRY = `${DIR_DEV}${FILE_MANIFEST_BUILDER}`;
    const PATH_MANIFEST_BUILDER_EXIT = `${DIR_BUILD}${FILE_MANIFEST_BUILDER}`;

    if (shell.exec(`parcel build ${PATH_MANIFEST_BUILDER_ENTRY} -d ${DIR_BUILD} -o ${FILE_MANIFEST_BUILDER} --no-source-maps`).code !== 0) {
        shell.echo('Error: build failed - unable to build manifest builder');
        shell.exit(1);
    }

    // 4ii. Run the built manifest builder to build manifest.json
    console.log("Building manifest.json...");
    const manifestJs = require("../build/manifestBuilder");
    const PATH_MANIFEST_BUILD = `${DIR_BUILD}manifest.json`;
    try {
        fs.writeFileSync(PATH_MANIFEST_BUILD, JSON.stringify(manifestJs, null, 2), 'utf8');
    } catch (error) {
        console.error('Error: build failed - unable to build manifest.json via the manifest builder');
        throw error;
    }

    // 4iii. Remove the compiled manifest builder
    console.log("Removing manifestBuilder.js...");
    shell.rm('-f', PATH_MANIFEST_BUILDER_EXIT);
    console.log("===========================================================\n");

// 5. Copy all other unhashed assets
    console.log("Copying unhashed assets...");
    shell.cp('-r', `${DIR_FILES}.`, DIR_BUILD);
    console.log("===========================================================\n");

// 6. Zip folder on production to prepare for WebStore deployments
    if (shell.env.NODE_ENV === 'production') {
        console.log("Zipping up folder...");

        const PATH_ZIP_EXIT = `${DIR_BUILD}moon-extension.zip`;
        const zip = new AdmZip();
        zip.addLocalFolder(DIR_BUILD, null, null);
        await new Promise((resolve, reject) =>
            zip.writeZip(PATH_ZIP_EXIT, err => {
                if (err) {
                    reject(err);
                }
            })
        );
    } else {
        console.log("Skipping folder zip...");
    }
    console.log("===========================================================\n");

// TODO: Implement publishing to chrome webstore via {@link https://developer.chrome.com/webstore/using_webstore_api}
};

module.exports = build;

build().catch(err => {
    console.error(err);
    shell.exit(1);
});
