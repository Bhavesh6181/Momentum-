import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Zap, User, ArrowRight, X } from "lucide-react";
import { useSearchStore } from "../store/searchStore";

// ─── Search Results Dataset ───────────────────────────────────────────────────

interface SearchResult {
  id: string;
  type: "person" | "group" | "challenge";
  title: string;
  subtitle: string;
  route: string;
}

const SEARCH_ITEMS: SearchResult[] = [
  { id: "p1", type: "person", title: "Priya Sharma", subtitle: "IIT Bombay • Physics", route: "/profile" },
  { id: "p2", type: "person", title: "Alex Chen", subtitle: "NIT Trichy • CS", route: "/profile" },
  { id: "p3", type: "person", title: "Anjali Patel", subtitle: "BITS Pilani • Math", route: "/profile" },
  { id: "g1", type: "group", title: "Quantum Physics II", subtitle: "15 members • Private", route: "/groups/1" },
  { id: "g2", type: "group", title: "Advanced Algorithms Study Collective", subtitle: "10 members • Public", route: "/groups/2" },
  { id: "g3", type: "group", title: "Machine Learning Research Circle", subtitle: "42 members • Public", route: "/groups/d1" },
  { id: "c1", type: "challenge", title: "30-Day Code Marathon", subtitle: "342 participants • Hard", route: "/goals" },
  { id: "c2", type: "challenge", title: "Research Paper Sprint", subtitle: "128 participants • Medium", route: "/goals" },
];

const itemIcons: Record<SearchResult["type"], React.ReactNode> = {
  person: <User size={14} />,
  group: <Users size={14} />,
  challenge: <Zap size={14} />,
};

const itemColors: Record<SearchResult["type"], string> = {
  person: "text-primary bg-primary-container/20 border border-primary/20",
  group: "text-secondary-fixed-dim bg-secondary-fixed-dim/10 border border-secondary-fixed-dim/20",
  challenge: "text-tertiary bg-tertiary/10 border border-tertiary/20",
};

const typeLabels: Record<SearchResult["type"], string> = {
  person: "People",
  group: "Study Groups",
  challenge: "Goals & Challenges",
};

// ─── Real Substring Highlight Component ────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span className="text-on-surface">{text}</span>;

  // Escape special regex characters
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <span className="text-on-surface">
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-primary/30 text-primary font-bold rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

// ─── CommandPalette ────────────────────────────────────────────────────────────

export const CommandPalette: React.FC = () => {
  const { open, closeSearch } = useSearchStore();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when palette opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global Ctrl/Cmd + K listener
  useEffect(() => {
    const handleKeyDownGlobal = (e: KeyboardEvent) => {
      const isK = e.key === "k" || e.key === "K";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        useSearchStore.getState().toggleSearch();
      }
      if (e.key === "Escape" && open) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDownGlobal);
    return () => window.removeEventListener("keydown", handleKeyDownGlobal);
  }, [open, closeSearch]);

  // Filter items based on query
  const filteredResults = query.trim()
    ? SEARCH_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_ITEMS.slice(0, 6);

  // Grouped results
  const groupedResults = filteredResults.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<SearchResult["type"], SearchResult[]>);

  // Flattened array to manage ArrowKey indexing
  const flatItems = Object.values(groupedResults).flat();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (flatItems.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flatItems.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      } else if (e.key === "Enter" && flatItems[activeIndex]) {
        e.preventDefault();
        navigate(flatItems[activeIndex].route);
        closeSearch();
      }
    },
    [flatItems, activeIndex, navigate, closeSearch]
  );

  const handleItemClick = (route: string) => {
    navigate(route);
    closeSearch();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSearch}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          />

          {/* Palette Dialog */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -15 }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette search"
              className="glass-card rounded-2xl w-full max-w-xl overflow-hidden pointer-events-auto shadow-2xl border border-white/10"
            >
              {/* Input section */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
                <Search size={18} className="text-on-surface-variant shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search people, study groups, goals…"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant/40"
                  aria-label="Search query"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setActiveIndex(0);
                    }}
                    className="text-on-surface-variant hover:text-on-surface transition-colors"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-surface-container-highest rounded text-[10px] font-mono text-on-surface-variant border border-white/5 shadow-sm">
                  Esc
                </kbd>
              </div>

              {/* Results List */}
              <div className="max-h-[45vh] overflow-y-auto py-2">
                {flatItems.length === 0 ? (
                  <div className="text-center text-sm text-on-surface-variant py-10">
                    No matching results for "{query}"
                  </div>
                ) : (
                  (["person", "group", "challenge"] as const).map((type) => {
                    const items = groupedResults[type];
                    if (!items || items.length === 0) return null;

                    return (
                      <div key={type} className="mb-2">
                        <p className="px-5 py-2 text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/50 text-left">
                          {typeLabels[type]}
                        </p>
                        {items.map((item) => {
                          const flatIdx = flatItems.indexOf(item);
                          const isSelected = flatIdx === activeIndex;

                          return (
                            <button
                              key={item.id}
                              onClick={() => handleItemClick(item.route)}
                              onMouseEnter={() => setActiveIndex(flatIdx)}
                              className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors focus:outline-none
                                ${isSelected ? "bg-surface-container-high" : "hover:bg-surface-container-high/40"}`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${itemColors[item.type]}`}>
                                {itemIcons[item.type]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">
                                  <Highlight text={item.title} query={query} />
                                </p>
                                <p className="text-xs text-on-surface-variant truncate mt-0.5">
                                  <Highlight text={item.subtitle} query={query} />
                                </p>
                              </div>
                              <ArrowRight
                                size={14}
                                className={`text-primary transition-all duration-200 ${
                                  isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Instructions footer */}
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/5 text-[9px] font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container-high/20">
                <span className="flex items-center gap-3">
                  <span>
                    <kbd className="font-mono bg-surface-container-highest px-1.5 py-0.5 rounded border border-white/5 mr-1 text-[10px]">↑↓</kbd>
                    Navigate
                  </span>
                  <span>
                    <kbd className="font-mono bg-surface-container-highest px-1.5 py-0.5 rounded border border-white/5 mr-1 text-[10px]">Enter</kbd>
                    Open
                  </span>
                </span>
                <span className="font-mono normal-case text-on-surface-variant/70">
                  Ctrl+K to toggle
                </span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
