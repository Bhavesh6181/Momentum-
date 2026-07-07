import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryProvider, ThemeProvider, MotionProvider, AuthProvider } from "./providers";
import { PublicRoute } from "./routes";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";

// ─── Route-level code splitting with React.lazy ────────────────────────────────
// Each lazy import becomes its own JS chunk, reducing initial bundle size.
const Landing       = lazy(() => import("./pages/Landing/Landing").then(m => ({ default: m.Landing })));
const Login         = lazy(() => import("./pages/Login").then(m => ({ default: m.Login })));
const Register      = lazy(() => import("./pages/Register").then(m => ({ default: m.Register })));
const Onboarding    = lazy(() => import("./pages/Onboarding").then(m => ({ default: m.OnboardingFlow })));
const KitchenSink   = lazy(() => import("./pages/KitchenSink").then(m => ({ default: m.KitchenSink })));
const Dashboard     = lazy(() => import("./pages/Dashboard/Dashboard").then(m => ({ default: m.Dashboard })));
const FocusMode     = lazy(() => import("./pages/FocusMode/FocusMode").then(m => ({ default: m.FocusMode })));
const Groups        = lazy(() => import("./pages/Groups").then(m => ({ default: m.Groups })));
const GroupDetail   = lazy(() => import("./pages/GroupDetail").then(m => ({ default: m.GroupDetail })));
const StudyRoom     = lazy(() => import("./pages/StudyRoom").then(m => ({ default: m.StudyRoom })));
const Goals         = lazy(() => import("./pages/Goals").then(m => ({ default: m.Goals })));
const Leaderboard   = lazy(() => import("./pages/Leaderboard").then(m => ({ default: m.Leaderboard })));
const Analytics     = lazy(() => import("./pages/Analytics").then(m => ({ default: m.Analytics })));
const Profile       = lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const Notifications = lazy(() => import("./pages/Notifications/Notifications").then(m => ({ default: m.Notifications })));

// ─── Full-page loading fallback ────────────────────────────────────────────────
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      {/* Momentum wordmark shimmer */}
      <div className="w-2 h-10 bg-primary-container rounded-full animate-pulse" />
      <span className="text-label-caps text-on-surface-variant uppercase tracking-widest animate-pulse">
        Loading…
      </span>
    </div>
  </div>
);

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <MotionProvider>
          <AuthProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* ── Public Routes ── */}
                  <Route path="/" element={<Landing />} />

                  <Route
                    path="/login"
                    element={
                      <PublicRoute>
                        <Login />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/register"
                    element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
                    }
                  />

                  {/* ── Protected Routes ── */}
                  <Route
                    path="/onboarding"
                    element={
                      <ProtectedRoute>
                        <Onboarding />
                      </ProtectedRoute>
                    }
                  />

                  {/* Sidebar Layout Protected Routes */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <MainLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/focus" element={<Navigate to="/focus/active" replace />} />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/groups/:id" element={<GroupDetail />} />
                    <Route path="/groups/room/:id" element={<StudyRoom />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Route>

                  {/* Fullscreen Active Focus Mode Route */}
                  <Route
                    path="/focus/active"
                    element={
                      <ProtectedRoute>
                        <FocusMode />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Dev / Debug ── */}
                  <Route path="/kitchen-sink" element={<KitchenSink />} />

                  {/* ── Fallback ── */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </MotionProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
