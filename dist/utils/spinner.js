"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSpinner = createSpinner;
const ora_1 = __importDefault(require("ora"));
function createSpinner(text) {
    return (0, ora_1.default)({
        text,
        color: 'cyan'
    });
}
