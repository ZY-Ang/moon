/*
 * Copyright (c) 2018 moon
 */

/** Tabs that can only be shown when user is NOT signed in */
export const TAB_AUTH = 'TAB_AUTH';

/** Tabs that can only be shown when user is signed in */
export const TAB_PAY = 'TAB_PAY';

/** Tab that shows the sites that we support and links to them. Yay integrations! */
export const TAB_WALLETS = 'TAB_WALLETS';

/** Tab that shows the sites that we support and links to them. Yay integrations! */
export const TAB_ORDERS = 'TAB_ORDERS';

/** The settings tab that allows user to change  */
export const TAB_SETTINGS = 'TAB_SETTINGS';

/** Tab that shows the sites that we support and links to them. Yay integrations! */
export const TAB_SITES = 'TAB_SITES';

/** Tab groups and orderings that are displayed depending on auth, browser and other state */
export const TAB_GROUP_NON_AUTH = {
    components: [],
    [TAB_AUTH]: { // TODO: Onboarding flow
        index: 0,
        icon: null,
        name: 'Sign In'
    },
    [TAB_SITES]: {
        index: 1,
        icon: null,
        name: 'Sites'
    }
};
export const TAB_GROUP_AUTH = {
    components: [],
    [TAB_PAY]: {
        index: 0,
        icon: null,
        name: 'Pay'
    },
    [TAB_WALLETS]: {
        index: 1,
        icon: null,
        name: 'Wallets'
    },
    [TAB_ORDERS]: {
        index: 2,
        icon: null,
        name: 'Orders'
    },
    [TAB_SITES]: {
        index: 3,
        icon: null,
        name: 'Sites'
    },
    [TAB_SETTINGS]: {
        index: 4,
        icon: null,
        name: 'Settings'
    }
};
