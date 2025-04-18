import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import InterviewPlanning from "./pages/InterviewPlanning";
import Sidebar from "./components/Sidebar";
import InterviewSession from "./pages/InterviewSession";
import InterviewResponses from "./pages/InterviewResponses";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/interview/:uuid/responses" component={InterviewResponses} />
          <Route exact path="/interview/:uuid" component={InterviewPlanning} />
          <Route path="/user-interview/:uuid" component={InterviewSession}/>
          <Route component={NotFound} />
        </Switch>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
