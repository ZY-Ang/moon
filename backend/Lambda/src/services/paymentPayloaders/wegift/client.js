/*
 * Copyright (c) 2019 moon
 */
import axios from "axios";

const baseURL = process.env.NODE_ENV === "production"
    ? "https://api.wegift.io/api/b2b-sync/v1"
    : "https://playground.wegift.io/api/b2b-sync/v1";
const username = process.env.NODE_ENV === "production"
    ? "kenco_services"
    : "c-kdyz8ea4";
const password = process.env.NODE_ENV === "production"
    ? "KS?SJVH9W4bW$VDnA6"
    : "YGnaZtZk9tr%@j6os1";

/**
 * @see {@link https://gift.wegift.io/docs/api/b2b-sync/v1/} for more information
 */
const weGiftClient = axios.create({
    baseURL,
    auth: {username, password}
});

export default weGiftClient;
