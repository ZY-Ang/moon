/*
 * Copyright (c) 2018 moon
 */

// --------------------- Coinbase Auth Flow Variables ---------------------

/**
 * The URL of coinbase's home page
 */
export const URL_COINBASE = "https://www.coinbase.com";
/**
 * The URL of coinbase's sign in page
 */
export const URL_COINBASE_SIGNIN = `${URL_COINBASE}/signin`;
/**
 * The URL of coinbase's api settings page so we can start a capture request script
 */
export const URL_COINBASE_SETTINGS_API = `${URL_COINBASE}/settings/api`;
/**
 * The HTML element ID of the button to trigger an auth flow
 */
export const ID_ADD_NEW_KEY_BUTTON = "add_new_key";
/**
 * The HTML element ID of the root api keys modal
 */
export const ID_API_KEYS_MODAL = "api_keys_modal";
/**
 * The HTML element ID of the api key form
 */
export const ID_API_KEY_FORM = "api_key_form";
/**
 * The HTML query selector for the background of the api key form modal
 */
export const QUERY_BACKGROUND_MODAL = ".modal-backdrop.fade.in";
/**
 * The HTML style to be applied to the background
 */
export const STYLE_BACKGROUND_MODAL = "opacity:1.0;background-color:white";
/**
 * The HTML query selector for the all accounts checkbox in the auth flow
 */
export const QUERY_ACCOUNTS_ALL_CHECKBOX = ".accounts-checkbox-all";
/**
 * The scope IDs of the checkboxes used to select required scopes
 * @see {@link https://developers.coinbase.com/docs/wallet/permissions}
 */
export const IDS_SCOPE_COINBASE = [
    // Permissions to List detailed user information (public information is available without this permission)
    "scope_wallet:user:read",
    // Permissions to List user’s accounts and their balances
    "scope_wallet:accounts:read",
    // Permissions to List account’s transactions
    "scope_wallet:transactions:read",
    // 	Permissions to Send bitcoin or ethereum
    "scope_wallet:transactions:send"
];
/**
 * The HTML query selector for the submit button in the auth flow
 */
export const QUERY_API_KEY_FORM_SUBMIT_BUTTON = ".btn.btn-primary.submit-form";
/**
 * The HTML query selector for the api key display window's DOM subtree root
 */
export const QUERY_API_KEY_DISPLAY_ROOT = ".modal-body.show-api-key";
/**
 * The identifier (starting string) of the API (public) Key
 */
export const INNER_TEXT_API_KEY = "API Key";
/**
 * The identifier (starting string) of the API (secret) Key
 */
export const INNER_TEXT_API_SECRET = "API Secret";