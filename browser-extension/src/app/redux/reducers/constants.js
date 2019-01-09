/*
 * Copyright (c) 2018 moon
 */

/* -----------------    Application Action Identifiers     ------------------ */
import UnsupportedScreen from "../../components/main/screens/unsupported/UnsupportedScreen";
import SettingsScreen from "../../components/main/screens/settings/SettingsScreen";
import MainScreen from "../../components/main/screens/MainScreen";
import AmazonCheckoutScreen from "../../components/main/screens/www.amazon.com/AmazonCheckoutScreen";
import AmazonSelectShippingAddressScreen
    from "../../components/main/screens/www.amazon.com/AmazonSelectShippingAddressScreen";
import AmazonPaymentMethodSelectScreen
    from "../../components/main/screens/www.amazon.com/AmazonPaymentMethodSelectScreen";
import AmazonProductScreen from "../../components/main/screens/www.amazon.com/AmazonProductScreen";
import DevelopersScreen from "../../components/main/screens/developers/DevelopersScreen";
import TawkLiveChatScreen from "../../components/main/screens/help/TawkLiveChatScreen";
import AmazonCatchAllScreen from "../../components/main/screens/www.amazon.com/AmazonCatchAllScreen";
import AmazonNotAtCheckoutScreen from "../../components/main/screens/www.amazon.com/AmazonNotAtCheckoutScreen";
import AddWalletsScreen from "../../components/main/screens/addWallets/AddWalletsScreen";

export const ACTION_SET_IS_APP_ACTIVE = 'APP_IS_ACTIVE_SET';
export const ACTION_TOGGLE_IS_APP_ACTIVE = 'APP_IS_ACTIVE_TOGGLE';
export const ACTION_SET_APP_MODAL_LOADING_STATE = 'APP_MODAL_LOADING_STATE_SET';
export const ACTION_SET_APP_MODAL_SUCCESS_STATE = 'APP_MODAL_SUCCESS_STATE_SET';
export const ACTION_SET_APP_MODAL_ERROR_STATE = 'APP_MODAL_ERROR_STATE_SET';
export const ACTION_SET_UI_BLOCKER_STATE = 'UI_BLOCKER_STATE_SET';

/* -----------------    Authentication Action Identifiers     ------------------ */
export const ACTION_SET_AUTH_USER = 'AUTH_USER_SET';
export const ACTION_SET_AUTH_USER_TEMPORARY_ONBOARD_SKIP = 'AUTH_USER_TEMPORARY_ONBOARD_DELAY';

/* -----------------    Tab Data Action Identifiers     ------------------ */
export const ACTION_SET_TAB = 'TAB_INFORMATION_SET';

/* -----------------    Wallet Selection Identifiers     ------------------ */
export const ACTION_SET_SELECTED_WALLET = 'SELECTED_WALLET_SET';

/* -----------------    MainFlow Tabs Stack Action Identifiers     ------------------ */
export const ACTION_SET_SCREEN = 'MAINFLOW_SCREEN_ACTION_SET';
export const ACTION_POP_SCREEN = 'MAINFLOW_SCREEN_ACTION_POP';
export const ACTION_PUSH_SCREEN = 'MAINFLOW_SCREEN_ACTION_PUSH';

// These are the possible screens that can be rendered
export const SCREEN_UNSUPPORTED = 'MAINFLOW_SCREEN_UNSUPPORTED'; // 404 catch all
export const SCREEN_SETTINGS = 'MAINFLOW_SCREEN_SETTINGS';
export const SCREEN_DEVELOPER = 'MAINFLOW_SCREEN_DEVELOPERS';
export const SCREEN_MAIN = 'MAINFLOW_SCREEN_MAIN'; // host-ful and pathname-ful router
export const SCREEN_ADD_WALLETS = 'MAINFLOW_SCREEN_ADD_WALLETS';
export const SCREEN_HELP_TAWK = 'MAINFLOW_SCREEN_HELP_TAWK';
export const SCREEN_AMAZON_CATCH_ALL = 'MAINFLOW_SCREEN_AMAZON_CATCH_ALL';
export const SCREEN_AMAZON_CHECKOUT = 'MAINFLOW_SCREEN_AMAZON_CHECKOUT';
export const SCREEN_AMAZON_NOT_AT_CHECKOUT = 'MAINFLOW_SCREEN_AMAZON_NOT_AT_CHECKOUT';
export const SCREEN_AMAZON_ADDRESS_SELECT = 'MAINFLOW_SCREEN_AMAZON_ADDRESS_SELECT';
export const SCREEN_AMAZON_PAYMENT_METHOD_SELECT = 'MAINFLOW_SCREEN_AMAZON_PAYMENT_METHOD_SELECT';
export const SCREEN_AMAZON_PRODUCT = 'MAINFLOW_SCREEN_AMAZON_PRODUCT';
export const POSSIBLE_SCREENS = {
    [SCREEN_UNSUPPORTED]: UnsupportedScreen,
    [SCREEN_SETTINGS]: SettingsScreen,
    [SCREEN_DEVELOPER]: DevelopersScreen,
    [SCREEN_MAIN]: MainScreen,
    [SCREEN_ADD_WALLETS]: AddWalletsScreen,
    [SCREEN_HELP_TAWK]: TawkLiveChatScreen,
    [SCREEN_AMAZON_CATCH_ALL]: AmazonCatchAllScreen,
    [SCREEN_AMAZON_CHECKOUT]: AmazonCheckoutScreen,
    [SCREEN_AMAZON_NOT_AT_CHECKOUT]: AmazonNotAtCheckoutScreen,
    [SCREEN_AMAZON_ADDRESS_SELECT]: AmazonSelectShippingAddressScreen,
    [SCREEN_AMAZON_PAYMENT_METHOD_SELECT]: AmazonPaymentMethodSelectScreen,
    [SCREEN_AMAZON_PRODUCT]: AmazonProductScreen
};
