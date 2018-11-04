/*
 * Copyright (c) 2018 moon
 */

import React from "react";

/**
 * The product body parses a supported site and displays
 * the product and a message to redirect to checkout
 */
class ProductBody extends React.Component {
    addToCart = () => {
        const {siteInformation} = this.props;
        const addToCartButtonElements = siteInformation && document.querySelectorAll(siteInformation.querySelectorAddToCart);
        if (
            !!addToCartButtonElements &&
            !!addToCartButtonElements.length &&
            !!addToCartButtonElements[0]
        ) {
            addToCartButtonElements[0].click();
        }
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
                                className="site-logo"
                                src={productImageURL}
                                alt={productImageURL || productImageAlt}
                                style={{height: 200}}
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
                        <p>{productPrice}</p>
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
                                onClick={this.addToCart}
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
                        onClick={console.log}
                        href="#checkoutSupportRequest"
                    >
                        Click here if you think this is a mistake
                    </a>
                </div>
            );
    }
}

export default ProductBody;
