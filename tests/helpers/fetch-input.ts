export function fetchUrl(input: string | URL | Request): URL {
  return input instanceof Request ? new URL(input.url) : new URL(input)
}
