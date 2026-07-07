import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { useNavigate } from "react-router-dom";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Pricing — three-tier plan section
 * Background: bg-[#0A0A0D] (background from design token)
 * Card: glow-card style — border-white/8, gradient
 * Highlighted plan: border-[#6C5CE7]/50, glow shadow
 */

interface PlanProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

const plans: PlanProps[] = [
  {
    name: "Focus",
    price: "Free",
    period: "forever",
    description: "Everything you need to start building discipline.",
    features: ["3 study rooms / day", "Basic streak tracking", "Public leaderboard", "Focus timer"],
    cta: "Get Started Free",
  },
  {
    name: "Scholar",
    price: "₹299",
    period: "/ month",
    description: "Unlock the full performance stack.",
    features: [
      "Unlimited study rooms",
      "Advanced analytics dashboard",
      "Private group rooms",
      "AI study plan generator",
      "Goal tracking",
      "Priority support",
    ],
    cta: "Start 7-day Trial",
    highlighted: true,
    badge: "MOST POPULAR",
  },
  {
    name: "Institution",
    price: "Custom",
    period: "pricing",
    description: "Deploy Momentum across your entire campus.",
    features: [
      "Everything in Scholar",
      "Admin dashboard",
      "SSO / LDAP integration",
      "Custom analytics exports",
      "Dedicated CSM",
    ],
    cta: "Contact Sales",
  },
];

const PlanCard: React.FC<PlanProps & { index: number }> = ({
  name,
  price,
  period,
  description,
  features,
  cta,
  highlighted,
  badge,
  index,
}) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: EASE }}
      className="flex flex-col p-8 relative"
      style={{
        border: highlighted
          ? "1px solid rgba(108,92,231,0.5)"
          : "1px solid rgba(255,255,255,0.08)",
        background: highlighted
          ? "linear-gradient(135deg, rgba(108,92,231,0.08) 0%, transparent 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 100%)",
        boxShadow: highlighted ? "0 0 40px rgba(108,92,231,0.15)" : "none",
      }}
      aria-label={`${name} plan`}
    >
      {badge && (
        <div className="absolute -top-3 left-8">
          <span className="bg-primary-container text-white text-[10px] font-bold tracking-[0.05em] uppercase px-3 py-1">
            {badge}
          </span>
        </div>
      )}

      <div className="mb-8">
        <p className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant uppercase mb-3">{name}</p>
        <div className="flex items-end gap-1 mb-2">
          <span className="font-mono font-medium text-on-surface" style={{ fontSize: "32px", lineHeight: 1 }}>
            {price}
          </span>
          <span className="text-[14px] text-on-surface-variant mb-1">{period}</span>
        </div>
        <p className="text-[14px] leading-[1.5] text-on-surface-variant">{description}</p>
      </div>

      <ul className="space-y-3 flex-1 mb-8" aria-label={`${name} plan features`}>
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-[14px] text-on-surface">
            <Check
              size={14}
              className={highlighted ? "text-primary-container" : "text-signal-green"}
              aria-hidden="true"
            />
            {f}
          </li>
        ))}
      </ul>

      <Button
        variant={highlighted ? "primary" : "ghost"}
        onClick={() => navigate("/register")}
        className="w-full justify-center font-bold py-3"
        aria-label={`${cta} for ${name} plan`}
      >
        {cta}
      </Button>
    </motion.div>
  );
};

export const Pricing: React.FC = () => {
  return (
    <section
      className="py-[80px] px-[16px] md:px-[48px] bg-background text-left"
      aria-label="Pricing plans"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-16">
          <div className="inline-block px-3 py-1 bg-primary-container/10 border border-primary-container/30 text-primary-container text-[12px] font-semibold tracking-[0.05em] uppercase mb-6">
            PRICING
          </div>
          <h2 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.2] max-w-lg">
            Invest in your performance stack.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {plans.map((p, i) => (
            <PlanCard key={p.name} {...p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
