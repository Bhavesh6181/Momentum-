import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
/**
 * FAQ — accordion with AnimatePresence expand/collapse
 * Background: bg-[#121319] (surface from mockup)
 */

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Is Momentum really free?",
    answer:
      "Yes — our Focus tier is completely free, forever. You get access to 3 study rooms per day, basic streak tracking, and the public leaderboard. No credit card required.",
  },
  {
    question: "How do study rooms work?",
    answer:
      "Study rooms are real-time virtual spaces where you and other students study together. You can see who's online, how long they've been studying, and what subject they're focused on. There's no video — just presence, accountability, and shared energy.",
  },
  {
    question: "What makes the streaks different from other apps?",
    answer:
      "Most apps track calendar streaks — we track deep work cycles. Our algorithm distinguishes between productive focus blocks and passive sitting. A 2-hour deep work session counts more than 8 hours of distracted studying.",
  },
  {
    question: "Can I use Momentum with my study group?",
    answer:
      "Absolutely. You can create a private group room, invite your friends, set shared goals, and track collective hours. The Scholar plan unlocks unlimited group rooms and advanced shared analytics.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Our mobile app is in active development. The web app is fully responsive and works perfectly on mobile browsers today. Native iOS and Android apps are targeted for Q3 2024.",
  },
  {
    question: "How does the leaderboard avoid gamification toxicity?",
    answer:
      "We rank by consistency, not raw hours. Gaming 24-hour sessions won't help you — the algorithm weights sustainable daily patterns and streak quality. This naturally rewards healthy study habits.",
  },
];

const FAQAccordion: React.FC<FAQItem & { isOpen: boolean; onToggle: () => void; index: number }> = ({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}) => {
  const id = `faq-${index}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: EASE }}
      className="border-b border-white/8"
      role="listitem"
    >
      <button
        id={`${id}-btn`}
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
      >
        <span className="text-[16px] font-semibold text-on-surface group-hover:text-primary transition-colors duration-200 pr-8">
          {question}
        </span>
        <div
          className="shrink-0 w-8 h-8 flex items-center justify-center border border-white/10 text-on-surface-variant group-hover:border-primary-container/50 group-hover:text-primary-container"
          style={{ transition: "color 200ms, border-color 200ms" }}
          aria-hidden="true"
        >
          {isOpen ? <Minus size={14} /> : <Plus size={14} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-btn`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[16px] leading-[1.6] text-on-surface-variant max-w-2xl">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className="py-[80px] px-[16px] md:px-[48px] bg-surface text-left"
      aria-label="Frequently asked questions"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-[24px]">
        <div className="col-span-12 lg:col-span-4 mb-12 lg:mb-0">
          <div className="inline-block px-3 py-1 bg-primary-container/10 border border-primary-container/30 text-primary-container text-[12px] font-semibold tracking-[0.05em] uppercase mb-6">
            FAQ
          </div>
          <h2 className="text-[32px] font-bold tracking-[-0.02em] leading-[1.2] max-w-xs">
            Questions worth asking.
          </h2>
        </div>

        <div className="col-span-12 lg:col-span-8" role="list">
          {faqs.map((faq, i) => (
            <FAQAccordion
              key={faq.question}
              {...faq}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
