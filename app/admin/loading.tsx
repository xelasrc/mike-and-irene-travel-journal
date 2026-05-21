export default function AdminLoading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-48 bg-warm-border rounded-xl" />
          <div className="h-3 w-24 bg-warm-border rounded-full" />
        </div>
        <div className="h-10 w-28 bg-warm-border rounded-full animate-pulse" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-start gap-4 bg-white border border-warm-border rounded-xl p-4 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-warm-border mt-2 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/2 bg-warm-border rounded-full" />
              <div className="h-3 w-1/3 bg-warm-border rounded-full" />
            </div>
            <div className="flex gap-1">
              <div className="w-7 h-7 bg-warm-border rounded-lg" />
              <div className="w-7 h-7 bg-warm-border rounded-lg" />
              <div className="w-7 h-7 bg-warm-border rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
