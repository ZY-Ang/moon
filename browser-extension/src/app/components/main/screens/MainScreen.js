import React from "react";
import {connect} from "react-redux";
import {ACTION_PUSH_SCREEN} from "../../../redux/reducers/constants";
import AmazonCheckoutScreen from "./www.amazon.com/AmazonCheckoutScreen";
import AmazonAddressSelectScreen from "./www.amazon.com/AmazonAddressSelectScreen";
import AmazonPaymentMethodSelectScreen from "./www.amazon.com/AmazonPaymentMethodSelectScreen";
import UnsupportedScreen from "./unsupported/UnsupportedScreen";
import AmazonCatchAllScreen from "./www.amazon.com/AmazonCatchAllScreen";
//just added new line of code here
import AmazonSelectBillingAddress from "./www.amazon.com/AmazonSelectBillingAddress";

import {
    ROUTE_AMAZON_CHECKOUT_DEFAULT,
    ROUTE_AMAZON_CHECKOUT_DEFAULT_ADDRESS_SELECT,
    ROUTE_AMAZON_CHECKOUT_DEFAULT_PAYMENT_SELECT,
    ROUTE_AMAZON_CHECKOUT_MUSIC, ROUTE_AMAZON_SELECT_BILLING_ADDRESS
} from "./www.amazon.com/constants/routes";

/**
 *
 * Host-ful and Pathname-ful router for the first page of the main flow
 */
class MainScreen extends React.Component {
    parseURL = () => {
        try {
            return new URL(this.props.tab.url);
        } catch (e) {
            return new URL(window.location.href);
        }
    };

    render() {
        const {host, pathname} = this.parseURL();
        const componentMap = {
            // TODO: Use regex in an array like Google's manifest.json to figure out which component to parse
            "www.amazon.com": [
                {
                    path: ROUTE_AMAZON_CHECKOUT_DEFAULT,
                    component: AmazonCheckoutScreen
                },
                {
                    path: ROUTE_AMAZON_CHECKOUT_MUSIC,
                    component: AmazonCheckoutScreen
                },
                {
                    path: ROUTE_AMAZON_CHECKOUT_DEFAULT_ADDRESS_SELECT,
                    component: AmazonAddressSelectScreen
                },
                {
                    path: ROUTE_AMAZON_CHECKOUT_DEFAULT_PAYMENT_SELECT,
                    component: AmazonPaymentMethodSelectScreen
                },
                // select billing address(new line)
                {
                    path: ROUTE_AMAZON_SELECT_BILLING_ADDRESS,
                    component: AmazonSelectBillingAddress
                },
                {
                    path: "*",
                    component: AmazonCatchAllScreen
                }
            ]
        };
        if (!!componentMap[host]) {
            for (let i = 0; i < componentMap[host].length; i++) {
                const Component = componentMap[host][i].component;
                if (componentMap[host][i].path === "*") {
                    return <Component/>
                } else if (!!pathname.match(componentMap[host][i].path)) {
                    return <Component/>
                }
            }
        }
        return <UnsupportedScreen/>;
    }
}

const mapStateToProps = (state) => ({
    tab: state.sessionState.tab
});

const mapDispatchToProps = (dispatch) => ({
    onPushScreen: (screen) => dispatch({screen, type: ACTION_PUSH_SCREEN})
});

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
