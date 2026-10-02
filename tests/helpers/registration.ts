import process from 'node:process'

/** Surface registration failures in addition to the test runner's own failures. */
export function handleRegistrationFailure(error: unknown): void {
  console.error(error)
  process.exitCode = 1
}
