'use client';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Du er offline</h1>
      <p className="text-gray-600 text-center mb-6">
        Det ser ud til at du ikke har forbindelse til internettet. 
        Prøv igen når du er online.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Prøv igen
      </button>
    </div>
  );
}