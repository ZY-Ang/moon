import React from "react";
import {connect} from "react-redux";
import FaIcon from "../../../misc/fontawesome/FaIcon";
import {ACTION_PUSH_SCREEN, SCREEN_SETTINGS} from "../../../../redux/reducers/constants";
import AppMixpanel from "../../../../services/AppMixpanel";

const SettingsIcon = (props) => (
    <div
        className="settings-icon btn-nav"
        onClick={() => {
            AppMixpanel.track('button_click_settings');
            !!props.onPushScreen && props.onPushScreen(SCREEN_SETTINGS);
        }}
    >
        <FaIcon icon="cog"/>
    </div>
);

const mapDispatchToProps = (dispatch) => ({
    onPushScreen: (screen) => dispatch({screen, type: ACTION_PUSH_SCREEN})
});

export default connect(null, mapDispatchToProps)(SettingsIcon);
