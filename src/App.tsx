
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
import NotFound from "@/pages/NotFound";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <GameProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col relative overflow-x-hidden">
              {/* Animated background */}
              <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/80 to-indigo-900"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23A566FF\" fill-opacity=\"0.02\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-pink/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
                </div>
              </div>
              
              <div className="relative z-10 flex flex-col min-h-screen">
                <AppHeader />
                <main className="flex-1 relative">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/game" element={<GamePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/teacher" element={<TeacherDashboard />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </BrowserRouter>
          <Toaster />
        </GameProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
