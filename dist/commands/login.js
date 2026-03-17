"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginCommand = void 0;
const commander_1 = require("commander");
const readline_1 = require("readline");
const config_1 = require("../config");
const chalk_1 = __importDefault(require("chalk"));
const axios_1 = __importDefault(require("axios"));
const config_2 = require("@sipheron/vdr-core/dist/client/config");
exports.loginCommand = new commander_1.Command('login')
    .description('Authenticate with your SipHeron API key')
    .action(async () => {
    console.log();
    console.log(chalk_1.default.gray('Get a free API key at sipheron.com'));
    console.log(chalk_1.default.gray('100 free anchors/month. No credit card required.'));
    console.log();
    const rl = (0, readline_1.createInterface)({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter your API key: ', async (apiKey) => {
        rl.close();
        if (!apiKey || apiKey.trim().length === 0) {
            console.log(chalk_1.default.red('No API key provided.'));
            process.exit(1);
        }
        try {
            const network = config_1.config.getNetwork();
            const baseUrl = config_2.DEFAULTS.baseUrls[network];
            // Validate the key by making a test request directly
            const response = await axios_1.default.get(`${baseUrl}/api/keys/me`, {
                headers: { 'Authorization': `Bearer ${apiKey.trim()}` }
            });
            const account = response.data;
            config_1.config.setApiKey(apiKey.trim());
            console.log();
            console.log(chalk_1.default.green(`✓ Authenticated as ${account.organizationName || 'User'}`));
            console.log(chalk_1.default.gray('API key stored securely.'));
            console.log();
        }
        catch {
            console.log(chalk_1.default.red('\n✗ Invalid API key. Please try again.\n'));
            process.exit(1);
        }
    });
});
