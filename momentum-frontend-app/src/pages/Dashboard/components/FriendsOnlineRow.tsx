import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFriendsQuery } from "../../../hooks/useDashboardData";
import { Skeleton } from "../../../components/ui/Skeleton";
import { PresenceDot } from "../../../components/ui/PresenceDot";
import { ChevronDown, ChevronUp, Users } from "lucide-react";

export const FriendsOnlineRow: React.FC = () => {
  const { data: friends, isLoading } = useFriendsQuery();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-surface/50 p-4 flex items-center gap-4">
        <Skeleton className="h-4 w-40" />
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-7 rounded-full" />)}
        </div>
      </div>
    );
  }

  const studyingCount = friends?.filter(f => f.status === "studying").length ?? 0;

  return (
    <div className="rounded-xl border border-white/[0.08] bg-surface overflow-hidden transition-all duration-300 text-left">
      {/* Collapsed header  always visible */}
      <button
        onClick={() => setIsExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-container-high transition-colors duration-200 group"
      >
        <div className="flex items-center gap-3">
          <Users size={15} className="text-on-surface-variant/70" />
          <span className="text-[13px] font-semibold text-on-surface">
            Friends Studying
          </span>
          <span className="text-[11px] font-bold text-secondary-fixed-dim bg-secondary-fixed/10 border border-secondary-fixed/20 px-2 py-0.5 rounded-full">
            {studyingCount} active
          </span>
          {/* Stacked avatar preview */}
          {!isExpanded && (
            <div className="flex -space-x-2 ml-1">
              {friends?.slice(0, 3).map((friend) => (
                <img
                  key={friend.name}
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-6 h-6 rounded-full border-2 border-surface object-cover"
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-on-surface-variant/60 group-hover:text-on-surface-variant transition-colors">
          <span className="text-[11px] font-medium">{isExpanded ? "Collapse" : "Expand"}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded friend list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1 border-t border-white/5">
              <div className="flex flex-wrap gap-3 mt-3">
                {friends?.map((friend) => (
                  <div
                    key={friend.name}
                    className="flex items-center gap-3 p-2.5 bg-surface-container-low hover:bg-surface-container-high rounded-xl transition-all duration-300 w-full sm:w-56 cursor-pointer border border-white/5 hover:border-white/10 hover:-translate-y-px"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                      <PresenceDot
                        status={friend.status}
                        className="absolute bottom-0 right-0 border-2 border-surface-container-low scale-110"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-semibold text-on-surface truncate">{friend.name}</span>
                      <span className="text-[11px] text-secondary-fixed-dim font-medium flex items-center gap-1 mt-0.5">
                        Focusing · {friend.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
