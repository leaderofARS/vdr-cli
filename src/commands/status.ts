import { Command } from 'commander'
import { verifyOnChain, deriveAnchorAddress } from '@sipheron/vdr-core'
import { isValidHash } from '../utils/file'
import { createSpinner } from '../utils/spinner'
import { handleError } from '../utils/errors'
import { human } from '../output/human'
import { json } from '../output/json'
import { PublicKey, Connection } from '@solana/web3.js'
import chalk from 'chalk'

export const statusCommand = new Command('status')
  .description('Check the on-chain status of an anchored document hash')
  .argument('<hash>', 'SHA-256 hash of the document (64 hex chars)')
  .option('--owner <publicKey>', 'Solana public key of the document owner (required for on-chain lookup)')
  .option('-f, --format <format>', 'Output format: human, json', 'human')
  .option('--network <network>', 'Network: devnet, mainnet', 'devnet')
  .option('--program-id <id>', 'Custom Solana program ID (advanced)')
  .action(async (hash: string, options) => {
    const network = options.network as 'devnet' | 'mainnet'

    if (!isValidHash(hash)) {
      console.error(chalk.red('\n✗ Invalid hash. Must be a 64-character hex SHA-256 string.\n'))
      process.exit(3)
    }

    if (!options.owner) {
      console.log(chalk.yellow('\n⚠  --owner <publicKey> is required for direct on-chain status.\n'))
      console.log(chalk.gray('  This is the Solana public key that was used when anchoring.'))
      console.log(chalk.gray('  Example:'))
      console.log(chalk.cyan(`    sipheron status ${hash.slice(0, 16)}... --owner <YourWalletPublicKey>\n`))
      process.exit(1)
    }

    let ownerPk: PublicKey
    try {
      ownerPk = new PublicKey(options.owner)
    } catch {
      console.error(chalk.red(`\n✗ Invalid public key: ${options.owner}\n`))
      process.exit(3)
    }

    const spinner = createSpinner('Reading from Solana...')
    if (options.format === 'human') spinner.start()

    try {
      // ── Direct on-chain read — zero SipHeron API dependency ─────────────────
      const result = await verifyOnChain({
        hash: hash.toLowerCase(),
        network,
        ownerPublicKey: ownerPk,
        ...(options.programId && { programId: options.programId }),
      })

      // Derive PDA for display
      const pda = deriveAnchorAddress(hash.toLowerCase(), ownerPk, (options.programId ? new PublicKey(options.programId) : network) as any)

      // Enrich with block timestamp via public RPC
      let blockTime: string | undefined
      let slot = 0
      if (result.timestamp) {
        blockTime = new Date(result.timestamp * 1000).toISOString()
      }

      spinner.stop()

      if (options.format === 'json') {
        json.print({
          hash,
          pda: pda.toBase58(),
          authentic: result.authentic,
          isRevoked: result.isRevoked || false,
          owner: result.owner,
          timestamp: blockTime,
          metadata: result.metadata,
          network,
          mode: 'direct-onchain',
        })
        return
      }

      console.log()
      human.label('Hash',      hash)
      human.label('PDA',       pda.toBase58())
      human.label('Owner',     result.owner || options.owner)
      human.label('Network',   `Solana ${network}`)

      if (!result.authentic) {
        human.label('Status', chalk.yellow('NOT FOUND'))
        console.log()
        console.log(chalk.gray('No anchor record exists at this PDA on-chain.'))
        console.log()
        return
      }

      if (result.isRevoked) {
        human.label('Status', chalk.red('REVOKED ✗'))
      } else {
        human.label('Status', chalk.green('CONFIRMED ✓'))
      }

      human.label('Anchored',  blockTime || 'unknown')
      if (result.metadata) {
        human.label('Metadata', result.metadata)
      }
      console.log()
      console.log(chalk.gray('Mode: direct on-chain read — no API used'))
      console.log()

    } catch (error) {
      spinner.stop()
      handleError(error)
    }
  })
