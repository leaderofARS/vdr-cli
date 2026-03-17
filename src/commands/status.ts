import { Command } from 'commander'
import { SipHeron } from '@sipheron/vdr-core'
import { isValidHash } from '../utils/file'
import { createSpinner } from '../utils/spinner'
import { handleError } from '../utils/errors'
import { human } from '../output/human'
import { json } from '../output/json'
import { config } from '../config'
import chalk from 'chalk'

export const statusCommand = new Command('status')
  .description('Check the blockchain confirmation status of an anchor')
  .argument('<hash-or-id>', 'Document hash or anchor ID')
  .option('-f, --format <format>', 'Output format: human, json', 'human')
  .option('--network <network>', 'Network: devnet, mainnet', 'devnet')
  .action(async (hashOrId: string, options) => {
    const spinner = createSpinner('Checking status...')

    try {
      const client = new SipHeron({
        apiKey: config.getApiKey(),
        network: options.network
      })

      if (options.format === 'human') spinner.start()

      const status = await client.getStatus(hashOrId)

      spinner.stop()

      if (options.format === 'json') {
        json.print(status)
        return
      }

      console.log()
      human.label('Hash', hashOrId)
      human.label(
        'Status',
        status.status === 'confirmed'
          ? chalk.green('Confirmed ✓')
          : chalk.yellow('Pending...')
      )
      human.label('Block', status.blockNumber.toLocaleString())
      human.label('Timestamp', status.timestamp)
      console.log()

    } catch (error) {
      spinner.stop()
      handleError(error)
    }
  })
