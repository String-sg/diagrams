import Link from 'next/link'

export default function IsometricCubePage() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex items-center gap-4 px-4 py-2 border-b shrink-0">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-700">← Back</Link>
        <span className="text-sm font-medium text-gray-700">Isometric Cube Builder</span>
      </header>
      <iframe
        src="/tools/isometric-cube-generator.html"
        className="flex-1 border-0 w-full"
      />
    </div>
  )
}
