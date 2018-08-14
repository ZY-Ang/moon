/*
 * Copyright (c) 2018 moon
 */
/**
 * This file contains utilities for files
 */
export const isFileImagePng = (file) => (file && file.type && file.type === 'image/png');
export const isFileImageJpg = (file) => (file && file.type && file.type === 'image/jpeg');
export const isFileApplicationPdf = (file) => (file && file.type && file.type === 'application/pdf');

/**
 * Returns a formatted file used for
 * uploading to S3 via the background script
 *
 * @param file - WebAPI File type.
 *      @see {@link https://developer.mozilla.org/en-US/docs/Web/API/File/File}
 *      for more information
 *
 * @param name {optional} - name of
 *      the file to override the
 *      default source file.
 */
export const getFormattedFileForS3 = (file, name) => new Promise((resolve, reject) => {
    if (file && file.type) {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve({
                name: name || file.name,
                type: file.type,
                url: reader.result
            });
        };
        reader.readAsDataURL(file);
    } else {
        reject(new Error("Invalid file supplied for getFormattedFileForS3"));
    }
});
