/*
 * Copyright (c) 2018 moon
 */

const fs = require("fs");
const shell = require("shelljs");

const DIR_BUILD = `build/`;
const DIR_SOURCE = `src/`;

const watchBackground = () => {
    console.log("Watching background-scripts...");
    const PATH_BACKGROUND_ENTRY = `${DIR_SOURCE}background/index.js`;
    if (shell.exec(`parcel watch ${PATH_BACKGROUND_ENTRY} -d ${DIR_BUILD} -o background.js`).code !== 0) {
        shell.echo('Error: watch failed - unable to watch chrome background script');
        shell.exit(1);
    }
};

module.exports = watchBackground;

watchBackground();
