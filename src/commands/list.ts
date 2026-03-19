import { Command } from 'commander'
import { hashFile } from '@sipheron/vdr-core'
import { existsSync, readdirSync, statSync } from 'fs'
import { resolve, join } from 'path'
import chalk from 'chalk'
import { isValidHash } from '../utils/file'
import { handleError } from '../utils/errors'
import { json } from '../output/json'
import { human } from '../output/human'
import { createSpinner } from '../utils/spinner'
import { PublicKey, Connection } from '@solana/web3.js'
import { verifyOnChain, deriveAnchorAddress } from '@sipheron/vdr-core'

export const listCommand = new Command('list')
  .description('Batch-verify a local folder of files against the Solana blockchain')
  .argument('<directory>', 'Path to the directory containing files to check')
  .option('--owner <publicKey>', 'Solana public key of the document owner (required)')
  .option('--network <network>', 'Network: devnet, mainnet', 'devnet')
  .option('-f, --format <format>', 'Output format: human, json', 'human')
  .option('--program-id <id>', 'Custom Solana program ID (advanced)')
  .action(async (directory: string, options) => {
    const network = options.network as 'devnet' | 'mainnet'
    const resolvedDir = resolve(directory)

    if (!existsSync(resolvedDir) || !statSync(resolvedDir).isDirectory()) {
      console.error(chalk.red(`\n✗ Directory not found: ${directory}\n`))
      process.exit(3)
    }

    if (!options.owner) {
      console.log(chalk.yellow('\n⚠  --owner <publicKey> is required to look up on-chain records.\n'))
      console.log(chalk.gray('This is the Solana public key that was used when anchoring.'))
      console.log(chalk.gray('Example:'))
      console.log(chalk.cyan(`  sipheron list ./my-documents --owner <YourWalletPublicKey>\n`))
      process.exit(1)
    }

    let ownerPk: PublicKey
    try {
      ownerPk = new PublicKey(options.owner)
    } catch {
      console.error(chalk.red(`\n✗ Invalid public key: ${options.owner}\n`))
      process.exit(3)
    }

    // Collect files (non-recursive, top-level only)
    const entries = readdirSync(resolvedDir)
      .map(name => join(resolvedDir, name))
      .filter(p => statSync(p).isFile())

    if (entries.length === 0) {
      console.log(chalk.gray(`\nNo files found in ${directory}\n`))
      return
    }

    console.log()
    console.log(chalk.bold(`Checking ${entries.length} file(s) against Solana ${network}...`))
    console.log(chalk.gray(`Owner: ${options.owner}`))
    console.log()

    const spinner = createSpinner('Reading chain...')
    if (options.format === 'human') spinner.start()

    const results: Array<{
      file: string
      hash: string
      pda: string
      status: 'confirmed' | 'not_found' | 'revoked' | 'error'
      metadata?: string
      timestamp?: string
    }> = []

    for (const filePath of entries) {
      const fileName = filePath.split('/').pop() || filePath
      try {
        const hash = await hashFile(filePath)
        const programArg: 'devnet' | 'mainnet' | PublicKey = options.programId
          ? new PublicKey(options.programId)
          : network
        const pda  = deriveAnchorAddress(hash, ownerPk, programArg as any)
        const record = await verifyOnChain({
          hash,
          network,
          ownerPublicKey: ownerPk,
          ...(options.programId && { programId: options.programId }),
        })

        let blockTime: string | undefined
        if (record.timestamp) {
          blockTime = new Date(record.timestamp * 1000).toISOString()
        }

        results.push({
          file:      fileName,
          hash,
          pda:       pda.toBase58(),
          status:    record.isRevoked ? 'revoked' : record.authentic ? 'confirmed' : 'not_found',
          metadata:  record.metadata,
          timestamp: blockTime,
        })
      } catch (err) {
        results.push({
          file:   fileName,
          hash:   '',
          pda:    '',
          status: 'error',
        })
      }
    }

    if (options.format === 'human') spinner.stop()

    if (options.format === 'json') {
      json.print(results)
      return
    }

    // Human table output
    const maxFile = Math.max(...results.map(r => r.file.length), 4)

    results.forEach(r => {
      const statusLabel =
        r.status === 'confirmed' ? chalk.green('✓ confirmed') :
        r.status === 'revoked'   ? chalk.red('✗ revoked')   :
        r.status === 'error'     ? chalk.red('✗ error')     :
                                   chalk.yellow('⚠ not found')

      const fileLabel = r.file.padEnd(maxFile)
      const hashLabel = r.hash ? r.hash.slice(0, 12) + '...' : '—'
      const timeLabel = r.timestamp ? r.timestamp.slice(0, 10) : ''

      console.log(
        `${chalk.gray(fileLabel)}  ${statusLabel.padEnd(20)}  ${chalk.gray(hashLabel)}  ${chalk.gray(timeLabel)}`
      )
    })

    const confirmed  = results.filter(r => r.status === 'confirmed').length
    const notFound   = results.filter(r => r.status === 'not_found').length
    const revoked    = results.filter(r => r.status === 'revoked').length
    const errors     = results.filter(r => r.status === 'error').length

    console.log()
    console.log(
      chalk.gray(
        `${confirmed} confirmed  |  ${notFound} not found  |  ${revoked} revoked  |  ${errors} errors`
      )
    )
    console.log(chalk.gray('Mode: direct on-chain read — no API used'))
    console.log()
  })
