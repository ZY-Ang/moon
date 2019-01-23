/*
 * Copyright (c) 2019 moon
 */

import React from "react";
import {
    QUERY_SELECTOR_PRODUCT_TITLE
} from "./querySelectors";

const isRestrictedItem = () => {
        const restrictedWords = ["egift", "amazon.com"];
        return Array.from(document.querySelectorAll(QUERY_SELECTOR_PRODUCT_TITLE))
            .reduce((accItem, curItem) =>
                restrictedWords.reduce((accRestrictedWord, curRestrictedWord) =>
                    curItem.innerText.toLowerCase().includes(curRestrictedWord) || accRestrictedWord,
                    false
                ) || accItem, false
            );
}

export default isRestrictedItem;