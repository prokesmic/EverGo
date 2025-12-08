export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page Works!</h1>
        <p className="text-gray-600">If you see this, Next.js is working.</p>
        <p className="text-sm text-gray-400 mt-4">
          Time: {new Date().toISOString()}
        </p>
      </div>
    </div>
  )
}
