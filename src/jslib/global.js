/**
 * Created by billy on 2017/2/20.
 */
require("./utils/utils");

global.log = require("./utils/log");

exports.readline = require('./utils/readLine');
exports.path = require("path");
exports.fs = require("fs");
exports.file = require("./utils/FileUtil");
exports.data = require("./data/DataPool");

global.g = exports;