/*
 * Copyright (c) 2018 moon
 */
import React from "react";
import Throbber from "../../throbber/Throbber";

const LoadingBody = ({loadingText}) => (
    <div className="app-modal">
        <Throbber style={{height: 100}}/>
        <div className="text-center" style={{padding:'0 30px'}}>
            <p>{loadingText}</p>
        </div>
    </div>
);

export default LoadingBody;
