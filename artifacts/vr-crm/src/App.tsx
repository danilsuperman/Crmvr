import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/layout/shell";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Clients from "@/pages/clients";
import ClientDetail from "@/pages/client-detail";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Control from "@/pages/control";
import DeviceDetail from "@/pages/device-detail";
import Devices from "@/pages/devices";
import DeviceAdd from "@/pages/device-add";
import Analytics from "@/pages/analytics";
import Registration from "@/pages/registration";

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/control" component={Control} />
        <Route path="/control/:id" component={DeviceDetail} />
        <Route path="/devices" component={Devices} />
        <Route path="/devices/add" component={DeviceAdd} />
        <Route path="/clients" component={Clients} />
        <Route path="/clients/:id" component={ClientDetail} />
        <Route path="/events" component={Events} />
        <Route path="/events/:id" component={EventDetail} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/registration" component={Registration} />
        <Route path="/settings" component={Settings} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
