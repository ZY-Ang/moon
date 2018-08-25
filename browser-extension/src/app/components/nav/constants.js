/*
 * Copyright (c) 2018 moon
 */

import PayTab from "../pay/PayTab";
import WalletsTab from "../wallets/WalletsTab";
import RewardsTab from "../rewards/RewardsTab";
import SettingsTab from "../settings/SettingsTab";

/** Tabs that can only be shown when user is NOT signed in */
export const TAB_AUTH = 'TAB_AUTH';

/** Tabs that can only be shown when user is signed in */
export const TAB_PAY = 'TAB_PAY';

/** Tab that shows the sites that we support and links to them. Yay integrations! */
export const TAB_WALLETS = 'TAB_WALLETS';

/** Tab that shows the sites that we support and links to them. Yay integrations! */
export const TAB_REWARDS = 'TAB_REWARDS';

/** The settings tab that allows user to change  */
export const TAB_SETTINGS = 'TAB_SETTINGS';

/** Tab groups and orderings that are displayed depending on auth, browser and other state */
export const TAB_GROUP_AUTH = {
    components: [
        PayTab,
        // WalletsTab, TODO: Implement post-MVP
        // RewardsTab,
        SettingsTab
    ],
    navTabs: [
        TAB_PAY,
        // TAB_WALLETS, TODO: Implement post-MVP
        // TAB_REWARDS,
        TAB_SETTINGS
    ],
    [TAB_PAY]: {
        index: 0,
        icon: "moon",
        name: 'Pay',
        component: PayTab
    },
    // [TAB_WALLETS]: { TODO: Implement post-MVP
    //     index: 1,
    //     icon: "wallet",
    //     name: 'Wallets',
    //     component: WalletsTab
    // },
    // [TAB_REWARDS]: {
    //     index: 2,
    //     icon: "rocket",
    //     name: 'Rewards',
    //     component: RewardsTab
    // },
    [TAB_SETTINGS]: {
        index: 1,
        icon: "cog",
        name: 'Settings',
        component: SettingsTab
    }
};
