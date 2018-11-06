/*
 * Copyright (c) 2018 moon
 */

import React from "react";
import AppRuntime from "../../browser/AppRuntime";
import {connect} from "react-redux";
import {REQUEST_MOON_VALID_CHECKOUT_REPORT} from "../../../constants/events/appEvents";
import {handleErrors} from "../../../utils/errors";
import {
    ACTION_SET_APP_MODAL_ERROR_STATE,
    ACTION_SET_APP_MODAL_LOADING_STATE,
    ACTION_SET_APP_MODAL_SUCCESS_STATE
} from "../../redux/reducers/constants";

/**
 * The product body parses a supported site and displays
 * the product and a message to redirect to checkout
 */
class ProductBody extends React.Component {
    reportIsCheckout = () => {
        this.props.onSetAppModalLoadingState({isActive: true, text: "✈ Sending us a bug report..."});
        AppRuntime.sendMessage(REQUEST_MOON_VALID_CHECKOUT_REPORT, {
            url: window.location.href,
            content: "Unknown Content. Prevent large payload"
        })
            .then(() => {
                this.props.onSetAppModalSuccessState({
                    isActive: true,
                    text: "Hang tight! Support is on the way to you! 🚀🚀🚀"
                });
            })
            .catch(err => {
                handleErrors(err);
                this.props.onSetAppModalErrorState({
                    isActive: true,
                    text: "Hmmm... Something went wrong, try again! If that doesn't work either, you can always call to tell us ❤!"
                });
            })
            .finally(() => this.props.onSetAppModalLoadingState({isActive: false}));
    };

    render() {
        const {
            productTitle,
            productImageAlt,
            productImageURL,
            productPrice,
            querySelectorAddToCart
        } = this.props.pageInformation;
        const addToCartButtonElements = document.querySelectorAll(querySelectorAddToCart);
        return (
            !!productTitle ||
            !!productImageAlt ||
            !!productImageURL ||
            !!productPrice
        )
            ? (
                <div>
                    <div>
                        {
                            productImageURL &&
                            <img
                                className="product-image"
                                src={productImageURL}
                                alt={productImageURL || productImageAlt}
                            />
                        }
                        {
                            !productImageURL &&
                            <span
                                className="site-logo unsupported"
                                role="img"
                                aria-label="Checkout"
                                style={{fontSize: 100}}
                            >
                                🛒
                            </span>
                        }
                        <h4 id="product-title">{productTitle || productImageAlt}</h4>
                        {
                            !!productPrice &&
                            <p>{productPrice.toLocaleString("en-us", {style:"currency",currency:"USD"})}</p>
                        }
                        {
                            !productPrice &&
                            <p>For items with many sizes and/or colors, you'll need to first choose a specific version
                                of this item so we can show you the right price info.</p>
                        }
                    </div>
                    {
                        !!addToCartButtonElements &&
                        !!addToCartButtonElements.length &&
                        <div className="btn-group mb-10">
                            <button
                                className="btn btn-pay btn-primary"
                                onClick={() => addToCartButtonElements[0].click()}
                            >
                                Add To Cart
                            </button>
                        </div>
                    }
                </div>
            ) : (
                <div>
                    <div>
                        <span
                            className="site-logo unsupported"
                            role="img"
                            aria-label="Unsupported Site"
                            style={{fontSize: 100}}
                        >
                            😄
                        </span>
                    </div>
                    <h2>Not at Checkout Page</h2>
                    <p>When you're about to checkout, you'll have the option to pay with cryptocurrency.</p>
                    <a
                        onClick={this.reportIsCheckout}
                        href="#checkoutSupportRequest"
                    >
                        Click here if you think this is a mistake
                    </a>
                </div>
            );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onSetAppModalLoadingState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_LOADING_STATE}),
    onSetAppModalSuccessState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_SUCCESS_STATE}),
    onSetAppModalErrorState: (state) => dispatch({...state, type: ACTION_SET_APP_MODAL_ERROR_STATE})
});

export default connect(null, mapDispatchToProps)(ProductBody);
