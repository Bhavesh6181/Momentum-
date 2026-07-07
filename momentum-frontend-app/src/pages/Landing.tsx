import React from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { LiveActivityTicker } from "../components/common/LiveActivityTicker";
import { SocialProofMarquee } from "../components/common/SocialProofMarquee";
import { DashboardPreviewCard } from "../components/common/DashboardPreviewCard";
import { Button } from "../components/ui/Button";
import { ArrowRight, RefreshCw, Zap, Users } from "lucide-react";

export const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-white">
      {/* Background grain texture */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent mix-blend-overlay" />

      {/* Navigation */}
      <Navbar />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-margin-mobile md:px-margin-desktop py-24 min-h-[750px] flex flex-col justify-center overflow-hidden">
          <div className="max-w-6xl w-full mx-auto grid grid-cols-12 gap-gutter relative z-10 text-left">
            <div className="col-span-12 lg:col-span-8">
              <h1 className="text-display-lg font-extrabold tracking-tight mb-8 leading-tight">
                You're never{"\n"}studying alone.
              </h1>
            </div>
          </div>

          {/* Horizontal Activity Loop */}
          <LiveActivityTicker />

          <div className="max-w-6xl w-full mx-auto px-margin-mobile md:px-0 text-left">
            <div className="flex flex-wrap gap-6">
              <Button
                variant="primary"
                onClick={() => navigate("/login")}
                className="group gap-3 text-body-lg"
              >
                Start Focus Session
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/groups")}
                className="text-body-lg"
              >
                View Study Rooms
              </Button>
            </div>
          </div>
        </section>

        {/* Social Proof Marquee */}
        <SocialProofMarquee />

        {/* Dashboard Preview Section */}
        <section className="relative py-section-gap-v px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden text-left">
          <div className="max-w-6xl mx-auto grid grid-cols-12 gap-gutter items-center">
            <div className="col-span-12 lg:col-span-4 mb-16 lg:mb-0">
              <div className="inline-block px-3 py-1 bg-primary-container/10 border border-primary-container/30 text-primary text-label-caps font-bold mb-6 rounded-md">
                LIVE INTERFACE
              </div>
              <h2 className="text-headline-lg font-bold mb-6 max-w-sm">
                Precision tools for the modern scholar.
              </h2>
              <p className="text-body-lg text-on-surface-variant max-w-sm">
                Real-time data visualization that transforms raw study hours into actionable performance metrics.
              </p>
            </div>
            <div className="col-span-12 lg:col-span-8 relative">
              <DashboardPreviewCard />
            </div>
          </div>
        </section>

        {/* Features Column Section */}
        <section className="py-section-gap-v px-margin-mobile md:px-margin-desktop bg-surface-container-lowest text-left">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
            <div className="group">
              <div className="mb-8 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 text-on-surface-variant group-hover:text-primary group-hover:border-primary transition-all duration-300">
                <RefreshCw size={24} />
              </div>
              <h3 className="text-headline-md font-bold mb-4">Live Sync</h3>
              <p className="text-body-lg text-on-surface-variant">
                Stream your focus sessions in real-time. Join thousands of high-achievers in low-latency study rooms designed for zero distraction.
              </p>
            </div>
            <div className="group">
              <div className="mb-8 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 text-on-surface-variant group-hover:text-primary group-hover:border-primary transition-all duration-300">
                <Zap size={24} />
              </div>
              <h3 className="text-headline-md font-bold mb-4">Focus Streaks</h3>
              <p className="text-body-lg text-on-surface-variant">
                Our algorithm tracks deep work cycles. Momentum rewards consistency with performance-tier badges and analytics-driven insights.
              </p>
            </div>
            <div className="group">
              <div className="mb-8 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 text-on-surface-variant group-hover:text-primary group-hover:border-primary transition-all duration-300">
                <Users size={24} />
              </div>
              <h3 className="text-headline-md font-bold mb-4">Peer Accountability</h3>
              <p className="text-body-lg text-on-surface-variant">
                Automated check-ins and shared progress metrics ensure you stay committed to your long-term academic trajectory.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-section-gap-v px-margin-mobile md:px-margin-desktop text-center bg-surface relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-display-lg font-bold mb-8">Ready for takeoff?</h2>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-white text-background hover:bg-primary-container hover:text-white font-bold mb-6"
            >
              Launch Your Dashboard
            </Button>
            <div className="flex justify-center items-center gap-4 text-on-surface-variant">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-signal-green" />
                <span className="text-label-caps">1,402 ACTIVE NOW</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-label-caps">FREE FOR STUDENTS</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-dim border-t border-white/5 px-margin-mobile md:px-margin-desktop py-12 text-left">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="text-headline-md font-bold tracking-tighter text-on-surface mb-4">Momentum</div>
            <p className="text-body-sm text-on-surface-variant">
              High-performance study ecosystem for the digital age. Engineered for concentration and growth.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div>
              <h4 className="text-label-caps font-bold text-on-surface mb-6 uppercase">Product</h4>
              <ul className="space-y-3">
                <li><a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Features</a></li>
                <li><a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Dashboard</a></li>
                <li><a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Rooms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-label-caps font-bold text-on-surface mb-6 uppercase">Legal</h4>
              <ul className="space-y-3">
                <li><a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy</a></li>
                <li><a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Terms</a></li>
                <li><a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Safety</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-label-caps font-bold text-on-surface mb-6 uppercase">Connect</h4>
              <ul className="space-y-3">
                <li><a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Twitter</a></li>
                <li><a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Discord</a></li>
                <li><a className="text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Changelog</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-label-caps text-on-surface-variant/40">
            © 2024 MOMENTUM PRODUCTIVITY. ENGINEERED FOR PERFORMANCE.
          </div>
          <div className="flex gap-6">
            <span className="text-label-caps text-on-surface-variant/40">v2.4.0-STABLE</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
