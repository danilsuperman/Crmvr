import { useState, useMemo } from "react";
import { format, addDays, subDays } from "date-fns";
import { 
  useListZones, 
  useListBookings, 
  useListSessionTypes,
  useCreateBooking
} from "@workspace/api-client-react";
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'event': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    default: return 'bg-muted text-muted-foreground border-border';
  }
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, "yyyy-MM-dd");
  
  const { data: zones = [], isLoading: isLoadingZones } = useListZones();
  const { data: sessionTypes = [] } = useListSessionTypes();
  const { data: bookings = [], isLoading: isLoadingBookings, refetch } = useListBookings({ date: dateStr });
  
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 10; i <= 22; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      if (i !== 22) slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ time: string, zoneId: number } | null>(null);

  const createBooking = useCreateBooking();

  const handleCellClick = (time: string, zoneId: number) => {
    setSelectedCell({ time, zoneId });
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full z-10 bg-background">
      <header className="h-16 border-b border-border flex items-center px-4 md:px-6 justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 border border-border rounded-md bg-card/50">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{format(currentDate, "MMM d, yyyy")}</span>
          </div>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())} className="ml-2">
            Today
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => { setSelectedCell(null); setIsModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto bg-card/30">
        {isLoadingZones || isLoadingBookings ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground font-mono animate-pulse">LOADING GRID...</p>
          </div>
        ) : (
          <div className="inline-block min-w-full p-4">
            <div className="flex border-b border-border sticky top-0 bg-background/95 backdrop-blur z-20">
              <div className="w-20 shrink-0 border-r border-border p-2" />
              {zones.map(zone => (
                <div key={zone.id} className="flex-1 min-w-[200px] p-2 text-center border-r border-border font-medium text-sm truncate px-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} />
                    {zone.name}
                  </div>
                  <div className="text-xs text-muted-foreground font-normal mt-1">Cap: {zone.capacity}</div>
                </div>
              ))}
            </div>
            
            {timeSlots.map((time) => (
              <div key={time} className="flex border-b border-border group relative hover:bg-muted/10 transition-colors">
                <div className="w-20 shrink-0 border-r border-border p-2 text-xs font-medium text-muted-foreground sticky left-0 bg-background/95 flex items-center justify-center z-10">
                  {time}
                </div>
                {zones.map(zone => {
                  const cellBookings = bookings.filter(b => b.zoneId === zone.id && b.startTime.startsWith(time));
                  return (
                    <div 
                      key={`${time}-${zone.id}`} 
                      className="flex-1 min-w-[200px] border-r border-border p-1 min-h-[60px] cursor-pointer hover:bg-primary/5 transition-colors relative"
                      onClick={() => handleCellClick(time, zone.id)}
                    >
                      {cellBookings.map(booking => (
                        <div 
                          key={booking.id} 
                          className={cn("absolute inset-x-1 top-1 rounded border p-2 text-xs overflow-hidden flex flex-col gap-1 z-10 shadow-sm", getStatusColor(booking.status))}
                          style={{ height: 'calc(100% - 8px)' }}
                          onClick={(e) => { e.stopPropagation(); /* edit booking */ }}
                        >
                          <div className="font-medium truncate">{booking.clientName || 'Unknown'}</div>
                          <div className="flex justify-between items-center opacity-80">
                            <span>{booking.guestsCount} guests</span>
                            <span className="capitalize">{booking.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" defaultValue={dateStr} />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" defaultValue={selectedCell?.time || "12:00"} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Zone</Label>
              <Select defaultValue={selectedCell?.zoneId?.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map(z => (
                    <SelectItem key={z.id} value={z.id.toString()}>{z.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input placeholder="John Doe" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Guests</Label>
                <Input type="number" defaultValue="1" min="1" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue="confirmed">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button className="w-full mt-2" onClick={() => {
              toast.success("Booking created");
              setIsModalOpen(false);
            }}>
              Create Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
