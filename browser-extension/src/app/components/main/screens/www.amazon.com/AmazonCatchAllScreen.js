import React from "react";
import {observeDOM} from "../../../../utils/dom";
import {
    POSSIBLE_SCREENS,
    SCREEN_AMAZON_CHECKOUT,
    SCREEN_AMAZON_NOT_AT_CHECKOUT, SCREEN_AMAZON_PRODUCT
} from "../../../../redux/reducers/constants";
import {
    querySelectorParseObserver,
    querySelectorProductImage,
    querySelectorProductTitle
} from "./constants/querySelectors";
import {ROUTE_AMAZON_CHECKOUT_MUSIC} from "./constants/routes";

/**
 * Parses the page and renders the appropriate screen as opposed to checking window.location.href
 */
class AmazonCatchAllScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            screen: SCREEN_AMAZON_NOT_AT_CHECKOUT
        };
    }

    componentWillMount() {
        this.parse();
        const elementTreesToObserve = document.querySelectorAll(querySelectorParseObserver);
        for (let element of elementTreesToObserve) {
            observeDOM(element, this.parse);
        }
    }

    parse = () => {
        const productTitleElements = document.querySelectorAll(querySelectorProductTitle);
        const productImageElements = document.querySelectorAll(querySelectorProductImage);
        if (
            productTitleElements && !!productTitleElements.length &&
            productImageElements && !!productImageElements.length
        ) {
            this.setState(() => ({screen: SCREEN_AMAZON_PRODUCT}));
        } else {
            this.setState(() => ({screen: SCREEN_AMAZON_NOT_AT_CHECKOUT}));
        }
    };

    render() {
        const Component = POSSIBLE_SCREENS[this.state.screen];
        return <Component/>;
    }
}

export default AmazonCatchAllScreen;
