import { Command } from 'commander'
import { config } from '../config'
import chalk from 'chalk'

export const logoutCommand = new Command('logout')
  .description('Remove stored API key')
  .action(() => {
    config.clearApiKey()
    console.log(chalk.green('\n✓ Logged out successfully\n'))
  })
