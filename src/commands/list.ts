import { Command } from 'commander'
import { SipHeron } from '@sipheron/vdr-core'
import { config } from '../config'
import { handleError } from '../utils/errors'
import { json } from '../output/json'
import { createSpinner } from '../utils/spinner'
import chalk from 'chalk'
import Table from 'cli-table3'

export const listCommand = new Command('list')
  .description('List your anchored documents')
  .option('-l, --limit <number>', 'Number of results', '10')
  .option('-s, --status <status>', 'Filter by status: confirmed, pending, failed')
  .option('--from <date>', 'Filter from date (YYYY-MM-DD)')
  .option('-f, --format <format>', 'Output format: human, json', 'human')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.yellow(
        '\nLogin required for list command.\n'
      ))
      console.log(chalk.gray('Run: sipheron login'))
      return
    }

    const spinner = createSpinner('Fetching anchors...')

    try {
      const client = new SipHeron({
        apiKey: config.getApiKey(),
        network: config.getNetwork() as 'devnet' | 'mainnet'
      })

      spinner.start()

      // vdr-core exposes top level .list()
      const result = await client.list({
        limit: parseInt(options.limit),
        status: options.status
      })

      spinner.stop()

      if (options.format === 'json') {
        json.print(result)
        return
      }

      const records = result.records || []

      if (records.length === 0) {
        console.log(chalk.gray('\nNo anchors found.\n'))
        console.log(chalk.gray('Run: sipheron anchor <file>'))
        return
      }

      const table = new Table({
        head: [
          chalk.gray('ID'),
          chalk.gray('Name'),
          chalk.gray('Status'),
          chalk.gray('Date')
        ],
        style: { head: [], border: [] }
      })

      records.forEach((anchor: any) => {
        table.push([
          anchor.id,
          anchor.name || chalk.gray('unnamed'),
          anchor.status === 'confirmed'
            ? chalk.green('Confirmed')
            : chalk.yellow(anchor.status),
          new Date(anchor.timestamp).toLocaleDateString()
        ])
      })

      console.log()
      console.log(table.toString())
      console.log(
        chalk.gray(
          `\nShowing ${records.length} anchors. ` +
          `sipheron list --limit 50 for more.\n`
        )
      )

    } catch (error) {
      spinner.stop()
      handleError(error)
    }
  })
