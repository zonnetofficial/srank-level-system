import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Index from "./pages/Index";
import DailyQuest from "./pages/DailyQuest";
import Skills from "./pages/Skills";
import Titles from "./pages/Titles";
import History from "./pages/History";
import Auth from "./pages/Auth";
import MonarchMode from "./pages/MonarchMode";
import Shop from "./pages/Shop";
import MandatoryMission from "./pages/MandatoryMission";
import Dungeons from "./pages/Dungeons";
import NotFound from "./pages/NotFound";
import PunishmentOverlay from "./components/PunishmentOverlay";
import { useGameState } from "./hooks/useGameState";
import { useAuth } from "./hooks/useAuth";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary font-display text-lg animate-pulse">Cargando...</div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  const { state, completePunishment, failPunishment } = useGameState();

  let titleIdx = 0;
  for (let i = 0; i < state.classTitles.length; i++) {
    if (state.classTitles[i].obtained) titleIdx = i;
  }
  const statPenalty = (titleIdx + 1) * 5;

  return (
    <>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/quest" element={<ProtectedRoute><DailyQuest /></ProtectedRoute>} />
        <Route path="/skills" element={<ProtectedRoute><Skills /></ProtectedRoute>} />
        <Route path="/titles" element={<ProtectedRoute><Titles /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/monarch" element={<ProtectedRoute><MonarchMode /></ProtectedRoute>} />
        <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
        <Route path="/mission" element={<ProtectedRoute><MandatoryMission /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>

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
