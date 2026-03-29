/**
 * @jest-environment node
 */
import { POST } from '@/app/api/event/route'
import { NextRequest } from 'next/server'

// Mock the DB module so tests never touch NeonDB
jest.mock('@/lib/db', () => ({ getDb: jest.fn() }))
import { getDb } from '@/lib/db'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/event', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/event', () => {
  const mockSql = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getDb as jest.Mock).mockReturnValue(mockSql)
  })

  // --- Input validation ---

  it('returns 400 when uuid is missing', async () => {
    const res = await POST(makeRequest({ tool: 'circuit-symbol' }))
    expect(res.status).toBe(400)
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('returns 400 when tool is missing', async () => {
    const res = await POST(makeRequest({ uuid: 'abc' }))
    expect(res.status).toBe(400)
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('returns 400 for an unrecognised tool name', async () => {
    const res = await POST(makeRequest({ uuid: 'abc', tool: 'unknown-tool' }))
    expect(res.status).toBe(400)
    expect(mockSql).not.toHaveBeenCalled()
  })

  it('returns 400 for malformed JSON body', async () => {
    const req = new NextRequest('http://localhost/api/event', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  // --- Rate limiting ---

  it('returns 200 and skips inserts when rate limited', async () => {
    mockSql.mockResolvedValueOnce([{ 1: 1 }]) // recent event found → rate limited

    const res = await POST(makeRequest({ uuid: 'user-1', tool: 'circuit-symbol' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(mockSql).toHaveBeenCalledTimes(1) // only the rate-limit check, no inserts
  })

  // --- Happy path ---

  it('returns 200 and runs 3 queries for a new event', async () => {
    mockSql
      .mockResolvedValueOnce([])  // rate-limit check: no recent events
      .mockResolvedValueOnce([])  // upsert user
      .mockResolvedValueOnce([])  // insert event

    const res = await POST(makeRequest({ uuid: 'user-1', tool: 'circuit-symbol' }))
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json).toEqual({ ok: true })
    expect(mockSql).toHaveBeenCalledTimes(3)
  })

  it('accepts all valid tool names', async () => {
    const tools = ['circuit-symbol', 'circuit-object', 'circuit-secjc', 'water-tank', 'isometric-cube']
    for (const tool of tools) {
      mockSql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
      const res = await POST(makeRequest({ uuid: 'user-1', tool }))
      expect(res.status).toBe(200)
    }
  })
})
