import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useListZones, useListSessionTypes } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Settings() {
  const { data: zones = [], isLoading: isLoadingZones } = useListZones();
  const { data: sessionTypes = [], isLoading: isLoadingSessionTypes } = useListSessionTypes();

  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-16 border-b border-border flex items-center px-6 justify-between bg-card/50 backdrop-blur-sm shrink-0">
        <h1 className="text-xl font-bold font-mono">Settings</h1>
      </header>
      
      <div className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="zones" className="w-full max-w-4xl">
          <TabsList className="mb-6 bg-muted/50 border border-border">
            <TabsTrigger value="zones">Zones</TabsTrigger>
            <TabsTrigger value="sessions">Session Types</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>
          
          <TabsContent value="zones" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium">Park Zones</h2>
                <p className="text-sm text-muted-foreground">Manage your VR arenas and game areas.</p>
              </div>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Zone</Button>
            </div>
            
            <div className="grid gap-4">
              {isLoadingZones ? (
                <p className="text-muted-foreground py-4">Loading...</p>
              ) : zones.map(zone => (
                <Card key={zone.id} className="bg-card/30">
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: zone.color }} />
                        <CardTitle className="text-base">{zone.name}</CardTitle>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <CardDescription>Capacity: {zone.capacity} players</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium">Session Types</h2>
                <p className="text-sm text-muted-foreground">Configure game durations and types.</p>
              </div>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" /> Add Session</Button>
            </div>
            
            <div className="grid gap-4">
              {isLoadingSessionTypes ? (
                <p className="text-muted-foreground py-4">Loading...</p>
              ) : sessionTypes.map(session => (
                <Card key={session.id} className="bg-card/30">
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: session.color }} />
                        <CardTitle className="text-base">{session.name}</CardTitle>
                      </div>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <CardDescription>Duration: {session.minDuration} minutes</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="system">
            <Card className="bg-card/30">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>General park configuration.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Working hours and global settings coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
