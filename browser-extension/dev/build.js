/*
 * Copyright (c) 2018 moon
 */

const AdmZip = require("adm-zip");
const AWS = require("aws-sdk");
const fs = require("fs");
const shell = require("shelljs");
const path = require("path");

const getAWSAccountId = (credentials) => new Promise((resolve, reject) =>
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

const getCloudFormationExport = async (credentials, exportName) => {
    const exports = await new Promise((resolve, reject) =>
        (new AWS.CloudFormation({credentials}))
            .listExports({}, (err, data) => {
                if (err) {
                    console.error("Error while listing cloudformation exports.");
                    reject(err);
                } else {
                    resolve(data);
                }
            })
    );
    if (exports.Exports) {
        for (let exp of exports.Exports) {
            if (exp.Name === exportName) {
                return exp.Value;
            }
        }
    }
    throw new Error(`Export ${exportName} not found in exports: \n${JSON.stringify(exports)}`);
};

const getCloudFormationStackOutput = async (credentials, StackName, outputName) => {
    const {Stacks} = await new Promise((resolve, reject) =>
        (new AWS.CloudFormation({credentials}))
            .describeStacks({StackName}, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            })
    );

    return Stacks[0].Outputs.filter(({OutputKey}) => (OutputKey === outputName))[0].OutputValue;
};

const build = async () => {
    // TODO: Seed backend with supportedSites
    console.log("================== ENVIRONMENT VARIABLES ==================");
    // NODE_ENV
    const DEFAULT_NODE_ENV = 'development';
    console.log(`NODE_ENV:\t\t\t\t${shell.env.NODE_ENV}${!shell.env.NODE_ENV?` => ${DEFAULT_NODE_ENV}`:''}`);
    shell.env.NODE_ENV = process.env.NODE_ENV || DEFAULT_NODE_ENV;

    // AWS_PROFILE
    const DEFAULT_AWS_PROFILE = `moon-${shell.env.NODE_ENV}`;
    console.log(`AWS_PROFILE:\t\t\t${shell.env.AWS_PROFILE}${!shell.env.AWS_PROFILE?` => ${DEFAULT_AWS_PROFILE}`:''}`);
    shell.env.AWS_PROFILE = process.env.AWS_PROFILE || DEFAULT_AWS_PROFILE;

    // AWS_ACCESS_KEY_ID
    console.log(`AWS_ACCESS_KEY_ID:\t\t${shell.env.AWS_ACCESS_KEY_ID}`);

    // AWS_SECRET_ACCESS_KEY
    console.log(`AWS_SECRET_ACCESS_KEY:\t${shell.env.AWS_SECRET_ACCESS_KEY}`);

    // AWS_ACCOUNT_ID
    const credentials = (
        shell.env.AWS_ACCESS_KEY_ID &&
        shell.env.AWS_SECRET_ACCESS_KEY &&
        shell.env.CI === true // AWS.Credentials only on CI
    )
        ? new AWS.Credentials(shell.env.AWS_ACCESS_KEY_ID, shell.env.AWS_SECRET_ACCESS_KEY)
        : new AWS.SharedIniFileCredentials({profile: shell.env.AWS_PROFILE});
    shell.env.AWS_ACCOUNT_ID = await getAWSAccountId(credentials);
    console.log(`AWS_ACCOUNT_ID:\t\t\t${(shell.env.AWS_ACCOUNT_ID)}`);

    // AWS_REGION
    const DEFAULT_AWS_REGION = 'us-east-1';
    console.log(`AWS_REGION:\t\t\t\t${shell.env.AWS_REGION}${!shell.env.AWS_REGION?` => ${DEFAULT_AWS_REGION}`:''}`);
    shell.env.AWS_REGION = process.env.AWS_REGION || DEFAULT_AWS_REGION;

    // AWS_APPSYNC_ENDPOINT_AUTH
    shell.env.AWS_APPSYNC_ENDPOINT_AUTH = await getCloudFormationStackOutput(credentials, `moon-backend-appsync-authenticated-${shell.env.NODE_ENV}`, "ApiUrl");
    console.log(`AWS_APPSYNC_ENDPOINT_AUTH:\t${(shell.env.AWS_APPSYNC_ENDPOINT_AUTH)}`);

    // AWS_APPSYNC_ENDPOINT_PUBLIC
    shell.env.AWS_APPSYNC_ENDPOINT_PUBLIC = await getCloudFormationStackOutput(credentials, `moon-backend-appsync-public-${shell.env.NODE_ENV}`, "ApiUrl");
    console.log(`AWS_APPSYNC_ENDPOINT_PUBLIC:\t${(shell.env.AWS_APPSYNC_ENDPOINT_PUBLIC)}`);

    shell.env.AWS_APPSYNC_API_ID_PUBLIC = await getCloudFormationStackOutput(credentials, `moon-backend-appsync-public-${shell.env.NODE_ENV}`, "ApiId");
    console.log(`AWS_APPSYNC_API_ID_PUBLIC:\t${(shell.env.AWS_APPSYNC_API_ID_PUBLIC)}`);

    shell.env.AWS_APPSYNC_API_KEY_PUBLIC = await getCloudFormationStackOutput(credentials, `moon-backend-appsync-public-${shell.env.NODE_ENV}`, "ApiKey");
    console.log(`AWS_APPSYNC_API_KEY_PUBLIC:\t${(shell.env.AWS_APPSYNC_API_KEY_PUBLIC)}`);

    // BROWSER
    const DEFAULT_BROWSER = 'chrome';
    console.log(`BROWSER:\t\t\t\t${shell.env.BROWSER}${!shell.env.BROWSER?` => ${DEFAULT_BROWSER}`:''}`);
    shell.env.BROWSER = process.env.BROWSER || DEFAULT_BROWSER;
    console.log("===========================================================\n");
    console.log("=================== BUILD CONFIGURATION ===================");
    console.log(`credentials:\t\t\t${credentials.constructor.name}`);
    console.log("===========================================================\n");

    const DIR_BUILD = `build/`;
    const DIR_FILES = `files/`;

// 1. Delete all build files in the build folder of the browser extension
    console.log("Clearing build folder...");
    shell.rm('-rf', `${DIR_BUILD}*`);
    console.log("Force recreating build folder...");
    shell.mkdir('-p', DIR_BUILD);
    console.log("===========================================================\n");

// 2. Build browser-extension
    console.log("Building browser-extension...");

    await  new Promise((resolve, reject) => {
        if (shell.exec(`webpack --config webpack.config.js`).code !== 0) {
            reject(new Error('Error: build failed - unable to build browser-extension.'));
        } else {
            resolve(true);
            console.log("===========================================================\n");
        }
    });

// 3. Build manifest.json
    // 3i. Run the built manifest builder to build manifest.json
    console.log("Building manifest.json...");
    const FILE_MANIFEST_BUILDER = 'manifestBuilder.js';
    const PATH_MANIFEST_BUILDER_EXIT = `${DIR_BUILD}${FILE_MANIFEST_BUILDER}`;
    const manifestJs = require("../build/manifestBuilder");
    const PATH_MANIFEST_BUILD = `${DIR_BUILD}manifest.json`;
    fs.writeFileSync(PATH_MANIFEST_BUILD, JSON.stringify(manifestJs, null, 2), 'utf8');

    // 3ii. Remove the compiled manifest builder
    console.log("Removing manifestBuilder.js...");
    shell.rm('-f', PATH_MANIFEST_BUILDER_EXIT);
    console.log("===========================================================\n");

// 4. Copy all other unhashed assets
    console.log("Copying unhashed assets...");
    shell.cp('-r', `${DIR_FILES}.`, DIR_BUILD);
    console.log("===========================================================\n");

// 5. Zip folder on production to prepare for WebStore deployments
    if (shell.env.NODE_ENV === 'production') {
        console.log("Zipping up folder...");

        const PATH_ZIP_EXIT = `${DIR_BUILD}moon-extension.zip`;
        const zip = new AdmZip();
        zip.addLocalFolder(DIR_BUILD);
        await new Promise((resolve, reject) =>
            zip.writeZip(PATH_ZIP_EXIT, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            })
        );
        console.log(`Folder zipped. You may find the deployment package at ${path.join(__dirname, '../', PATH_ZIP_EXIT)}`);
    } else {
        console.log("Skipping folder zip...");
    }
    console.log("===========================================================\n");
};

module.exports = build;

build().catch(err => {
    console.error(err);
    shell.exit(1);
});
