/**
 * @jest-environment node
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

describe('release guardrails', () => {
  it('serves the required browser security headers on every route', async () => {
    const { default: config } = await import('../next.config.mjs')
    const rules = await config.headers()
    const headers = Object.fromEntries(rules[0].headers.map(({ key, value }) => [key, value]))

    expect(rules[0].source).toBe('/:path*')
    expect(headers).toMatchObject({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    })
    expect(headers['Content-Security-Policy']).toContain("default-src 'self'")
    expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'self'")
    expect(headers['Content-Security-Policy']).toContain("object-src 'none'")
  })

  it('disables unchecked Vercel Git deployments from main', () => {
    const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'))
    expect(vercel.git.deploymentEnabled.main).toBe(false)
  })

  it('audits production and development dependencies', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))

    expect(packageJson.scripts['security:audit']).toBe('npm audit --audit-level=high')
  })

  it('uses change triggers rather than a scheduled deployment', () => {
    const workflow = fs.readFileSync(
      path.join(ROOT, '.github/workflows/julienne-deploy.yml'),
      'utf8'
    )

    expect(workflow).toMatch(/^  push:/m)
    expect(workflow).toMatch(/^  pull_request:/m)
    expect(workflow).not.toMatch(/^  schedule:/m)
    expect(workflow).toContain("'seed dispersal diagram v*.html'")
    expect(workflow).toContain('npm run sync:check')
    expect(workflow).toContain('npm run test:ci')
    expect(workflow).toContain('npm run security:audit')
    expect(workflow).toContain('semgrep scan')
    expect(workflow).toContain('github/codeql-action/analyze@v4')
    expect(workflow).toContain('vercel deploy --prebuilt --prod')
    expect(workflow).toContain('Smoke-test the deployed production artifact')
    expect(workflow).toContain('vercel curl "$base_url/" --yes')
    expect(workflow).toContain('Created by Julienne, supported by')
    expect(workflow).toContain('href="https://string.sg"')
    expect(workflow).toContain("'${escapeHtml(peerPlantLabel(i, plant))}'")
    expect(workflow).toContain("'^content-security-policy:'")
    expect(workflow).toContain("if: github.event_name != 'pull_request'")
    expect(workflow).not.toContain('--token="$VERCEL_TOKEN"')
  })
})
