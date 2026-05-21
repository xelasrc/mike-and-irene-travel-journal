export default function HomeLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 pb-16">
      <div className="py-10 sm:py-16 text-center">
        <div className="h-4 w-32 bg-warm-border rounded-full mx-auto mb-4 animate-pulse" />
        <div className="h-10 w-64 bg-warm-border rounded-xl mx-auto mb-3 animate-pulse" />
        <div className="h-4 w-48 bg-warm-border rounded-full mx-auto animate-pulse" />
      </div>

      <div className="space-y-4 sm:space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-warm-border overflow-hidden animate-pulse">
            <div className="h-56 bg-warm-bg-2" />
            <div className="p-4 sm:p-6 space-y-3">
              <div className="h-3 w-32 bg-warm-border rounded-full" />
              <div className="h-6 w-3/4 bg-warm-border rounded-lg" />
              <div className="h-3 w-full bg-warm-border rounded-full" />
              <div className="h-3 w-2/3 bg-warm-border rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
