/*
 * Copyright (c) 2019 moon
 */

import React from "react";
import {QUERY_SELECTOR_CHECKOUT_CART_ITEM_TITLE, QUERY_SELECTOR_PRODUCT_TITLE} from "../constants/querySelectors";

const restrictedWords = [
    "egift",
    "amazon.com"
];

/**
 * Returns {@code true} if the current screen
 *  (assumed to be a product screen)
 *  is of a product that is a restricted item,
 *  {@code false} otherwise
 */
export const isProductRestrictedItem = () => {
    return Array.from(document.querySelectorAll(QUERY_SELECTOR_PRODUCT_TITLE))
        .reduce((accItem, curItem) =>
            restrictedWords.reduce((accRestrictedWord, curRestrictedWord) =>
                curItem.innerText.toLowerCase().includes(curRestrictedWord) || accRestrictedWord,
                false
            ) || accItem,
            false
        );
};

/**
 * Returns {@code true} if the current screen
 *  (assumed to be a checkout screen)
 *  contains cart items that are restricted,
 *  {@code false} otherwise
 */
export const isCartContainsRestrictedItems = () => {
    return Array.from(document.querySelectorAll(QUERY_SELECTOR_CHECKOUT_CART_ITEM_TITLE))
        .reduce((accItem, curItem) =>
            restrictedWords.reduce((accRestrictedWord, curRestrictedWord) =>
                curItem.innerText.toLowerCase().includes(curRestrictedWord) || accRestrictedWord,
                false
            ) || accItem,
            false
        );
};
