/*
 * Copyright (c) 2018 moon
 */

const fs = require("fs");
const shell = require("shelljs");

const DIR_BUILD = `build/`;
const DIR_SOURCE = `src/`;

const watchContent = () => {
    console.log("Watching content-scripts...");
    const PATH_CONTENT_ENTRY = `${DIR_SOURCE}app/index.js`;
    if (shell.exec(`parcel watch ${PATH_CONTENT_ENTRY} -d ${DIR_BUILD} -o app.js`).code !== 0) {
        shell.echo('Error: watch failed - unable to watch chrome content script');
        shell.exit(1);
    }
};

module.exports = watchContent;

watchContent();
