import { useListEvents } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { format } from "date-fns";

export default function Events() {
  const { data: events = [], isLoading } = useListEvents();

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-16 border-b border-border flex items-center px-6 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-xl font-bold font-mono">Events</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Plan Event
        </Button>
      </header>
      
      <div className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground animate-pulse font-mono">LOADING EVENTS...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="h-40 border border-border rounded-lg bg-card/30 flex items-center justify-center">
            <p className="text-muted-foreground font-mono">NO UPCOMING EVENTS</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <Card key={event.id} className="bg-card/50 hover:bg-card/80 transition-colors border-border cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary uppercase">
                      {event.status}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2">{event.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{format(new Date(event.startTime), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(event.startTime), "HH:mm")} - {format(new Date(event.endTime), "HH:mm")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{event.guestsCount} guests</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
