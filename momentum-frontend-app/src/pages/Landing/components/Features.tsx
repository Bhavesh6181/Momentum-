import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, Zap, Users } from "lucide-react";
import { SocialProofMarquee } from "../../../components/common/SocialProofMarquee";
import { DashboardPreviewCard } from "../../../components/common/DashboardPreviewCard";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Features — matches Stitch mockup exactly:
 * - Social proof marquee: py-12, bg-surface-container-lowest, border-b border-white/5
 * - Dashboard preview section: py-section-gap-v (80px), bg-surface (#121319 from mockup), 12-col grid
 * - Feature icons: w-12 h-12, border border-white/10, NO border-radius (DEFAULT=0.125rem ≈ square)
 * - Feature icon hover: text-kinetic-indigo + border-kinetic-indigo with ease-out-expo
 * - Feature grid: grid-cols-3, gap-12 lg:gap-24
 */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.6, ease: EASE }}
    className="group"
  >
    {/* Icon container — 0.125rem border-radius (essentially square, per design tokens) */}
    <div
      className="mb-8 w-12 h-12 flex items-center justify-center border border-white/10 text-on-surface-variant
        group-hover:text-primary-container group-hover:border-primary-container"
      style={{ transition: "color 300ms cubic-bezier(0.16,1,0.3,1), border-color 300ms cubic-bezier(0.16,1,0.3,1)" }}
      aria-hidden="true"
    >
      {icon}
    </div>
    <h3 className="text-[20px] font-bold tracking-[-0.01em] leading-[1.4] mb-4">{title}</h3>
    <p className="text-[16px] leading-[1.6] text-on-surface-variant">{description}</p>
  </motion.div>
);

export const Features: React.FC = () => {
  const features = [
    {
      icon: <RefreshCw size={24} />,
      title: "Live Sync",
      description:
        "Stream your focus sessions in real-time. Join thousands of high-achievers in low-latency study rooms designed for zero distraction.",
    },
    {
      icon: <Zap size={24} />,
      title: "Focus Streaks",
      description:
        "Our algorithm tracks deep work cycles. Momentum rewards consistency with performance-tier badges and analytics-driven insights.",
    },
    {
      icon: <Users size={24} />,
      title: "Peer Accountability",
      description:
        "Automated check-ins and shared progress metrics ensure you stay committed to your long-term academic trajectory.",
    },
  ];

  return (
    <>
      {/* Social Proof Marquee — py-12, bg-surface-container-lowest, border-b */}
      <div className="border-b border-white/5">
        <SocialProofMarquee />
      </div>

      {/* Dashboard Preview — py-[80px], bg-surface */}
      <section
        className="relative py-[80px] px-[16px] md:px-[48px] bg-surface overflow-hidden text-left"
        aria-label="Live dashboard interface preview"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-12 gap-[24px] items-center">
          <div className="col-span-12 lg:col-span-4 mb-16 lg:mb-0">
            {/* Label badge — no border-radius per design tokens */}
            <div
              className="inline-block px-3 py-1 bg-primary-container/10 border border-primary-container/30
                text-primary-container text-[12px] font-semibold tracking-[0.05em] uppercase mb-6"
            >
              LIVE INTERFACE
            </div>
            <h2 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.2] mb-6 max-w-sm">
              Precision tools for the modern scholar.
            </h2>
            <p className="text-[16px] leading-[1.6] text-on-surface-variant max-w-sm">
              Real-time data visualization that transforms raw study hours into actionable performance metrics.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-8 relative">
            <DashboardPreviewCard />
          </div>
        </div>
      </section>

      {/* 3-Column Feature Grid — py-[80px], bg-surface-container-lowest */}
      <section
        className="py-[80px] px-[16px] md:px-[48px] bg-surface-container-lowest text-left"
        aria-label="Platform features"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>
    </>
  );
};
