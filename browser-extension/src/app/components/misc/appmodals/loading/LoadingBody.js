/*
 * Copyright (c) 2018 moon
 */
import React from "react";
import Throbber from "../../throbber/Throbber";

const LoadingBody = ({loadingText}) => (
    <div className="app-modal">
        <Throbber style={{height: 100}}/>
        <p>{loadingText}</p>
    </div>
);

export default LoadingBody;
