/**
 * @typedef {Object} LogType
 * @property {(msg: any) => void} DEBUG
 * @property {(error: any) => void} ERROR
 */

/** @type {LogType} */ 
module.exports.Log = {
    /**
     * Logs a debug message
     * @param {any} msg - The message to log
     */
    DEBUG: function(msg) {
        console.log('[COLOR PREVIEW DEBUG]', msg);
    },

    /**
     * Logs an error message
     * @param {any} error - The error to log
     */
    ERROR: function(error) {
        console.error('[COLOR PREVIEW ERROR]', error);
    }
};
