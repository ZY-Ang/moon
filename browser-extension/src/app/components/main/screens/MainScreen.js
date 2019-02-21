import React from "react";
import {connect} from "react-redux";
import {ACTION_PUSH_SCREEN} from "../../../redux/reducers/constants";
import AmazonCheckoutScreen from "./www.amazon.com/AmazonCheckoutScreen";
import AmazonSelectShippingAddressScreen from "./www.amazon.com/AmazonSelectShippingAddressScreen";
import AmazonPaymentMethodSelectScreen from "./www.amazon.com/AmazonPaymentMethodSelectScreen";
import UnsupportedScreen from "./unsupported/UnsupportedScreen";
import AmazonCatchAllScreen from "./www.amazon.com/AmazonCatchAllScreen";
import AmazonSelectBillingAddressScreen from "./www.amazon.com/AmazonSelectBillingAddressScreen";
import AmazonGiftOptionScreen from "./www.amazon.com/AmazonGiftOptionScreen";
import {
    ROUTE_AMAZON_CHECKOUT_DEFAULT,
    ROUTE_AMAZON_CHECKOUT_DEFAULT_BILLING_ADDRESS_SELECT,
    ROUTE_AMAZON_CHECKOUT_DEFAULT_GIFT_OPTION_SELECT,
    ROUTE_AMAZON_CHECKOUT_DEFAULT_PAYMENT_SELECT,
    ROUTE_AMAZON_CHECKOUT_DEFAULT_SHIPPING_ADDRESS_SELECT,
    ROUTE_AMAZON_CHECKOUT_MUSIC
} from "./www.amazon.com/constants/routes";
import {
    ROUTE_DOMINOS_ORDER_ADDONS,
    ROUTE_DOMINOS_ORDER_LOCATION_SEARCH,
    ROUTE_DOMINOS_ORDER_PAYMENT
} from "./www.dominos.com/constants/routes";
import DominosOrderPaymentScreen from "./www.dominos.com/DominosOrderPaymentScreen";
import {isRouteMatching} from "../../../../utils/url";
import DominosOrderCheckoutScreen from "./www.dominos.com/DominosOrderCheckoutScreen";
import DominosCatchAllScreen from "./www.dominos.com/DominosCatchAllScreen";
import DominosOrderLocationSearchScreen from "./www.dominos.com/DominosOrderLocationSearchScreen";

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
                    path: ROUTE_AMAZON_CHECKOUT_DEFAULT_SHIPPING_ADDRESS_SELECT,
                    component: AmazonSelectShippingAddressScreen
                },
                {
                    path: ROUTE_AMAZON_CHECKOUT_DEFAULT_PAYMENT_SELECT,
                    component: AmazonPaymentMethodSelectScreen
                },
                {
                    path: ROUTE_AMAZON_CHECKOUT_DEFAULT_BILLING_ADDRESS_SELECT,
                    component: AmazonSelectBillingAddressScreen
                },
                {
                    path: ROUTE_AMAZON_CHECKOUT_DEFAULT_GIFT_OPTION_SELECT,
                    component: AmazonGiftOptionScreen
                },
                {
                    path: "*",
                    component: AmazonCatchAllScreen
                }
            ],
            "www.dominos.com": [
                {
                    path: ROUTE_DOMINOS_ORDER_PAYMENT,
                    component: DominosOrderPaymentScreen
                },
                {
                    path: ROUTE_DOMINOS_ORDER_ADDONS,
                    component: DominosOrderCheckoutScreen
                },
                {
                    path: ROUTE_DOMINOS_ORDER_LOCATION_SEARCH,
                    component: DominosOrderLocationSearchScreen
                },
                {
                    pathname: "*",
                    component: DominosCatchAllScreen
                }
            ]
        };
        if (!!componentMap[host]) {
            for (let i = 0; i < componentMap[host].length; i++) {
                const Component = componentMap[host][i].component;
                if (isRouteMatching(pathname, componentMap[host][i].path)) {
                    return <Component/>;
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
