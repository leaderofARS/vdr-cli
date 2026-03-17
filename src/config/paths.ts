import { homedir } from 'os'
import { join } from 'path'

export const CONFIG_DIR = join(homedir(), '.config', 'sipheron')
export const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
export const SOLANA_KEY_PATH = join(
  homedir(),
  '.config',
  'solana',
  'id.json'
)
