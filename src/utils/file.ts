import { readFileSync, existsSync, statSync } from 'fs'
import { resolve } from 'path'

export function readFileAsBuffer(filePath: string): Buffer {
  const resolved = resolve(filePath)

  if (!existsSync(resolved)) {
    throw new Error(`File not found: ${filePath}`)
  }

  const stats = statSync(resolved)
  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${filePath}`)
  }

  return readFileSync(resolved)
}

export function isValidHash(input: string): boolean {
  return /^[a-f0-9]{64}$/i.test(input)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
