"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutCommand = void 0;
const commander_1 = require("commander");
const config_1 = require("../config");
const chalk_1 = __importDefault(require("chalk"));
exports.logoutCommand = new commander_1.Command('logout')
    .description('Remove stored API key')
    .action(() => {
    config_1.config.clearApiKey();
    console.log(chalk_1.default.green('\n✓ Logged out successfully\n'));
});
