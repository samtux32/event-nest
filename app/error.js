'use client'

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo.png" alt="Event Nest" className="w-16 h-16 rounded-xl object-cover" />
          <div className="font-bold text-2xl leading-tight">Event<br/>Nest</div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-8">An unexpected error occurred. Please try again.</p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
