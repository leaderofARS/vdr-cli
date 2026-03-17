"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readFileAsBuffer = readFileAsBuffer;
exports.isValidHash = isValidHash;
exports.formatFileSize = formatFileSize;
const fs_1 = require("fs");
const path_1 = require("path");
function readFileAsBuffer(filePath) {
    const resolved = (0, path_1.resolve)(filePath);
    if (!(0, fs_1.existsSync)(resolved)) {
        throw new Error(`File not found: ${filePath}`);
    }
    const stats = (0, fs_1.statSync)(resolved);
    if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${filePath}`);
    }
    return (0, fs_1.readFileSync)(resolved);
}
function isValidHash(input) {
    return /^[a-f0-9]{64}$/i.test(input);
}
function formatFileSize(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
