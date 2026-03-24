'use client'
import { useState } from 'react'
import Link from 'next/link'

type Mode = 'symbol' | 'object'

export default function CircuitsPage() {
  const [mode, setMode] = useState<Mode>('symbol')

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center gap-4 px-4 py-2 border-b shrink-0">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-700">← Back</Link>
        <span className="text-sm font-medium text-gray-700">Circuit Diagrams</span>
        <div className="ml-auto flex rounded-lg overflow-hidden border border-gray-200">
          {(['symbol', 'object'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                mode === m ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {m === 'symbol' ? 'Symbol' : 'Object'}
            </button>
          ))}
        </div>
      </header>
      <div className="relative flex-1">
        {/* Both iframes stay mounted — CSS hide preserves canvas state */}
        <iframe
          src="/tools/circuit_diagram_creator.html"
          className="absolute inset-0 w-full h-full border-0"
          style={{ display: mode === 'symbol' ? 'block' : 'none' }}
        />
        <iframe
          src="/tools/object_circuit.html"
          className="absolute inset-0 w-full h-full border-0"
          style={{ display: mode === 'object' ? 'block' : 'none' }}
        />
      </div>
    </div>
  )
}
