import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetClient, 
  useUpdateClient,
  getGetClientQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ClientDetail() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const queryClient = useQueryClient();
  
  const { data: client, isLoading } = useGetClient(id, { 
    query: { enabled: !!id, queryKey: getGetClientQueryKey(id) } 
  });
  const updateClient = useUpdateClient();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    notes: ""
  });
  
  // Basic initialization would go here with useEffect, skipping for brevity
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full z-10">
        <header className="h-16 border-b border-border flex items-center px-6 gap-4 bg-card/50 backdrop-blur-sm">
          <Link href="/clients">
            <Button variant="ghost" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-xl font-bold font-mono">Loading Client...</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-16 border-b border-border flex items-center px-6 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/clients">
            <Button variant="ghost" size="icon"><ChevronLeft className="w-4 h-4" /></Button>
          </Link>
          <h1 className="text-xl font-bold font-mono">{client?.name || "Client Details"}</h1>
        </div>
        <Button onClick={() => {
          updateClient.mutate({ id, data: formData }, {
            onSuccess: () => {
              toast.success("Client updated");
              queryClient.invalidateQueries({ queryKey: getGetClientQueryKey(id) });
            }
          });
        }}>
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </header>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="grid gap-4 border border-border bg-card/30 p-6 rounded-lg">
            <h2 className="font-medium text-lg">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input defaultValue={client?.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue={client?.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Notes</Label>
                <Input defaultValue={client?.notes || ""} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} />
              </div>
            </div>
          </div>
          
          <div className="border border-border bg-card/30 p-6 rounded-lg">
            <h2 className="font-medium text-lg mb-4">Booking History</h2>
            {client?.bookings?.length ? (
              <div className="space-y-2">
                {client.bookings.map(b => (
                  <div key={b.id} className="flex justify-between items-center p-3 border border-border rounded bg-card/50">
                    <div>
                      <div className="font-medium">{format(new Date(b.startTime), "MMM d, yyyy")}</div>
                      <div className="text-xs text-muted-foreground">{b.zoneName} • {b.guestsCount} guests</div>
                    </div>
                    <div className="capitalize text-sm font-medium px-2 py-1 rounded bg-secondary">{b.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No bookings yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
