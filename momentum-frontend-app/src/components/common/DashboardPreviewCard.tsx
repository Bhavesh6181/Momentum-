import React from "react";

export const DashboardPreviewCard: React.FC = () => {
  return (
    <div className="glow-card p-1 aspect-video relative group select-none">
      <div className="absolute inset-0 bg-primary-container/5 blur-3xl group-hover:bg-primary-container/10 transition-colors duration-700 pointer-events-none" />
      <div className="relative w-full h-full bg-surface-container-lowest border border-white/10 p-8 flex flex-col gap-6 overflow-hidden rounded-xl">
        {/* Abstract Dashboard Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl" />
            <div>
              <div className="w-32 h-4 bg-white/10 mb-2 rounded" />
              <div className="w-24 h-2 bg-white/5 rounded" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full border border-signal-green flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-green animate-pulse-ring" />
            </div>
            <div className="w-24 h-8 bg-white/5 border border-white/10 rounded-lg" />
          </div>
        </div>

        {/* Abstract Dashboard Grid Content */}
        <div className="grid grid-cols-3 gap-4 h-full">
          <div className="col-span-2 border border-white/10 bg-white/5 p-4 flex flex-col gap-4 rounded-xl">
            <div className="w-full h-32 border-b border-white/10 flex items-end gap-1 px-4">
              {/* Abstract graph bars */}
              <div className="flex-1 bg-primary-container/20 h-[30%] rounded-t-sm" />
              <div className="flex-1 bg-primary-container/40 h-[60%] rounded-t-sm" />
              <div className="flex-1 bg-primary-container/60 h-[45%] rounded-t-sm" />
              <div className="flex-1 bg-primary-container/80 h-[90%] rounded-t-sm" />
              <div className="flex-1 bg-primary-container h-[70%] rounded-t-sm" />
            </div>
            <div className="space-y-3">
              <div className="w-full h-3 bg-white/10 rounded" />
              <div className="w-3/4 h-3 bg-white/10 rounded" />
              <div className="w-1/2 h-3 bg-white/10 rounded" />
            </div>
          </div>
          <div className="col-span-1 flex flex-col gap-4">
            <div className="flex-1 border border-white/10 bg-white/5 p-4 flex flex-col justify-center items-center gap-2 rounded-xl">
              <span className="text-stats-md text-signal-green font-mono">2h 45m</span>
              <span className="text-label-caps text-on-surface-variant font-bold">SESSION</span>
            </div>
            <div className="flex-1 border border-white/10 bg-white/5 p-4 flex flex-col justify-center items-center gap-2 rounded-xl">
              <span className="text-stats-md text-primary font-mono">14/20</span>
              <span className="text-label-caps text-on-surface-variant font-bold">TASKS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
