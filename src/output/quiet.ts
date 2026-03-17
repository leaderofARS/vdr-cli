// Exit codes
// 0 = success / authentic
// 1 = mismatch
// 2 = not found
// 3 = error

export const quiet = {
  authentic: () => {
    console.log('AUTHENTIC')
    process.exit(0)
  },
  mismatch: () => {
    console.log('MISMATCH')
    process.exit(1)
  },
  notFound: () => {
    console.log('NOT_FOUND')
    process.exit(2)
  },
  anchored: (verificationUrl: string) => {
    console.log(verificationUrl)
    process.exit(0)
  }
}
