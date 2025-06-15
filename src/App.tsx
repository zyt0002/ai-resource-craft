
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AIGenerator from "./pages/AIGenerator";
import ResourceManager from "./pages/ResourceManager";
import ResourceCategories from "./pages/ResourceCategories";
import Collaborate from "./pages/Collaborate";
import Settings from "./pages/Settings";
import KnowledgeBase from "./pages/KnowledgeBase";
import Auth from "./pages/Auth";
import Layout from "@/components/Layout";
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/ai-generator" element={<AIGenerator />} />
                        <Route path="/resources" element={<ResourceManager />} />
                        <Route path="/categories" element={<ResourceCategories />} />
                        <Route path="/collaborate" element={<Collaborate />} />
                        <Route path="/knowledge-base" element={<KnowledgeBase />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
