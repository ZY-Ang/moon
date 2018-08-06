/*
 * Copyright (c) 2018 moon
 */

/**
 * The id of the extension tied to the private key as defined in manifest.json.
 * Note: This should be similar for both dev and prod on chrome. Firefox auto
 * generates the key so new id has to be dynamically generated every time.
 */
export const extensionId =
    (process.env.BROWSER === 'firefox' && !!browser && !!browser.runtime) ? browser.runtime.id :
    ((!!chrome && !!chrome.runtime && chrome.runtime.id) || 'ehmpejjklcibliopgbghpgfinhbjopnn');
