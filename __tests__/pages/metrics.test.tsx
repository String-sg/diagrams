/**
 * @jest-environment jsdom
 *
 * Tests for the MetricsPage async server component.
 * DB is fully mocked — no live NeonDB connection required.
 *
 * Pattern: call `await MetricsPage()` to resolve the JSX,
 * then `render()` it with RTL as a normal React tree.
 */
import { render, screen } from '@testing-library/react'
import MetricsPage from '@/app/metrics/page'

jest.mock('@/lib/db', () => ({ getDb: jest.fn() }))
import { getDb } from '@/lib/db'

const TOOL_LABELS = ['Circuit — Symbol', 'Circuit — Object', 'Isometric Cube']

describe('MetricsPage', () => {
  const mockSql = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getDb as jest.Mock).mockReturnValue(mockSql)
  })

  // ── Aggregate stats ──────────────────────────────────────────────────────

  it('renders aggregate stat values from DB', async () => {
    mockSql
      .mockResolvedValueOnce([{ unique_users: 42, total_exports: 300, mau: 15, monthly_exports: 50 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    render(await MetricsPage())

    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
  })

  it('renders all four aggregate stat labels', async () => {
    mockSql
      .mockResolvedValueOnce([{ unique_users: 1, total_exports: 1, mau: 1, monthly_exports: 1 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    render(await MetricsPage())

    expect(screen.getByText('Unique exporters (all-time)')).toBeInTheDocument()
    expect(screen.getByText('Total exports (all-time)')).toBeInTheDocument()
    expect(screen.getByText('MAU (this month)')).toBeInTheDocument()
    expect(screen.getByText('Exports (this month)')).toBeInTheDocument()
  })

  it('defaults aggregate to 0 when totals row is absent', async () => {
    mockSql
      .mockResolvedValueOnce([]) // empty → default object with zeros
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    render(await MetricsPage())

    // All four aggregate cards show 0
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(4)
  })

  // ── Per-tool table ────────────────────────────────────────────────────────

  it('renders a table row for each registered tool', async () => {
    mockSql
      .mockResolvedValueOnce([{ unique_users: 0, total_exports: 0, mau: 0, monthly_exports: 0 }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])

    render(await MetricsPage())

    for (const label of TOOL_LABELS) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('shows per-tool export counts from allTime data', async () => {
    mockSql
      .mockResolvedValueOnce([{ unique_users: 10, total_exports: 100, mau: 5, monthly_exports: 20 }])
      .mockResolvedValueOnce([
        { tool: 'circuit-symbol', exports: 60, unique_users: 7 },
        { tool: 'circuit-object', exports: 25, unique_users: 4 },
        { tool: 'isometric-cube', exports: 15, unique_users: 3 },
      ])
      .mockResolvedValueOnce([])

    render(await MetricsPage())

    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('shows monthly MAU from monthly data', async () => {
    mockSql
      .mockResolvedValueOnce([{ unique_users: 5, total_exports: 50, mau: 3, monthly_exports: 10 }])
      .mockResolvedValueOnce([{ tool: 'circuit-symbol', exports: 30, unique_users: 5 }])
      .mockResolvedValueOnce([
        { tool: 'circuit-symbol', exports: 8, mau: 3 },
        { tool: 'circuit-object', exports: 2, mau: 1 },
      ])

    render(await MetricsPage())

    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('defaults tool cells to 0 when tool has no data in DB result', async () => {
    mockSql
      .mockResolvedValueOnce([{ unique_users: 5, total_exports: 5, mau: 1, monthly_exports: 1 }])
      .mockResolvedValueOnce([]) // no per-tool data
      .mockResolvedValueOnce([])

    render(await MetricsPage())

    // 3 tools × 4 columns = 12 cells should all be 0
    const zeros = screen.getAllByText('0')
    expect(zeros.length).toBeGreaterThanOrEqual(3 * 4)
  })

  // ── Error state ───────────────────────────────────────────────────────────

  it('shows error message when DB throws', async () => {
    mockSql.mockRejectedValue(new Error('connection refused'))

    render(await MetricsPage())

    expect(screen.getByText(/could not load metrics/i)).toBeInTheDocument()
    expect(screen.getByText(/DATABASE_URL/)).toBeInTheDocument()
  })

  it('still renders the page heading in the error state', async () => {
    mockSql.mockRejectedValue(new Error('timeout'))

    render(await MetricsPage())

    expect(screen.getByRole('heading', { name: /metrics/i })).toBeInTheDocument()
  })
})
