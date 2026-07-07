import React from "react";
import { Navbar } from "../../components/layout/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Testimonials } from "./components/Testimonials";
import { Pricing } from "./components/Pricing";
import { FAQ } from "./components/FAQ";
import { CTA } from "./components/CTA";

/**
 * Landing page — public route "/"
 *
 * Structure:
 *   Navbar
 *   main:
 *     Hero          (headline + ticker + CTAs)
 *     Features      (social proof marquee + dashboard preview + 3-col features)
 *     Testimonials  (3 student testimonial cards)
 *     Pricing       (3-tier plan table)
 *     FAQ           (accordion)
 *     CTA           ("Ready for takeoff?" section)
 *   Footer
 *
 * Accessibility:
 *   - Single <main> landmark
 *   - Each section has aria-label or aria-labelledby
 *   - Prefers-reduced-motion respected by Framer Motion's global setting in MotionProvider
 *   - Focus visible ring on all interactive elements
 *   - Sufficient colour contrast (primary #c6bfff on #0A0A0D — 8.5:1)
 */
export const Landing: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-white"
      data-page="landing"
    >
      {/* Fixed grain texture overlay */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <Navbar />

      <main id="main-content">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      {/* Footer — exact match to Stitch mockup: bg-surface-dim (#121319), border-t border-white/5 */}
      <footer
        className="bg-surface border-t border-white/5 px-[16px] md:px-[48px] py-12 text-left"
        aria-label="Site footer"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <div className="text-[20px] font-bold tracking-[-0.01em] text-on-surface mb-4">Momentum</div>
            <p className="text-[14px] leading-[1.5] text-on-surface-variant">
              High-performance study ecosystem for the digital age. Engineered for concentration and growth.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            {[
              { title: "Product", links: ["Features", "Dashboard", "Rooms"] },
              { title: "Legal", links: ["Privacy", "Terms", "Safety"] },
              { title: "Connect", links: ["Twitter", "Discord", "Changelog"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[12px] font-bold tracking-[0.05em] text-on-surface mb-6 uppercase">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[14px] text-on-surface-variant hover:text-primary transition-colors duration-200"
                        onClick={(e) => e.preventDefault()}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant/40 uppercase">
            © 2024 MOMENTUM PRODUCTIVITY. ENGINEERED FOR PERFORMANCE.
          </div>
          <div className="flex gap-6">
            <span className="text-[12px] font-semibold tracking-[0.05em] text-on-surface-variant/40 uppercase">
              v2.4.0-STABLE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
