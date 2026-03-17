"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOLANA_KEY_PATH = exports.CONFIG_FILE = exports.CONFIG_DIR = void 0;
const os_1 = require("os");
const path_1 = require("path");
exports.CONFIG_DIR = (0, path_1.join)((0, os_1.homedir)(), '.config', 'sipheron');
exports.CONFIG_FILE = (0, path_1.join)(exports.CONFIG_DIR, 'config.json');
exports.SOLANA_KEY_PATH = (0, path_1.join)((0, os_1.homedir)(), '.config', 'solana', 'id.json');
