import React from "react";
import "./AmazonProductScreen.css";
import {connect} from "react-redux";
import AmazonSiteLogo from "./AmazonSiteLogo";
import SettingsIcon from "../settings/SettingsIcon";
import {
    querySelectorProductImage,
    querySelectorProductPrice,
    querySelectorProductTitle
} from "./constants/querySelectors";

// Note: Amazon has no obvious product page schema so this should be a catchall page, which will in turn, render AmazonNotAtCheckoutPage.
class AmazonProductScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: null,
            imageURL: null,
            imageAlt: null,
            price: null
        };
    }

    componentWillMount() {
        this.parse();
    }

    parse = () => {
        const productTitleElements = document.querySelectorAll(querySelectorProductTitle);
        const productImageElements = document.querySelectorAll(querySelectorProductImage);
        const productPriceElements = document.querySelectorAll(querySelectorProductPrice);
        this.setState(() => ({
            title: productTitleElements && productTitleElements[0] && productTitleElements[0].innerText,
            imageURL: productImageElements && productImageElements[0] && productImageElements[0].src,
            imageAlt: productImageElements && productImageElements[0] && productImageElements[0].alt,
            price: productPriceElements && productPriceElements[0] &&
                Number(productPriceElements[0].innerText.replace(/[^0-9.-]+/g, ""))
        }));
    };

    render() {
        const {title, imageURL, imageAlt, price} = this.state;
        return (
            <div className="moon-tab text-center">
                <div className="settings-icon-parent">
                    <AmazonSiteLogo/>
                    <SettingsIcon/>
                </div>
                <div>
                    {imageURL && <img className="product-image" src={imageURL} alt={imageURL || imageAlt}/>}
                    <h4 id="product-title">{title || imageAlt}</h4>
                    {!!price && <p>{price.toLocaleString("en-us", {style:"currency",currency:"USD"})}</p>}
                    {
                        !price &&
                        <p>For items with many sizes and/or colors, you'll need to first choose a specific version
                        of this item so we can show you the right price info.</p>
                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    authUser: state.sessionState.authUser,
    selectedWallet: state.sessionState.selectedWallet
});

export default connect(mapStateToProps)(AmazonProductScreen);
