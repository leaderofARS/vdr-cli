import { Command } from 'commander'
import { verifyOnChain, verifyHash, hashDocument } from '@sipheron/vdr-core'
import { readFileAsBuffer, isValidHash } from '../utils/file'
import { createSpinner } from '../utils/spinner'
import { handleError } from '../utils/errors'
import { human } from '../output/human'
import { json } from '../output/json'
import { quiet } from '../output/quiet'
import { PublicKey, Connection } from '@solana/web3.js'
import chalk from 'chalk'

export const verifyCommand = new Command('verify')
  .description('Verify a document\'s authenticity against its blockchain anchor')
  .argument('<file-or-hash>', 'Document file path or SHA-256 hash')
  .option('-f, --format <format>', 'Output format: human, json, quiet', 'human')
  .option('-n, --network <network>', 'Network: devnet, mainnet', 'devnet')
  .option(
    '--owner <publicKey>',
    'Solana public key of the document owner for direct on-chain verification (no API needed)'
  )
  .option('--program-id <id>', 'Custom Solana program ID (advanced)')
  .action(async (fileOrHash: string, options) => {
    const format   = options.format
    const network  = options.network as 'devnet' | 'mainnet'
    const ownerArg = options.owner as string | undefined

    const spinner = createSpinner('Verifying document...')
    if (format === 'human') spinner.start()

    try {
      // ── Resolve hash ────────────────────────────────────────────────────────
      let hash: string
      if (isValidHash(fileOrHash)) {
        hash = fileOrHash.toLowerCase()
      } else {
        const file = readFileAsBuffer(fileOrHash)
        hash = await hashDocument(file)
      }

      // ── Mode A: true on-chain (zero API dependency) ─────────────────────────
      if (ownerArg) {
        let ownerPk: PublicKey
        try {
          ownerPk = new PublicKey(ownerArg)
        } catch {
          spinner.stop()
          console.error(chalk.red(`\n✗ Invalid public key: ${ownerArg}\n`))
          process.exit(3)
        }

        const result = await verifyOnChain({
          hash,
          network,
          ownerPublicKey: ownerPk,
          ...(options.programId && { programId: options.programId }),
        })

        if (format === 'human') spinner.stop()

        // Enrich with block timestamp via public RPC
        let slot = 0
        let blockTime: string | undefined
        if (result.authentic && result.pda) {
          try {
            const rpc = network === 'mainnet'
              ? 'https://api.mainnet-beta.solana.com'
              : 'https://api.devnet.solana.com'
            const conn = new Connection(rpc, 'confirmed')
            // Timestamp comes from on-chain record metadata
            if (result.timestamp) {
              blockTime = new Date(result.timestamp * 1000).toISOString()
            }
          } catch { /* ignore */ }
        }

        if (format === 'json') {
          json.print({ ...result, blockTime, mode: 'direct-onchain' })
          return
        }

        if (!result.authentic) {
          if (format === 'quiet') { quiet.notFound(); return }
          human.notFound()
          return
        }

        if (result.isRevoked) {
          if (format === 'quiet') { quiet.mismatch(); return }
          console.log()
          console.log(chalk.red.bold('✗ REVOKED'))
          console.log()
          console.log(chalk.gray('This anchor has been explicitly revoked.'))
          console.log()
          return
        }

        if (format === 'quiet') { quiet.authentic(); return }

        human.authentic({
          hash,
          id:                   result.pda,
          timestamp:            blockTime || (result.timestamp ? new Date(result.timestamp * 1000).toISOString() : ''),
          blockNumber:          0,
          transactionSignature: result.pda || '',
          network,
        })

        console.log(chalk.gray('Mode:'), chalk.cyan('Direct on-chain (no API used)'))
        console.log(chalk.gray('PDA: '), chalk.cyan(result.pda || ''))
        if (result.metadata) {
          console.log(chalk.gray('Meta:'), chalk.cyan(result.metadata))
        }
        console.log()

        return
      }

      // ── Mode B: public API lookup — no API key required ─────────────────────
      const result = await verifyHash(hash)

      if (format === 'human') spinner.stop()

      if (format === 'json') {
        json.print({ ...result, mode: 'public-api' })
        return
      }

      if (result.status === 'authentic') {
        if (format === 'quiet') { quiet.authentic(); return }

        // Enrich with RPC block data
        let blockNumber = result.anchor?.blockNumber || 0
        let timestamp   = result.anchor?.timestamp   || new Date().toISOString()
        const txSig     = result.anchor?.transactionSignature || ''

        if (txSig && (!blockNumber || !timestamp)) {
          try {
            const rpc  = network === 'mainnet' ? 'https://api.mainnet-beta.solana.com' : 'https://api.devnet.solana.com'
            const conn = new Connection(rpc, 'confirmed')
            const tx   = await conn.getTransaction(txSig, { maxSupportedTransactionVersion: 0 })
            if (tx) {
              blockNumber = tx.slot
              if (tx.blockTime) timestamp = new Date(tx.blockTime * 1000).toISOString()
            }
          } catch { /* ignore */ }
        }

        human.authentic({ hash, id: result.anchor?.id, timestamp, blockNumber, transactionSignature: txSig, network })
        console.log(chalk.gray('Tip: use --owner <publicKey> for zero-API on-chain verification'))
        console.log()

      } else if (result.status === 'revoked') {
        if (format === 'quiet') { quiet.mismatch(); return }
        console.log()
        console.log(chalk.red.bold('✗ REVOKED'))
        console.log(chalk.gray('This anchor has been explicitly revoked.'))
        console.log()

      } else {
        if (format === 'quiet') { quiet.notFound(); return }
        human.notFound()
      }

    } catch (error) {
      if (format === 'human') spinner.stop()
      handleError(error)
    }
  })
