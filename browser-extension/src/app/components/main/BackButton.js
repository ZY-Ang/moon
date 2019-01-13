import React from "react";
import {connect} from "react-redux";
import FaIcon from "../misc/fontawesome/FaIcon";
import {ACTION_POP_SCREEN} from "../../redux/reducers/constants";
import AppMixpanel from "../../services/AppMixpanel";

class BackButton extends React.Component {
    render() {
        return (
            <div
                className="btn-nav-back btn-nav"
                onClick={() => {
                    AppMixpanel.track('button_click_back');
                    this.props.onPopScreen();
                }}
            >
                <FaIcon icon="chevron-left"/> Back
            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => ({
    onPopScreen: (screen) => dispatch({screen, type: ACTION_POP_SCREEN})
});

export default connect(null, mapDispatchToProps)(BackButton);
