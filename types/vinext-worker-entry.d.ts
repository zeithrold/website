// vinext's fetch-handler declaration re-exports the generated Vite module.
// Describe its runtime fetch contract so the compiler can check the Worker call.
declare module 'virtual:vinext-worker-entry' {
  const handler: {
    fetch: (request: Request, env: Env, context: ExecutionContext) => Promise<Response>
  }
  export default handler
}
