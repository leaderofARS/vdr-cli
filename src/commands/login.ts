import { Command } from 'commander'
import { createInterface } from 'readline'
import { config } from '../config'
import chalk from 'chalk'
import axios from 'axios'
import { DEFAULTS } from '@sipheron/vdr-core/dist/client/config'

export const loginCommand = new Command('login')
  .description('Authenticate with your SipHeron API key')
  .action(async () => {
    console.log()
    console.log(
      chalk.gray('Get a free API key at sipheron.com')
    )
    console.log(
      chalk.gray('100 free anchors/month. No credit card required.')
    )
    console.log()

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })

    rl.question('Enter your API key: ', async (apiKey) => {
      rl.close()

      if (!apiKey || apiKey.trim().length === 0) {
        console.log(chalk.red('No API key provided.'))
        process.exit(1)
      }

      try {
        const network = config.getNetwork() as 'devnet' | 'mainnet'
        const baseUrl = DEFAULTS.baseUrls[network]
        
        // Validate the key by making a test request directly
        const response = await axios.get(`${baseUrl}/api/keys/me`, {
          headers: { 'Authorization': `Bearer ${apiKey.trim()}` }
        })

        const account = response.data
        config.setApiKey(apiKey.trim())

        console.log()
        console.log(
          chalk.green(
            `✓ Authenticated as ${account.organizationName || 'User'}`
          )
        )
        console.log(chalk.gray('API key stored securely.'))
        console.log()

      } catch {
        console.log(chalk.red('\n✗ Invalid API key. Please try again.\n'))
        process.exit(1)
      }
    })
  })
