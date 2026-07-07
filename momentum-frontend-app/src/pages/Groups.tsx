import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Users, TrendingUp, Lock, Globe, MoreVertical } from "lucide-react";
import { useMyGroupsQuery, useDiscoverGroupsQuery, type Group } from "../hooks/useGroupsData";
import { CreateJoinGroupModal } from "../components/CreateJoinGroupModal";
import { useNavigate } from "react-router-dom";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function GroupCardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-6 flex flex-col gap-6 animate-pulse">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-3 w-12 bg-surface-container-highest rounded-full" />
          <div className="h-5 w-3/4 bg-surface-container-highest rounded-lg" />
          <div className="h-3 w-full bg-surface-container-highest rounded-lg" />
        </div>
        <div className="w-8 h-8 bg-surface-container-highest rounded-lg" />
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-14 bg-surface-container-highest rounded-full" />
        ))}
      </div>
      <div className="flex justify-between mt-auto items-center">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-surface-container-highest" />
          ))}
        </div>
        <div className="h-3 w-24 bg-surface-container-highest rounded-full" />
      </div>
      <div className="pt-4 border-t border-white/5">
        <div className="h-12 w-full bg-surface-container-highest/50 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Sparkline SVG ────────────────────────────────────────────────────────────

function Sparkline({ data, color = "#00E676" }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 100;
  const height = 20;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg className="w-full h-12 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
      <path
        d={`M${points.join(" L")}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="sparkline-path"
      />
    </svg>
  );
}

// ─── Member Avatars Strip ─────────────────────────────────────────────────────

function MemberAvatars({ members, extra }: { members: { initials: string; avatar?: string }[]; extra?: number }) {
  const shown = members.slice(0, 3);
  return (
    <div className="flex -space-x-2">
      {shown.map((m, i) => (
        <div
          key={i}
          className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-surface-container-high flex items-center justify-center"
        >
          {m.avatar ? (
            <img src={m.avatar} alt={m.initials} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-bold text-on-surface-variant">{m.initials}</span>
          )}
        </div>
      ))}
      {extra && extra > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-background bg-primary-container/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary">+{extra}</span>
        </div>
      )}
    </div>
  );
}

// ─── Group Card ───────────────────────────────────────────────────────────────

interface GroupCardProps {
  group: Group;
  index: number;
}

export function GroupCard({ group, index }: GroupCardProps) {
  const navigate = useNavigate();
  const extraMembers = group.memberCount - Math.min(group.members.length, 3);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(`/groups/${group.id}`)}
      className="glass-card rounded-xl p-6 flex flex-col gap-6 cursor-pointer
                 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(108,92,231,0.12)]
                 transition-all duration-300 ease-out group"
      role="article"
      aria-label={`Study group: ${group.name}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1.5 flex-1 pr-2">
          {group.isAdmin && (
            <span className="px-2.5 py-0.5 border border-primary/30 text-[9px] font-bold text-primary rounded-full w-fit uppercase tracking-wider">
              Admin
            </span>
          )}
          <h3 className="font-headline-md text-[18px] font-bold text-on-surface group-hover:text-primary transition-colors leading-tight">
            {group.name}
          </h3>
          {group.description && (
            <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{group.description}</p>
          )}
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
          aria-label="Group options"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {group.tags && group.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {group.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 bg-surface-container-high text-[9px] font-bold text-on-surface-variant rounded-full uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4 mt-auto">
        <div className="flex justify-between items-center">
          <MemberAvatars members={group.members} extra={extraMembers > 0 ? extraMembers : undefined} />
          <div className="flex items-center gap-2 text-on-surface-variant text-xs">
            <Users size={13} />
            <span className="tabular-nums font-medium">{group.activeMembers} Active</span>
            {group.privacy === "private" ? <Lock size={11} className="opacity-60" /> : <Globe size={11} className="opacity-60" />}
          </div>
        </div>

        <div className="pt-3 border-t border-white/5">
          {group.activityTrend && (
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/70">Activity Trend</span>
              <span className="text-[9px] font-bold text-signal-green flex items-center gap-0.5">
                <TrendingUp size={9} />
                {group.activityTrend}
              </span>
            </div>
          )}
          <Sparkline data={group.activityData} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Discover Card ────────────────────────────────────────────────────────────

export function DiscoverCard({ onDiscover }: { onDiscover: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      onClick={onDiscover}
      className="glass-card rounded-xl border-dashed border-white/10 bg-transparent p-6 
                 flex flex-col items-center justify-center gap-4 group cursor-pointer 
                 hover:border-primary/40 transition-all duration-300 min-h-[240px] w-full text-left"
      aria-label="Discover more groups"
    >
      <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
        <Globe size={22} />
      </div>
      <div className="text-center">
        <h4 className="font-bold text-on-surface text-sm">Discover more groups</h4>
        <p className="text-xs text-on-surface-variant mt-1">Find peers studying your subjects</p>
      </div>
    </motion.button>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

type Tab = "mine" | "discover";

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "mine", label: "My Groups" },
    { id: "discover", label: "Discover" },
  ];

  return (
    <div className="flex gap-1 p-1 bg-surface-container-high rounded-xl w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-5 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 ${
            active === tab.id
              ? "text-on-surface"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          {active === tab.id && (
            <motion.div
              layoutId="groups-tab-indicator"
              className="absolute inset-0 bg-surface-container-highest rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Main Groups Page ──────────────────────────────────────────────────────────

export function Groups() {
  const [tab, setTab] = useState<Tab>("mine");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDefaultTab, setModalDefaultTab] = useState<"create" | "join">("create");
  const [search, setSearch] = useState("");

  const myGroupsQ = useMyGroupsQuery();
  const discoverQ = useDiscoverGroupsQuery();
  const navigate = useNavigate();

  const activeQuery = tab === "mine" ? myGroupsQ : discoverQ;
  const groups = activeQuery.data ?? [];

  const filtered = groups.filter((g) =>
    search ? g.name.toLowerCase().includes(search.toLowerCase()) || g.subject.toLowerCase().includes(search.toLowerCase()) : true
  );

  const handleOpenModal = (defaultTab: "create" | "join") => {
    setModalDefaultTab(defaultTab);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h1 className="font-headline-lg text-headline-lg font-extrabold tracking-tight">
            {tab === "mine" ? "Your Groups" : "Discover Groups"}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">
            {tab === "mine"
              ? "Manage your academic circles and collaborative streaks."
              : "Find peers studying your subjects."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="flex items-center gap-3 flex-wrap"
        >
          <button
            onClick={() => handleOpenModal("join")}
            className="px-5 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl border border-white/5 
                       hover:bg-surface-container-highest transition-all active:scale-[0.98] text-xs"
          >
            Join with code
          </button>
          <button
            onClick={() => handleOpenModal("create")}
            className="px-5 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl 
                       shadow-lg shadow-primary-container/15 hover:brightness-110 transition-all 
                       active:scale-[0.98] flex items-center gap-2 text-xs"
          >
            <Plus size={14} />
            Create Group
          </button>
        </motion.div>
      </section>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <TabBar active={tab} onChange={setTab} />
        <div className="flex items-center gap-2.5 bg-surface-container-high px-4 py-2.5 rounded-xl border border-white/5 flex-1 max-w-sm">
          <Search size={15} className="text-on-surface-variant shrink-0" />
          <input
            type="text"
            placeholder="Search groups by name or subject…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-xs text-on-surface w-full placeholder:text-on-surface-variant/40 outline-none"
          />
        </div>
      </div>

      {/* Grid Content */}
      <div className="min-h-[400px]">
        {activeQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <GroupCardSkeleton key={i} />
            ))}
          </div>
        ) : activeQuery.isError ? (
          <div className="glass-card rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <p className="text-sm text-error font-medium">Failed to load study groups.</p>
            <button
              onClick={() => activeQuery.refetch()}
              className="px-4 py-2 bg-surface-container-high text-xs font-bold rounded-lg border border-white/5"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-16 text-center flex flex-col items-center justify-center gap-3">
            <h3 className="font-bold text-on-surface">No groups match your criteria</h3>
            <p className="text-xs text-on-surface-variant max-w-md">
              {tab === "mine"
                ? "You haven't joined or created any groups under this query. Get started by creating one!"
                : "Try searching other topics or disciplines."}
            </p>
            {tab === "mine" && (
              <button
                onClick={() => handleOpenModal("create")}
                className="mt-3 px-5 py-2.5 bg-primary-container text-on-primary-container font-bold rounded-xl text-xs hover:brightness-110 transition-all"
              >
                Create Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <AnimatePresence mode="popLayout">
              {filtered.map((group, i) => (
                <GroupCard key={group.id} group={group} index={i} />
              ))}
            </AnimatePresence>
            {tab === "mine" && (
              <DiscoverCard onDiscover={() => setTab("discover")} />
            )}
          </div>
        )}
      </div>

      {/* Create/Join Dialog */}
      <CreateJoinGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultTab={modalDefaultTab}
      />
    </div>
  );
}
