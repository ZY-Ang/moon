import React from "react";
import {connect} from "react-redux";
import SwipeableViews from "react-swipeable-views";
import {ACTION_SET_SCREEN, POSSIBLE_SCREENS} from "../../redux/reducers/constants";
import UnsupportedScreen from "./screens/unsupported/UnsupportedScreen";

class MainFlow extends React.Component {
    componentDidMount() {
        if (this.tabSwiper) {
            setTimeout(this.tabSwiper.updateHeight, 100);
        }
    }

    componentDidUpdate() {
        if (this.tabSwiper) {
            setTimeout(this.tabSwiper.updateHeight, 100);
        }
    }

    render() {
        return (
            <SwipeableViews
                ref={c => (this.tabSwiper = c)}
                animateHeight
                enableMouseEvents
                resistance
                style={{width: '100%', overflowY: 'hidden !important'}}
                onChangeIndex={mainFlowIndex => this.props.onSetScreenState({mainFlowIndex})}
                index={this.props.mainFlowIndex}
            >
                {
                    this.props.mainFlowTabs.map((tab, index) => {
                        const Component = POSSIBLE_SCREENS[tab];
                        if (!Component) {
                            return <UnsupportedScreen key={index} index={index}/>
                        } else {
                            return <Component key={index} index={index}/>
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

const mapDispatchToProps = (dispatch) => ({
    onSetScreenState: (state) => dispatch({...state, type: ACTION_SET_SCREEN})
});

export default connect(mapStateToProps, mapDispatchToProps)(MainFlow);
