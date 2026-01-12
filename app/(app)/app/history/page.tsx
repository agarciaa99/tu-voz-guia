import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, History, Search, Mic } from "lucide-react"

export default function HistoryPage() {
  // This would normally fetch from a database
  const searches = [
    { id: 1, query: "What's the weather today?", timestamp: "2 hours ago", type: "voice" },
    { id: 2, query: "Find Italian restaurants nearby", timestamp: "Yesterday", type: "voice" },
    { id: 3, query: "Best productivity apps 2024", timestamp: "3 days ago", type: "text" },
    { id: 4, query: "How to make pasta carbonara", timestamp: "1 week ago", type: "voice" },
  ]

  return (
    <div className="min-h-[calc(100vh-5rem)] px-6 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" className="rounded-xl" asChild>
            <Link href="/app">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Search History</h1>
            <p className="text-muted-foreground">Your recent voice and text searches</p>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {searches.map((search) => (
            <div
              key={search.id}
              className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  search.type === "voice" ? "bg-accent/20" : "bg-secondary"
                }`}
              >
                {search.type === "voice" ? (
                  <Mic className="w-5 h-5 text-accent" />
                ) : (
                  <Search className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-foreground">{search.query}</p>
                <p className="text-xs text-muted-foreground">{search.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {searches.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No search history yet</h3>
            <p className="text-muted-foreground mb-6">Your voice and text searches will appear here</p>
            <Button asChild>
              <Link href="/app">Start searching</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
