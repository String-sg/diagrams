'use client'
import Link from 'next/link'

export default function CircuitsSecJCPage() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center gap-4 px-4 py-2 border-b shrink-0">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-700">← Back</Link>
        <span className="text-sm font-medium text-gray-700">Circuit Diagrams (Sec/JC)</span>
      </header>
      <div className="relative flex-1">
        <iframe
          src="/tools/circuit_diagram_secjc.html"
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  )
}
