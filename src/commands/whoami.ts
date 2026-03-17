import { Command } from 'commander'
import { config } from '../config'
import { handleError } from '../utils/errors'
import { human } from '../output/human'
import { json } from '../output/json'
import chalk from 'chalk'
import axios from 'axios'
import { DEFAULTS } from '@sipheron/vdr-core/dist/client/config'

export const whoamiCommand = new Command('whoami')
  .description('Show current account details')
  .option('-f, --format <format>', 'Output format: human, json', 'human')
  .action(async (options) => {
    if (!config.isAuthenticated()) {
      console.log(chalk.yellow(
        '\nNot logged in. Running in playground mode.\n'
      ))
      console.log(chalk.gray('Run: sipheron login'))
      console.log(chalk.gray('Or get a free key at sipheron.com\n'))
      return
    }

    try {
      const network = config.getNetwork() as 'devnet' | 'mainnet'
      const baseUrl = DEFAULTS.baseUrls[network]
      
      const response = await axios.get(`${baseUrl}/api/keys/me`, {
        headers: { 'Authorization': `Bearer ${config.getApiKey()}` }
      })

      const account = response.data

      if (options.format === 'json') {
        json.print(account)
        return
      }

      console.log()
      human.label('Organization', account.organizationName)
      human.label('Email', account.email)
      human.label('Plan', account.plan)
      human.label(
        'Anchors used',
        `${(account.anchorsUsed || 0).toLocaleString()} / ` +
        `${(account.anchorsLimit || 100).toLocaleString()} this month`
      )
      human.label('Network', `Solana ${config.getNetwork()}`)
      console.log()

    } catch (error) {
      handleError(error)
    }
  })
