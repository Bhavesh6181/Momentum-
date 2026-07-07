import React from "react";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
/**
 * Testimonials — social proof cards
 * Background: surface-container-low (#1a1b21)
 * Card style: glow-card border from mockup (border-white/8 + gradient)
 */

interface TestimonialProps {
  quote: string;
  name: string;
  role: string;
  stat: string;
  statLabel: string;
}

const testimonials: TestimonialProps[] = [
  {
    quote:
      "Momentum turned my scattered 6-hour sessions into surgical 3-hour blocks. My GPA went from 3.1 to 3.8 in one semester.",
    name: "Rohan S.",
    role: "CS · IIT Bombay",
    stat: "+0.7",
    statLabel: "GPA GAIN",
  },
  {
    quote:
      "The peer accountability system is unlike anything else. Knowing 2,000 people are watching your streak keeps you honest.",
    name: "Elena Z.",
    role: "Physics · Oxford",
    stat: "42d",
    statLabel: "STREAK",
  },
  {
    quote:
      "I used to study 12 hours and feel empty. Now I study 5 focused hours and feel unstoppable. The data doesn't lie.",
    name: "Marcus K.",
    role: "Law · Harvard",
    stat: "5x",
    statLabel: "OUTPUT ↑",
  },
];

const TestimonialCard: React.FC<TestimonialProps & { index: number }> = ({
  quote,
  name,
  role,
  stat,
  statLabel,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.12, duration: 0.6, ease: EASE }}
    className="flex flex-col gap-6 p-8"
    style={{
      border: "1px solid rgba(255,255,255,0.08)",
      background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)",
    }}
    role="article"
    aria-label={`Testimonial from ${name}`}
  >
    {/* Stat badge */}
    <div className="flex items-end gap-2">
      <span
        className="font-mono font-medium text-primary-container"
        style={{ fontSize: "18px", lineHeight: 1 }}
        aria-label={`${stat} ${statLabel}`}
      >
        {stat}
      </span>
      <span
        className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase"
        aria-hidden="true"
      >
        {statLabel}
      </span>
    </div>

    <blockquote className="text-[16px] leading-[1.6] text-on-surface flex-1">"{quote}"</blockquote>

    <div className="flex items-center gap-3 pt-4 border-t border-white/8">
      {/* Avatar placeholder */}
      <div
        className="w-9 h-9 bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-[12px] font-bold text-primary"
        aria-hidden="true"
      >
        {name[0]}
      </div>
      <div>
        <p className="text-[14px] font-semibold text-on-surface leading-none">{name}</p>
        <p className="text-[12px] text-on-surface-variant mt-1">{role}</p>
      </div>
    </div>
  </motion.div>
);

export const Testimonials: React.FC = () => {
  return (
    <section
      className="py-[80px] px-[16px] md:px-[48px] bg-surface-container-low text-left"
      aria-label="Student testimonials"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="inline-block px-3 py-1 bg-primary-container/10 border border-primary-container/30 text-primary-container text-[12px] font-semibold tracking-[0.05em] uppercase mb-6">
            SOCIAL PROOF
          </div>
          <h2 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.2] max-w-lg">
            Built by students who refused to settle.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} {...t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};