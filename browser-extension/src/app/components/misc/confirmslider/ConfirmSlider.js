import React from "react";
import "./ConfirmSlider.css";
import AppRuntime from "../../../browser/AppRuntime";
import SwipeableViews from "react-swipeable-views";
import FaIcon from "../fontawesome/FaIcon";
import moonLogo from "../../../../../../assets/icons/logo_32_text_thick.png";
import ThrobberWhite from "../throbber/ThrobberWhite";

/**
 * Slider to confirm actions
 */
class ConfirmSlider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            index: 2
        };
    }

    componentDidUpdate() {
        const {action} = this.props;
        if (this.state.index < 2) {
            action();
            this.setState(() => ({index: 2}));
        }
    }

    render() {
        const {index} = this.state;
        const {loading} = this.props;
        return (
            <SwipeableViews
                enableMouseEvents={!loading && index === 2}
                ref={c => (this.slider = c)}
                style={{
                    height: 'auto',
                    overflowY: 'hidden !important',
                    borderRadius: 3
                }}
                hysteresis={0.85}
                ignoreNativeScroll
                onChangeIndex={index => this.setState(() => ({index}))}
                index={loading ? 0 : index}
            >
                <div className="confirm-slide-primary">
                    <div className="loading"><ThrobberWhite/></div>
                </div>
                <div className="confirm-slide-primary">
                    <div className="confirm"/>
                </div>
                <div className="confirm-slide-primary">
                    <div className="slider">
                        <FaIcon icon="chevron-right" className="first-chevron"/> <FaIcon icon="chevron-right" className="second-chevron"/> <FaIcon icon="chevron-right" className="third-chevron"/><p className="my-0 pl-2 text-white">Slide to Pay With</p><img className="pl-1" src={AppRuntime.getURL(moonLogo)} alt="Moon"/>
                    </div>
                </div>
            </SwipeableViews>
        );
    }
}

export default ConfirmSlider;
