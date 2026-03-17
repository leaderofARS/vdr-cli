import chalk from 'chalk'

export function handleError(error: unknown): never {
  if (error instanceof Error) {
    console.error(chalk.red(`\n✗ Error: ${error.message}\n`))
  } else {
    console.error(chalk.red('\n✗ An unexpected error occurred\n'))
  }
  process.exit(3)
}
