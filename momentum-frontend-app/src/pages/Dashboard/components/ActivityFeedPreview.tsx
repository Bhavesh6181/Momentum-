import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useActivitiesQuery } from "../../../hooks/useDashboardData";
import { Skeleton } from "../../../components/ui/Skeleton";
import { Activity as ActivityIcon, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

export const ActivityFeedPreview: React.FC = () => {
  const { data: activities, isLoading, refetch, isFetching } = useActivitiesQuery();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-surface/50 p-4 flex items-center gap-4">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.08] bg-surface overflow-hidden text-left">
      {/* Collapsed header */}
      <button
        onClick={() => setIsExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-container-high transition-colors duration-200 group"
      >
        <div className="flex items-center gap-3">
          <ActivityIcon size={15} className="text-primary-container" />
          <span className="text-[13px] font-semibold text-on-surface">Recent Activity</span>
          <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
            {activities?.length ?? 0} events
          </span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant/60 group-hover:text-on-surface-variant transition-colors">
          {isExpanded && (
            <button
              onClick={(e) => { e.stopPropagation(); refetch(); }}
              disabled={isFetching}
              className="text-primary text-[11px] font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
            >
              {isFetching ? "Refreshing..." : "Refresh"}
            </button>
          )}
          <span className="text-[11px] font-medium">{isExpanded ? "Collapse" : "Expand"}</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded feed */}
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
              <div className="space-y-3 mt-3">
                {activities?.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3.5 text-[13px]">
                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant shrink-0 mt-0.5">
                      <MessageSquare size={11} />
                    </div>
                    <div className="flex-1 leading-relaxed">
                      <span className="font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer mr-1">
                        {activity.username}
                      </span>
                      <span className="text-on-surface-variant/80">{activity.action}</span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant/50 shrink-0 font-medium self-center">
                      {activity.time}
                    </span>
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
