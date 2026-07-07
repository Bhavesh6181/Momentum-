import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { LiveActivityTicker } from "../../../components/common/LiveActivityTicker";

/** ease-out-expo typed as a 4-element tuple for Framer Motion compatibility */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Hero — exact match to Stitch mockup:
 * - min-h-[819px]
 * - Display headline 72px / -0.04em tracking / 800 weight
 * - Staggered fade-up entrance animations
 * - Primary CTA: kinetic-indigo (#6C5CE7) with glow hover shadow
 * - Secondary CTA: ghost border-white/20, hover:bg-white/5
 */
export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative px-[16px] md:px-[48px] py-24 min-h-[819px] flex flex-col justify-center overflow-hidden"
      aria-labelledby="hero-headline"
    >
      {/* Ambient glow — kinetic-indigo radial bloom */}
      <div
        aria-hidden="true"
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-primary-container/8 blur-[120px] pointer-events-none"
      />

      <div className="max-w-6xl w-full mx-auto grid grid-cols-12 gap-[24px] relative z-10 text-left">
        <div className="col-span-12 lg:col-span-8">
          {/* Live indicator badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.6, ease: EASE }}
            className="inline-flex items-center gap-2 px-3 py-1 mb-8 border border-white/10 bg-white/[0.03]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse" aria-hidden="true" />
            <span className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase">
              2,481 members studying live
            </span>
          </motion.div>

          <motion.h1
            id="hero-headline"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.7, ease: EASE }}
            className="font-extrabold tracking-[-0.04em] leading-[1.1] mb-8 whitespace-pre-line"
            style={{ fontSize: "clamp(48px, 6vw, 72px)" }}
          >
            {"You're never\nstudying alone."}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.6, ease: EASE }}
            className="text-[16px] leading-[1.6] text-on-surface-variant max-w-lg mb-12"
          >
            Real-time study rooms, deep-work streaks, and peer accountability — engineered for the modern scholar.
          </motion.p>
        </div>
      </div>

      {/* Live Activity Ticker — matches mockup's ticker strip inside hero */}
      <LiveActivityTicker />

      {/* CTA Row */}
      <div className="max-w-6xl w-full mx-auto px-[16px] md:px-0 text-left">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36, duration: 0.6, ease: EASE }}
          className="flex flex-wrap gap-6"
        >
          <Button
            variant="primary"
            onClick={() => navigate("/login")}
            className="group gap-3 text-[16px] font-bold px-8 py-4"
            aria-label="Start a focus session — go to login"
          >
            Start Focus Session
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform duration-300"
              style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
              size={18}
              aria-hidden="true"
            />
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate("/groups")}
            className="text-[16px] font-bold px-8 py-4 border border-white/20 hover:bg-white/5 transition-colors duration-300"
            aria-label="Browse study rooms"
          >
            View Study Rooms
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
