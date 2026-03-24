import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Next.js Link needs a router — next/jest sets this up automatically

describe('Index page', () => {
  it('renders the page heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /diagram tools/i })).toBeInTheDocument()
  })

  it('shows a card for Circuit Diagrams', () => {
    render(<Home />)
    expect(screen.getByText('Circuit Diagrams')).toBeInTheDocument()
  })

  it('shows a card for Isometric Cube Builder', () => {
    render(<Home />)
    expect(screen.getByText('Isometric Cube Builder')).toBeInTheDocument()
  })

  it('links circuit card to /tools/circuits', () => {
    render(<Home />)
    const link = screen.getByRole('link', { name: /circuit diagrams/i })
    expect(link).toHaveAttribute('href', '/tools/circuits')
  })

  it('links cube card to /tools/isometric-cube', () => {
    render(<Home />)
    const link = screen.getByRole('link', { name: /isometric cube builder/i })
    expect(link).toHaveAttribute('href', '/tools/isometric-cube')
  })

  it('shows the footer with creator credit', () => {
    render(<Home />)
    expect(screen.getByText(/created by julienne/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /string\.sg/i })).toHaveAttribute('href', 'https://string.sg')
  })
})
