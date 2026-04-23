import { randomBytes, randomInt } from 'node:crypto'

const RANDOM_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function randomAlphanumeric(length: number): string {
  const safeLength = Math.max(0, Math.floor(length))
  if (safeLength === 0) {
    return ''
  }

  const bytes = randomBytes(safeLength)
  let value = ''
  for (let i = 0; i < safeLength; i += 1) {
    value += RANDOM_ALPHABET[bytes[i] % RANDOM_ALPHABET.length]
  }
  return value
}

export function randomIntBelow(maxExclusive: number): number {
  const safeMax = Math.max(1, Math.floor(maxExclusive))
  return randomInt(0, safeMax)
}
