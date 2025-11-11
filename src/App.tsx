
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import { AuthProvider } from "@/context/AuthContext";
import AppHeader from "@/components/AppHeader";
import HomePage from "@/pages/HomePage";
import GamePage from "@/pages/GamePage";
import AboutPage from "@/pages/AboutPage";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import TeacherDashboard from "@/pages/TeacherDashboard";
import SessionHistoryPage from "@/pages/SessionHistoryPage";
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { MagnetLines } from "@/components/ui/magnet-lines";
import FloatingElements from "@/components/FloatingElements";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <GameProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-[#1A1F2C] to-purple-900 flex flex-col relative">
              {/* Global Magnetic Lines Background */}
              <div className="fixed inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
                <MagnetLines
                  rows={20}
                  columns={20}
                  containerSize="150vmax"
                  lineColor="hsl(var(--secondary))"
                  lineWidth="0.4vmin"
                  lineHeight="4vmin"
                  baseAngle={0}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </div>
              
              {/* Animated Gradient Orbs */}
              <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px] animate-float" style={{ animationDuration: '8s' }} />
                <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary/30 rounded-full blur-[100px] animate-float" style={{ animationDuration: '10s', animationDelay: '2s' }} />
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/30 rounded-full blur-[90px] animate-float" style={{ animationDuration: '12s', animationDelay: '4s' }} />
              </div>
              
              <FloatingElements count={40} variant="default" />
              
              <AppHeader />
              <main className="flex-1 pb-12 relative z-10">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/game" element={<GamePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/teacher" element={<TeacherDashboard />} />
                  <Route path="/session-history" element={<SessionHistoryPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
          <Toaster />
        </GameProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
