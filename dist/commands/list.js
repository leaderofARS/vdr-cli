"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCommand = void 0;
const commander_1 = require("commander");
const vdr_core_1 = require("@sipheron/vdr-core");
const config_1 = require("../config");
const errors_1 = require("../utils/errors");
const json_1 = require("../output/json");
const spinner_1 = require("../utils/spinner");
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
exports.listCommand = new commander_1.Command('list')
    .description('List your anchored documents')
    .option('-l, --limit <number>', 'Number of results', '10')
    .option('-s, --status <status>', 'Filter by status: confirmed, pending, failed')
    .option('--from <date>', 'Filter from date (YYYY-MM-DD)')
    .option('-f, --format <format>', 'Output format: human, json', 'human')
    .action(async (options) => {
    if (!config_1.config.isAuthenticated()) {
        console.log(chalk_1.default.yellow('\nLogin required for list command.\n'));
        console.log(chalk_1.default.gray('Run: sipheron login'));
        return;
    }
    const spinner = (0, spinner_1.createSpinner)('Fetching anchors...');
    try {
        const client = new vdr_core_1.SipHeron({
            apiKey: config_1.config.getApiKey(),
            network: config_1.config.getNetwork()
        });
        spinner.start();
        // vdr-core exposes top level .list()
        const result = await client.list({
            limit: parseInt(options.limit),
            status: options.status
        });
        spinner.stop();
        if (options.format === 'json') {
            json_1.json.print(result);
            return;
        }
        const records = result.records || [];
        if (records.length === 0) {
            console.log(chalk_1.default.gray('\nNo anchors found.\n'));
            console.log(chalk_1.default.gray('Run: sipheron anchor <file>'));
            return;
        }
        const table = new cli_table3_1.default({
            head: [
                chalk_1.default.gray('ID'),
                chalk_1.default.gray('Name'),
                chalk_1.default.gray('Status'),
                chalk_1.default.gray('Date')
            ],
            style: { head: [], border: [] }
        });
        records.forEach((anchor) => {
            table.push([
                anchor.id,
                anchor.name || chalk_1.default.gray('unnamed'),
                anchor.status === 'confirmed'
                    ? chalk_1.default.green('Confirmed')
                    : chalk_1.default.yellow(anchor.status),
                new Date(anchor.timestamp).toLocaleDateString()
            ]);
        });
        console.log();
        console.log(table.toString());
        console.log(chalk_1.default.gray(`\nShowing ${records.length} anchors. ` +
            `sipheron list --limit 50 for more.\n`));
    }
    catch (error) {
        spinner.stop();
        (0, errors_1.handleError)(error);
    }
});
