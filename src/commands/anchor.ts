import { Command } from 'commander'
import { SipHeron, anchorToSolana } from '@sipheron/vdr-core'
import { readFileAsBuffer } from '../utils/file'
import { createSpinner } from '../utils/spinner'
import { handleError } from '../utils/errors'
import { human } from '../output/human'
import { json } from '../output/json'
import { quiet } from '../output/quiet'
import { config } from '../config'
import { readFileSync, existsSync } from 'fs'
import { SOLANA_KEY_PATH } from '../config/paths'
import { Keypair } from '@solana/web3.js'

export const anchorCommand = new Command('anchor')
  .description('Anchor a document\'s fingerprint to the Solana blockchain')
  .argument('<file>', 'Path to the document to anchor')
  .option('-n, --name <name>', 'Human-readable document name')
  .option('-t, --tag <tag...>', 'Tags in key:value format')
  .option('-f, --format <format>', 'Output format: human, json, quiet', 'human')
  .option('--network <network>', 'Network: devnet, mainnet', 'devnet')
  .option('--onchain', 'Anchor directly on-chain using local Solana keypair')
  .action(async (filePath: string, options) => {
    const format = options.format
    const network = options.network as 'devnet' | 'mainnet'

    const spinner = createSpinner('Anchoring document...')

    try {
      const file = readFileAsBuffer(filePath)
      if (format === 'human') spinner.start()

      let result: any

      if (options.onchain) {
        // Direct on-chain mode — uses local Solana keypair
        if (!existsSync(SOLANA_KEY_PATH)) {
          spinner.stop()
          console.error(
            `No Solana keypair found at ${SOLANA_KEY_PATH}\n` +
            `Run: solana-keygen new`
          )
          process.exit(3)
        }

        const keyData = JSON.parse(
          readFileSync(SOLANA_KEY_PATH, 'utf-8')
        )
        const keypair = Keypair.fromSecretKey(
          Uint8Array.from(keyData)
        )

        const onchainResult = await anchorToSolana({
          buffer: file,
          keypair,
          network,
          metadata: options.name || filePath.split('/').pop()
        })
        
        result = {
          id: 'onchain',
          hash: onchainResult.pda.toString(),
          transactionSignature: onchainResult.transactionSignature,
          blockNumber: 0,
          timestamp: new Date().toISOString(),
          status: 'confirmed',
          verificationUrl: onchainResult.explorerUrl,
          network
        }

      } else {
        // Hosted platform mode (or playground if no API key)
        const client = new SipHeron({
          apiKey: config.getApiKey(),
          network
        })

        const metadata: Record<string, string> = {}
        if (options.tag) {
          options.tag.forEach((tag: string) => {
            const [key, value] = tag.split(':')
            if (key && value) metadata[key] = value
          })
        }

        result = await client.anchor({
          file,
          name: options.name || filePath.split('/').pop(),
          metadata
        })
      }

      if (format === 'human') spinner.stop()

      if (format === 'json') {
        json.print(result)
        return
      }

      if (format === 'quiet') {
        quiet.anchored(result.verificationUrl)
        return
      }

      human.anchorResult({
        id: result.id,
        hash: result.hash,
        transactionSignature: result.transactionSignature,
        blockNumber: result.blockNumber,
        timestamp: result.timestamp,
        status: result.status,
        verificationUrl: result.verificationUrl,
        network
      })

    } catch (error) {
      if (format === 'human') spinner.stop()
      handleError(error)
    }
  })
