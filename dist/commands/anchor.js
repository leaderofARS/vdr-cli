"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anchorCommand = void 0;
const commander_1 = require("commander");
const vdr_core_1 = require("@sipheron/vdr-core");
const file_1 = require("../utils/file");
const spinner_1 = require("../utils/spinner");
const errors_1 = require("../utils/errors");
const human_1 = require("../output/human");
const json_1 = require("../output/json");
const quiet_1 = require("../output/quiet");
const config_1 = require("../config");
const fs_1 = require("fs");
const paths_1 = require("../config/paths");
const web3_js_1 = require("@solana/web3.js");
exports.anchorCommand = new commander_1.Command('anchor')
    .description('Anchor a document\'s fingerprint to the Solana blockchain')
    .argument('<file>', 'Path to the document to anchor')
    .option('-n, --name <name>', 'Human-readable document name')
    .option('-t, --tag <tag...>', 'Tags in key:value format')
    .option('-f, --format <format>', 'Output format: human, json, quiet', 'human')
    .option('--network <network>', 'Network: devnet, mainnet', 'devnet')
    .option('--onchain', 'Anchor directly on-chain using local Solana keypair')
    .action(async (filePath, options) => {
    const format = options.format;
    const network = options.network;
    const spinner = (0, spinner_1.createSpinner)('Anchoring document...');
    try {
        const file = (0, file_1.readFileAsBuffer)(filePath);
        if (format === 'human')
            spinner.start();
        let result;
        if (options.onchain) {
            // Direct on-chain mode — uses local Solana keypair
            if (!(0, fs_1.existsSync)(paths_1.SOLANA_KEY_PATH)) {
                spinner.stop();
                console.error(`No Solana keypair found at ${paths_1.SOLANA_KEY_PATH}\n` +
                    `Run: solana-keygen new`);
                process.exit(3);
            }
            const keyData = JSON.parse((0, fs_1.readFileSync)(paths_1.SOLANA_KEY_PATH, 'utf-8'));
            const keypair = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(keyData));
            const onchainResult = await (0, vdr_core_1.anchorToSolana)({
                buffer: file,
                keypair,
                network,
                metadata: options.name || filePath.split('/').pop()
            });
            result = {
                id: 'onchain',
                hash: onchainResult.pda.toString(),
                transactionSignature: onchainResult.transactionSignature,
                blockNumber: 0,
                timestamp: new Date().toISOString(),
                status: 'confirmed',
                verificationUrl: onchainResult.explorerUrl,
                network
            };
        }
        else {
            // Hosted platform mode (or playground if no API key)
            const client = new vdr_core_1.SipHeron({
                apiKey: config_1.config.getApiKey(),
                network
            });
            const metadata = {};
            if (options.tag) {
                options.tag.forEach((tag) => {
                    const [key, value] = tag.split(':');
                    if (key && value)
                        metadata[key] = value;
                });
            }
            result = await client.anchor({
                file,
                name: options.name || filePath.split('/').pop(),
                metadata
            });
        }
        if (format === 'human')
            spinner.stop();
        if (format === 'json') {
            json_1.json.print(result);
            return;
        }
        if (format === 'quiet') {
            quiet_1.quiet.anchored(result.verificationUrl);
            return;
        }
        human_1.human.anchorResult({
            id: result.id,
            hash: result.hash,
            transactionSignature: result.transactionSignature,
            blockNumber: result.blockNumber,
            timestamp: result.timestamp,
            status: result.status,
            verificationUrl: result.verificationUrl,
            network
        });
    }
    catch (error) {
        if (format === 'human')
            spinner.stop();
        (0, errors_1.handleError)(error);
    }
});
