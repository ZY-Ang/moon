import React from "react";
import {
    POSSIBLE_SCREENS,
    SCREEN_AMAZON_NOT_AT_CHECKOUT, SCREEN_AMAZON_PRODUCT
} from "../../../../redux/reducers/constants";
import {
    QUERY_SELECTOR_PRODUCT_IMAGE,
    QUERY_SELECTOR_PRODUCT_TITLE
} from "./constants/querySelectors";

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
    }

    parse = () => {
        const productTitleElements = document.querySelectorAll(QUERY_SELECTOR_PRODUCT_TITLE);
        const productImageElements = document.querySelectorAll(QUERY_SELECTOR_PRODUCT_IMAGE);
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
