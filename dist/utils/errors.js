"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = handleError;
const chalk_1 = __importDefault(require("chalk"));
function handleError(error) {
    if (error instanceof Error) {
        console.error(chalk_1.default.red(`\n✗ Error: ${error.message}\n`));
    }
    else {
        console.error(chalk_1.default.red('\n✗ An unexpected error occurred\n'));
    }
    process.exit(3);
}
