import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * CTA — "Ready for takeoff?" section
 * Exact match to Stitch mockup:
 * - py-section-gap-v (80px), text-center, bg-surface (#121319)
 * - CTA button: bg-white text-surface-dim, hover → bg-[#6C5CE7] text-white
 *   (mockup uses ease-out-expo 500ms, not primary-container)
 * - Stat row: signal-green dot (no pulse — static in mockup), LABEL CAPS text
 */
export const CTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section
      className="py-[80px] px-[16px] md:px-[48px] text-center bg-surface relative overflow-hidden"
      aria-label="Call to action — get started with Momentum"
    >
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[600px] h-[300px] bg-primary-container/6 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="font-extrabold tracking-[-0.04em] leading-[1.1] mb-8"
          style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
        >
          Ready for takeoff?
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
        >
          {/*
            Exact hover: bg-white → hover:bg-[#6C5CE7] with ease-out-expo 500ms
            Inline style used because Tailwind arbitrary values won't support custom easing on arbitrary class
          */}
          <button
            onClick={() => navigate("/register")}
            className="
              bg-white text-surface px-12 py-5 font-bold text-[16px] mb-6
              transition-all duration-500
              hover:bg-primary-container hover:text-white
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface
            "
            style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
            aria-label="Launch your dashboard — create a free account"
          >
            Launch Your Dashboard
          </button>

          <div
            className="flex justify-center items-center gap-4 text-on-surface-variant"
            aria-label="1,402 members active now. Free for students."
          >
            <span className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full bg-signal-green"
                aria-hidden="true"
              />
              <span className="text-[12px] font-semibold tracking-[0.05em] uppercase">1,402 ACTIVE NOW</span>
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" aria-hidden="true" />
            <span className="text-[12px] font-semibold tracking-[0.05em] uppercase">FREE FOR STUDENTS</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
