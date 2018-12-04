import React from "react";
import {connect} from "react-redux";
import SwipeableViews from "react-swipeable-views";
import {POSSIBLE_SCREENS} from "../../redux/reducers/constants";
import UnsupportedScreen from "./screens/unsupported/UnsupportedScreen";

class MainFlow extends React.Component {
    componentDidMount() {
        if (this.tabSwiper) {
            setTimeout(this.tabSwiper.updateHeight, 100);
        }
    }

    componentDidUpdate() {
        if (this.tabSwiper) {
            this.tabSwiper.updateHeight();
        }
    }

    render() {
        return (
            <SwipeableViews
                animateHeight
                ref={c => (this.tabSwiper = c)}
                disabled
                style={{height: '100%', overflowY: 'hidden !important'}}
                index={this.props.mainFlowIndex}
            >
                {
                    this.props.mainFlowTabs.map((tab, index) => {
                        const Component = POSSIBLE_SCREENS[tab];
                        if (!Component) {
                            return <UnsupportedScreen key={index}/>
                        } else {
                            return <Component key={index}/>
                        }
                    })
                }
            </SwipeableViews>
        );
    }
}

const mapStateToProps = (state) => ({
    mainFlowIndex: state.appState.mainFlowIndex,
    mainFlowTabs: state.appState.mainFlowTabs
});

export default connect(mapStateToProps)(MainFlow);
