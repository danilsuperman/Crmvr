import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/layout/shell";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Clients from "@/pages/clients";
import ClientDetail from "@/pages/client-detail";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Control from "@/pages/control";
import DeviceDetail from "@/pages/device-detail";
import Devices from "@/pages/devices";
import DeviceAdd from "@/pages/device-add";
import Analytics from "@/pages/analytics";
import Registration from "@/pages/registration";
import Landing from "@/pages/landing";
import Network from "@/pages/network";
import Pricing from "@/pages/pricing";
import Cameras from "@/pages/cameras";
import Inbox from "@/pages/inbox";
import AiConsulting from "@/pages/ai-consulting";
import Leagues from "@/pages/leagues";
import Loyalty from "@/pages/loyalty";
import AiAdmin from "@/pages/ai-admin";
import Knowledge from "@/pages/knowledge";
import KnowledgeArticle from "@/pages/knowledge-article";

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  if (location === "/") return <Landing />;
  if (location === "/pricing") return <Pricing />;
  return (
    <Shell>
      <Switch>
        <Route path="/dashboard" component={Home} />
        <Route path="/control" component={Control} />
        <Route path="/control/:id" component={DeviceDetail} />
        <Route path="/devices" component={Devices} />
        <Route path="/devices/add" component={DeviceAdd} />
        <Route path="/clients" component={Clients} />
        <Route path="/clients/:id" component={ClientDetail} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/registration" component={Registration} />
        <Route path="/settings" component={Settings} />
        <Route path="/network" component={Network} />
        <Route path="/profile" component={Profile} />
        <Route path="/cameras" component={Cameras} />
        <Route path="/inbox" component={Inbox} />
        <Route path="/ai-consulting" component={AiConsulting} />
        <Route path="/leagues" component={Leagues} />
        <Route path="/loyalty" component={Loyalty} />
        <Route path="/ai-admin" component={AiAdmin} />
        <Route path="/knowledge" component={Knowledge} />
        <Route path="/knowledge/:id" component={KnowledgeArticle} />
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
