export const dynamic = 'force-dynamic'

import { getDb } from '@/lib/db'

async function getMetrics() {
  const sql = getDb()
  const [totals, allTime, monthly] = await Promise.all([
    sql`
      SELECT
        COUNT(DISTINCT user_uuid)::int AS unique_users,
        COUNT(*)::int                  AS total_exports,
        COUNT(DISTINCT CASE WHEN created_at >= date_trunc('month', NOW()) THEN user_uuid END)::int AS mau,
        COUNT(CASE WHEN created_at >= date_trunc('month', NOW()) THEN 1 END)::int AS monthly_exports
      FROM events
    `,
    sql`
      SELECT tool, COUNT(*)::int AS exports, COUNT(DISTINCT user_uuid)::int AS unique_users
      FROM events GROUP BY tool
    `,
    sql`
      SELECT tool, COUNT(*)::int AS exports, COUNT(DISTINCT user_uuid)::int AS mau
      FROM events WHERE created_at >= date_trunc('month', NOW()) GROUP BY tool
    `,
  ])

  return {
    totals: totals[0] ?? { unique_users: 0, total_exports: 0, mau: 0, monthly_exports: 0 },
    allTime: allTime as { tool: string; exports: number; unique_users: number }[],
    monthly: monthly as { tool: string; exports: number; mau: number }[],
  }
}

const TOOLS = ['circuit-symbol', 'circuit-object', 'isometric-cube']
const LABELS: Record<string, string> = {
  'circuit-symbol': 'Circuit — Symbol',
  'circuit-object': 'Circuit — Object',
  'isometric-cube': 'Isometric Cube',
}

export default async function MetricsPage() {
  const { totals, allTime, monthly } = await getMetrics()
  const allTimeMap = Object.fromEntries(allTime.map(r => [r.tool, r]))
  const monthlyMap = Object.fromEntries(monthly.map(r => [r.tool, r]))

  const aggregate = [
    { label: 'Unique exporters (all-time)', value: totals.unique_users },
    { label: 'Total exports (all-time)',    value: totals.total_exports },
    { label: 'MAU (this month)',            value: totals.mau },
    { label: 'Exports (this month)',        value: totals.monthly_exports },
  ]

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Metrics</h1>
        <p className="text-sm text-gray-400 mb-10">
          Counts PNG exports only. MAU = unique users who exported at least once in the current calendar month.
        </p>

        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Aggregate</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {aggregate.map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-2xl font-bold text-gray-900">{s.value ?? 0}</div>
                <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Per tool</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 font-medium">
                  <th className="text-left px-5 py-3">Tool</th>
                  <th className="text-right px-5 py-3">All-time exports</th>
                  <th className="text-right px-5 py-3">All-time unique</th>
                  <th className="text-right px-5 py-3">This month exports</th>
                  <th className="text-right px-5 py-3">MAU</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((tool, i) => (
                  <tr key={tool} className={i < TOOLS.length - 1 ? 'border-b border-gray-50' : ''}>
                    <td className="px-5 py-3 font-medium text-gray-700">{LABELS[tool]}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{allTimeMap[tool]?.exports ?? 0}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{allTimeMap[tool]?.unique_users ?? 0}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{monthlyMap[tool]?.exports ?? 0}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{monthlyMap[tool]?.mau ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
