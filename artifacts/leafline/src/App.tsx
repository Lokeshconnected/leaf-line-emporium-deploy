import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import PlantDetail from "@/pages/PlantDetail";
import Auth from "@/pages/Auth";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import Donations from "@/pages/Donations";
import AIAssistant from "@/pages/AIAssistant";
import InfoPage from "@/pages/InfoPage";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import { useAuthStore } from "@/store/authStore";
import { initApiClient } from "@/lib/api";

const queryClient = new QueryClient();

function AppInit() {
  const { token } = useAuthStore();
  useEffect(() => {
    initApiClient(() => token);
  }, [token]);
  return null;
}

function Router() {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shop" component={Shop} />
        <Route path="/plant/:id" component={PlantDetail} />
        <Route path="/auth" component={Auth} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/orders" component={Orders} />
        <Route path="/donations" component={Donations} />
        <Route path="/donate" component={Donations} />
        <Route path="/assistant" component={AIAssistant} />
        <Route path="/:section/:slug" component={InfoPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppInit />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
