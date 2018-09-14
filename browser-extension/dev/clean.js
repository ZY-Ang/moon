/*
 * Copyright (c) 2018 moon
 */

const shell = require("shelljs");

const clean = () => {
    const DIR_CACHE = `.cache/`;
    const DIR_BUILD = `build/`;
    console.log("Deleting cache folder...");
    shell.rm('-r', DIR_CACHE);
    console.log("===========================================================\n");
    console.log("Deleting build folder...");
    shell.rm('-r', DIR_BUILD);
    console.log("===========================================================\n");
};

module.exports = clean;

clean();
