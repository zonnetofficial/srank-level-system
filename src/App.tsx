import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import Index from "./pages/Index";
import DailyQuest from "./pages/DailyQuest";
import Skills from "./pages/Skills";
import Titles from "./pages/Titles";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import PunishmentOverlay from "./components/PunishmentOverlay";
import { useGameState } from "./hooks/useGameState";

const queryClient = new QueryClient();

const AppContent = () => {
  const { state, completePunishment, failPunishment } = useGameState();

  // Calculate stat penalty for display
  let titleIdx = 0;
  for (let i = 0; i < state.classTitles.length; i++) {
    if (state.classTitles[i].obtained) titleIdx = i;
  }
  const statPenalty = (titleIdx + 1) * 5;

  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/quest" element={<DailyQuest />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/titles" element={<Titles />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />

      {state.pendingPunishments > 0 && (
        <PunishmentOverlay
          pendingCount={state.pendingPunishments}
          level={state.level}
          statPenalty={statPenalty}
          onComplete={completePunishment}
          onFail={failPunishment}
        />
      )}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
