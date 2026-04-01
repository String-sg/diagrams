import { render, screen } from '@testing-library/react'
import MetricsPage from '@/app/metrics/page'

jest.mock('@/lib/db', () => ({ getDb: jest.fn() }))
import { getDb } from '@/lib/db'

describe('Metrics page', () => {
  const mockSql = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockSql.mockReset()
    ;(getDb as jest.Mock).mockReturnValue(mockSql)
  })

  it('renders rows for all tools with their metrics', async () => {
    mockSql
      .mockResolvedValueOnce([{ unique_users: 10, total_exports: 25, mau: 4, monthly_exports: 9 }])
      .mockResolvedValueOnce([
        { tool: 'circuit-symbol', exports: 5, unique_users: 3 },
        { tool: 'circuit-object', exports: 4, unique_users: 3 },
        { tool: 'circuit-secjc', exports: 6, unique_users: 5 },
        { tool: 'water-tank', exports: 7, unique_users: 6 },
        { tool: 'isometric-cube', exports: 3, unique_users: 2 },
      ])
      .mockResolvedValueOnce([
        { tool: 'circuit-secjc', exports: 2, mau: 2 },
        { tool: 'water-tank', exports: 1, mau: 1 },
      ])

    render(await MetricsPage())

    const secJcRow = screen.getByText('Circuit — Sec/JC').closest('tr')
    expect(secJcRow).toHaveTextContent('6')
    expect(secJcRow).toHaveTextContent('5')
    expect(secJcRow).toHaveTextContent('2')

    const waterTankRow = screen.getByText('Water Tank').closest('tr')
    expect(waterTankRow).toHaveTextContent('7')
    expect(waterTankRow).toHaveTextContent('6')
    expect(waterTankRow).toHaveTextContent('1')

    expect(screen.getByText('Circuit — Symbol')).toBeInTheDocument()
    expect(screen.getByText('Circuit — Object')).toBeInTheDocument()
    expect(screen.getByText('Isometric Cube')).toBeInTheDocument()
  })
})
