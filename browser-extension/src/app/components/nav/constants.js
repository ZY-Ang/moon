/*
 * Copyright (c) 2018 moon
 */

import PayTab from "../pay/PayTab";
import WalletsTab from "../wallets/WalletsTab";
import OrdersTab from "../orders/OrdersTab";
import SettingsTab from "../settings/SettingsTab";

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

/** Tab groups and orderings that are displayed depending on auth, browser and other state */
// export const TAB_GROUP_NON_AUTH = {
//     componentOrder: [TAB_AUTH, TAB_SITES],
//     [TAB_AUTH]: { // TODO: Onboarding flow
//         index: 0,
//         icon: null,
//         name: 'Sign In'
//     },
//     [TAB_SITES]: {
//         index: 1,
//         icon: null,
//         name: 'Sites'
//     }
// };
export const TAB_GROUP_AUTH = {
    components: [
        PayTab,
        WalletsTab,
        OrdersTab,
        SettingsTab
    ],
    navTabs: [
        TAB_PAY,
        TAB_WALLETS,
        TAB_ORDERS,
        TAB_SETTINGS
    ],
    [TAB_PAY]: {
        index: 0,
        icon: "moon",
        name: 'Pay'
    },
    [TAB_WALLETS]: {
        index: 1,
        icon: "wallet",
        name: 'Wallets'
    },
    [TAB_ORDERS]: {
        index: 2,
        icon: "list",
        name: 'Orders'
    },
    [TAB_SETTINGS]: {
        index: 3,
        icon: "cog",
        name: 'Settings'
    }
};
