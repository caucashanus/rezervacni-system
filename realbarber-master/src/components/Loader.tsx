export default function Loader() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-zinc-900 rounded-lg shadow-lg p-4 border border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="animate-spin">
            <svg
              className="w-5 h-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <span className="text-sm text-zinc-400">Loading...</span>
        </div>
      </div>
    </div>
  );
} 