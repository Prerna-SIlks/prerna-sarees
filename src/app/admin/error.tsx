'use client'
export default function AdminError({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong in admin panel</h2>
      <p className="text-red-500 mb-6">{error.message}</p>
      <button onClick={reset} className="px-4 py-2 bg-[#1a1a2e] text-white rounded-lg hover:bg-[#1a1a2e]/90">
        Try again
      </button>
    </div>
  )
}
