export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-whatsapp rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">📡</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Don't worry, you can still browse your saved content.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-whatsapp text-white px-4 py-2 rounded-md hover:bg-whatsapp-dark"
          >
            Try Again
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}