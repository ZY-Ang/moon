/*
 * Copyright (c) 2018 moon
 */

import React from "react";

/**
 * The product body parses a supported site and displays
 * the product and a message to redirect to checkout
 */
class ProductBody extends React.Component {
    render() {
        const {pathnameCheckout, product} = this.props;
        return (
            !!product.title ||
            !!product.imageAlt ||
            !!product.imageURL ||
            !!product.amount
        )
            ? (
                <div>
                    <div>
                        {
                            product.imageURL &&
                            <img
                                className="site-logo"
                                src={product.imageURL}
                                alt={product.title || product.imageAlt}
                                style={{height: 200}}
                            />
                        }
                        {
                            !product.imageURL &&
                            <span
                                className="site-logo unsupported"
                                role="img"
                                aria-label="Checkout"
                                style={{fontSize: 100}}
                            >
                                🛒
                            </span>
                        }
                        <h4 id="product-title">{product.title || product.imageAlt}</h4>
                        {
                            !!product.amount &&
                            <p>{`$${product.amount}`}</p>
                        }
                        {
                            !product.amount &&
                            <p>For items with many sizes and/or colors, you'll need to first choose a specific version
                                of this item so we can show you the right price info.</p>
                        }
                    </div>
                    <div className="btn-group mb-10">
                        <button
                            className="btn btn-pay btn-primary"
                            onClick={() => window.location.replace(pathnameCheckout)}
                        >
                            Checkout
                        </button>
                    </div>
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
                        🤔
                    </span>
                    </div>
                    <h2>Not at checkout page</h2>
                    <p>Head over to the checkout page with a loaded cart to get shoppin with cryptocurrency!</p>
                    <a onClick={console.log} href="#checkoutSupportRequest">Click here if you think this is a
                        mistake</a>
                </div>
            );
    }
}

export default ProductBody;
