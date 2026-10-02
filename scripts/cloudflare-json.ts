import assert from 'node:assert/strict'
import { isRecord } from '../lib/value-guards.ts'

export function requireRecord(value: unknown, message: string): Record<string, unknown> {
  assert.ok(isRecord(value), message)
  return value
}

export function requireArray(value: unknown, message: string): unknown[] {
  assert.ok(Array.isArray(value), message)
  return value
}

export function requireString(value: unknown, message: string): string {
  assert.ok(typeof value === 'string', message)
  return value
}

export function optionalRecord(value: unknown, message: string): Record<string, unknown> {
  return value === undefined || value === null ? {} : requireRecord(value, message)
}

export function optionalArray(value: unknown, message: string): unknown[] {
  return value === undefined || value === null ? [] : requireArray(value, message)
}

export function cloudflareResult(value: unknown, message: string, paginationMessage: string): unknown {
  const body = requireRecord(value, message)
  assert.equal(body.success, true, message)
  const info = optionalRecord(body.result_info, message)
  const pages = info.total_pages ?? 1
  assert.ok(typeof pages === 'number' && pages <= 1, paginationMessage)
  assert.ok(body.result !== undefined, message)
  return body.result
}
