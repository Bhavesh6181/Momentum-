import React from "react";

const marqueeItems = [
  "MIT STUDY COLLECTIVE",
  "OXFORD FOCUS LAB",
  "STANFORD PEERS",
  "98.4% RETENTION RATE",
  "1.2M HOURS FOCUSED",
];

export const SocialProofMarquee: React.FC = () => {
  const loopItems = [...marqueeItems, ...marqueeItems];

  return (
    <section className="py-12 border-b border-white/5 bg-surface-container-lowest overflow-hidden select-none">
      <div className="flex w-max animate-marquee">
        <div className="flex gap-24 items-center px-12">
          {loopItems.map((item, idx) => (
            <span
              key={`${item}-${idx}`}
              className="text-label-caps font-bold text-on-surface-variant/40 tracking-widest uppercase shrink-0"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
