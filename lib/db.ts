import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let _sql: NeonQueryFunction<false, false> | null = null

export function getDb() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!)
  return _sql
}
