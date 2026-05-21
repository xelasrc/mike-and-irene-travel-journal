export default function PostLoading() {
  return (
    <main className="max-w-2xl mx-auto px-4 pb-20">
      <div className="py-5">
        <div className="h-4 w-20 bg-warm-border rounded-full animate-pulse" />
      </div>

      <div className="animate-pulse space-y-4">
        {/* Meta */}
        <div className="flex gap-3">
          <div className="h-3 w-24 bg-warm-border rounded-full" />
          <div className="h-3 w-20 bg-warm-border rounded-full" />
        </div>

        {/* Title */}
        <div className="space-y-2 mb-8">
          <div className="h-9 w-full bg-warm-border rounded-xl" />
          <div className="h-9 w-2/3 bg-warm-border rounded-xl" />
        </div>

        {/* Content paragraphs */}
        <div className="space-y-2">
          {[100, 90, 95, 85, 100, 70].map((w, i) => (
            <div key={i} className={`h-4 bg-warm-border rounded-full`} style={{ width: `${w}%` }} />
          ))}
        </div>

        {/* Photo placeholder */}
        <div className="h-72 bg-warm-bg-2 rounded-xl mt-8" />
      </div>
    </main>
  )
}
