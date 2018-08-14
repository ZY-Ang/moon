/*
 * Copyright (c) 2018 moon
 */

import AWS from "../../config/aws/AWS";
import dataUriToBuffer from "data-uri-to-buffer";

/**
 * Utility class for s3-related services that
 * extends and overrides functionality of {@class AWS.S3}
 *
 * @class
 */
class S3 extends AWS.S3 {
    /**
     * Uploads a formatted file from the content script to a S3 bucket.
     *
     * @param Bucket - S3 bucket identifier.
     * @param folder - S3 folder to be uploaded to.
     * @param file - formatted file to be uploaded.
     *      Should be of @type {object} {
     *          url {string}: base64-encoded dataURI representation of the file,
     *          name {string}: the name of the file or overridden name,
     *          type {string}: MIME-type of the file
     *      }
     * @param {string} [name] - Optional file name
     *      to override the value in {@code file.name}.
     *
     * @see {@link https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property}
     * @return {ManagedUpload}
     */
    static upload = (Bucket, folder, file, name) => {
        return (new AWS.S3())
            .upload({
                Bucket,
                Key: `${folder}/${name || file.name}`,
                Body: dataUriToBuffer(file.url),
                ContentEncoding: 'base64',
                ContentType: file.type
            });
    };
}

export default S3;
