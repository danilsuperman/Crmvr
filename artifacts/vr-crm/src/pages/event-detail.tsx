import { useParams, Link } from "wouter";
import { 
  useGetEvent, 
  getGetEventQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function EventDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  
  const { data: event, isLoading } = useGetEvent(id, { 
    query: { enabled: !!id, queryKey: getGetEventQueryKey(id) } 
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full z-10">
        <header className="h-16 border-b border-border flex items-center px-6 gap-4 bg-card/50 backdrop-blur-sm">
          <Link href="/events">
            <Button variant="ghost" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-xl font-bold font-mono">Loading Event...</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-16 border-b border-border flex items-center px-6 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/events">
            <Button variant="ghost" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-xl font-bold font-mono">{event?.title || "Event Details"}</h1>
        </div>
      </header>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border border-border bg-card/30 p-6 rounded-lg">
            <p className="text-muted-foreground font-mono text-center">EVENT STAGES COMING SOON</p>
          </div>
        </div>
      </div>
    </div>
  );
}
