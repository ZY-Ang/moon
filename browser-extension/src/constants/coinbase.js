/*
 * Copyright (c) 2018 moon
 */

// --------------------- Coinbase Auth Flow Variables ---------------------

/**
 * The URL of coinbase's home page
 */
export const URL_COINBASE = "https://www.coinbase.com";
/**
 * Regex for pathname of pages that require coinbase authentication to access
 */
export const REGEX_COIBASE_AUTHENTICATED_PAGES = /^.*(\/dashboard|\/buy|\/sell|\/accounts|\/tax-center|\/addresses|\/recurring_payments|\/reports|\/transfers|\/settings|\/invite|\/signout).*$/;
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
 * The expected HTML class for the modal
 */
export const CLASS_MODAL = "modal fade hide widget modal-overflow in";
/**
 * The HTML element ID of the api key form
 */
export const ID_API_KEY_FORM = "api_key_form";
/**
 * The HTML query selector for the background of the api key form modal
 */
export const QUERY_BACKGROUND_MODAL = ".modal-backdrop.fade.in";
/**
 * The HTML query selector for the title component of the modal header
 */
export const QUERY_MODAL_HEADER_TITLE = ".modal-header h4";
/**
 * The text of the title in the modal header to be set to.
 */
export const TEXT_MODAL_HEADER_TITLE = "Link Moon to your Coinbase Account";
/**
 * The HTML query selector for the close button of the modal header
 */
export const QUERY_MODAL_HEADER_CLOSE_BUTTON = ".modal-header button,.modal-header a";
/**
 * The HTML style to be applied to the background
 */
export const STYLE_BACKGROUND_MODAL = "opacity:1.0;background-color:#0667d0";
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
/**
 * The expected HTML display style for display:block
 */
export const STYLE_DISPLAY_BLOCK = "block";
/**
 * The HTML style for display:none
 */
export const STYLE_DISPLAY_NONE = "none";