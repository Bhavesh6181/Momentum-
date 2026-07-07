import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Clock,
  Flame,
  Lock,
  Globe,
  Play,
  Check,
  Calendar,
  Trash2,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useGroupDetailQuery } from "../hooks/useGroupsData";
import { PresenceDot } from "../components/ui/PresenceDot";

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

function GroupDetailSkeleton() {
  return (
    <div className="animate-pulse max-w-4xl mx-auto pb-16">
      <div className="h-8 w-8 bg-surface-container-highest rounded-lg mb-8" />
      <div className="glass-card rounded-2xl p-8 mb-6">
        <div className="flex justify-between">
          <div className="flex-1">
            <div className="h-3 w-16 bg-surface-container-highest rounded-full mb-3" />
            <div className="h-8 w-2/3 bg-surface-container-highest rounded-xl mb-2" />
            <div className="h-4 w-full bg-surface-container-highest rounded-lg mb-6" />
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 w-24 bg-surface-container-highest rounded-xl" />)}
            </div>
          </div>
          <div className="w-32 h-32 bg-surface-container-highest rounded-2xl" />
        </div>
      </div>
      <div className="h-12 bg-surface-container-high rounded-xl mb-6" />
      <div className="glass-card rounded-2xl p-6 h-64 bg-surface-container-highest/20" />
    </div>
  );
}

// ─── Stat Chip ────────────────────────────────────────────────────────────────

function StatChip({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 bg-surface-container-high rounded-xl border border-white/5 min-w-[100px]">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="font-mono font-extrabold tabular-nums text-lg">{value}</span>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{label}</span>
    </div>
  );
}

// ─── Tabs List ────────────────────────────────────────────────────────────────

type GroupTab = "overview" | "activity" | "leaderboard" | "challenges" | "settings";

interface TabItem {
  id: GroupTab;
  label: string;
}

const TABS: TabItem[] = [
  { id: "overview", label: "Overview" },
  { id: "activity", label: "Activity" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "challenges", label: "Challenges" },
  { id: "settings", label: "Settings" },
];

export function GroupDetail() {
  const { id = "1" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: group, isLoading, refetch } = useGroupDetailQuery(id);
  const [activeTab, setActiveTab] = useState<GroupTab>("overview");

  // Settings State Form
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrivacy, setEditPrivacy] = useState<"public" | "private">("private");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize settings once data loads
  React.useEffect(() => {
    if (group) {
      setEditName(group.name);
      setEditSubject(group.subject);
      setEditDesc(group.description || "");
      setEditPrivacy(group.privacy);
    }
  }, [group]);

  if (isLoading || !group) return <GroupDetailSkeleton />;

  // Handle settings form save (simulate in-memory save)
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (group) {
      group.name = editName;
      group.subject = editSubject;
      group.description = editDesc;
      group.privacy = editPrivacy;
      setSaveSuccess(true);
      refetch();
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div className="pb-16 max-w-4xl mx-auto">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/groups")}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 text-sm font-semibold"
        aria-label="Back to groups"
      >
        <ArrowLeft size={18} />
        Back to Groups
      </motion.button>

      {/* Hero Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-card rounded-2xl p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {group.isAdmin && (
                <span className="px-2.5 py-0.5 border border-primary/30 text-[9px] font-bold text-primary rounded-full uppercase tracking-wider">
                  Admin
                </span>
              )}
              {group.privacy === "private" ? (
                <Lock size={13} className="text-on-surface-variant" />
              ) : (
                <Globe size={13} className="text-on-surface-variant" />
              )}
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                {group.subject}
              </span>
            </div>

            <h1 className="font-headline-lg text-headline-lg font-extrabold tracking-tight mb-2">
              {group.name}
            </h1>
            {group.description && (
              <p className="text-on-surface-variant text-sm max-w-2xl">{group.description}</p>
            )}

            {/* Core Stats */}
            <div className="flex flex-wrap gap-3 mt-6">
              <StatChip icon={<Users size={16} />} value={`${group.memberCount}`} label="Members" />
              <StatChip icon={<Clock size={16} />} value={`${group.weeklyHours ?? 0}h`} label="This Week" />
              <StatChip icon={<Flame size={16} />} value={`${group.streak ?? 0}d`} label="Streak" />
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col gap-3 shrink-0 justify-start md:justify-center">
            <button
              onClick={() => navigate(`/groups/room/${id}`)}
              className="px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl 
                         hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-container/10"
            >
              <Play size={15} fill="currentColor" />
              Enter Study Room
            </button>
            <div className="text-center">
              <span className="text-[10px] font-mono tracking-wider text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-white/5">
                CODE: <span className="font-bold text-primary">{group.inviteCode || "N/A"}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-6 pt-6 border-t border-white/5">
            {group.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-surface-container-high text-[10px] font-bold text-on-surface-variant rounded-full uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Underlined Navigation Tabs */}
      <div className="border-b border-white/10 mb-6 flex relative overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 text-sm font-bold relative transition-all focus:outline-none shrink-0 ${
              activeTab === tab.id ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="group-detail-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: "spring", stiffness: 355, damping: 28 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[300px]">
        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Members Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-on-surface mb-5 flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Members List
                <span className="text-on-surface-variant font-normal text-xs">({group.members.length})</span>
              </h2>
              <div className="flex flex-col gap-4">
                {group.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-primary-container/15 flex items-center justify-center border border-white/10">
                          <span className="text-xs font-bold text-primary">{member.initials}</span>
                        </div>
                        <PresenceDot status={member.isOnline ? "online" : "offline"} className="absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">{member.name}</p>
                        <p className="text-[10px] text-on-surface-variant">
                          {member.isOnline ? "Studying now" : "Offline"}
                        </p>
                      </div>
                    </div>
                    {member.focusTime && (
                      <span className="text-xs font-mono text-secondary-fixed-dim font-bold">{member.focusTime}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Goals/Progress Section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-on-surface mb-5 flex items-center gap-2">
                <Flame size={16} className="text-signal-green" />
                Active Goals
              </h2>
              <div className="flex flex-col gap-5">
                {[
                  { label: "Weekly study hours target", target: 40, current: group.weeklyHours ?? 0 },
                  { label: "Daily study streak", target: 30, current: group.streak ?? 0 },
                  { label: "Collaborative cycles complete", target: 15, current: 8 },
                ].map((goal, index) => {
                  const pct = Math.min((goal.current / goal.target) * 100, 100);
                  return (
                    <div key={index} className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-on-surface-variant font-medium">{goal.label}</span>
                        <span className="font-mono font-bold text-on-surface">
                          {goal.current}/{goal.target}
                        </span>
                      </div>
                      <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ delay: 0.1, duration: 0.5 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ACTIVITY PANEL */}
        {activeTab === "activity" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 flex flex-col gap-5"
          >
            <h2 className="font-bold text-on-surface mb-3 flex items-center gap-2">
              Recent Circle Logs
            </h2>
            {group.activities && group.activities.length > 0 ? (
              <div className="relative border-l border-white/10 pl-6 ml-3 flex flex-col gap-6">
                {group.activities.map((act) => (
                  <div key={act.id} className="relative">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-on-surface-variant leading-relaxed">
                        <span className="font-semibold text-on-surface">{act.userName}</span> {act.action}
                      </p>
                      <span className="text-[10px] text-on-surface-variant/60 font-medium">{act.timeAgo}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant text-center py-6">No recent group activity logs found.</p>
            )}
          </motion.div>
        )}

        {/* LEADERBOARD PANEL */}
        {activeTab === "leaderboard" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="font-bold text-on-surface mb-5 flex items-center gap-2">
              Weekly Study Rankings
            </h2>
            <div className="flex flex-col gap-4">
              {group.members
                .map((m, i) => ({ ...m, mockHours: 24 - i * 6 })) // mock ranked hours
                .sort((a, b) => b.mockHours - a.mockHours)
                .map((user, idx) => {
                  const maxHours = 24;
                  const ratio = Math.min((user.mockHours / maxHours) * 100, 100);
                  const isTopThree = idx < 3;
                  const medalColors = ["text-yellow-400 border-yellow-400/20 bg-yellow-400/5", "text-slate-300 border-slate-300/20 bg-slate-300/5", "text-amber-600 border-amber-600/20 bg-amber-600/5"];
                  
                  return (
                    <div key={user.id} className="flex items-center gap-4 py-2 border-b border-white/5 last:border-b-0">
                      {/* Rank Indicator */}
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-sm shrink-0 ${
                        isTopThree ? medalColors[idx] : "text-on-surface-variant border-white/5"
                      }`}>
                        {idx + 1}
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center border border-white/5">
                          <span className="text-[10px] font-bold text-on-surface">{user.initials}</span>
                        </div>
                        <span className="text-xs font-semibold text-on-surface w-24 sm:w-36 truncate">{user.name}</span>
                      </div>

                      {/* Progress Bar representation */}
                      <div className="flex-1 hidden sm:block h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${ratio}%` }}
                          transition={{ delay: 0.1, duration: 0.4 }}
                          className={`h-full rounded-full ${idx === 0 ? "bg-primary" : "bg-on-surface-variant/40"}`}
                        />
                      </div>

                      {/* Hours */}
                      <span className="text-xs font-mono font-bold text-on-surface shrink-0 ml-auto tabular-nums">
                        {user.mockHours} hrs
                      </span>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* CHALLENGES PANEL */}
        {activeTab === "challenges" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {group.challenges && group.challenges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {group.challenges.map((c) => {
                  const pct = Math.min((c.currentHours / c.targetHours) * 100, 100);
                  return (
                    <div key={c.id} className="glass-card rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                      <div>
                        <h3 className="font-bold text-on-surface text-base">{c.title}</h3>
                        <p className="text-xs text-on-surface-variant mt-1">{c.description}</p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-on-surface-variant">Progress</span>
                          <span className="text-on-surface font-mono font-bold tabular-nums">
                            {c.currentHours} / {c.targetHours}
                          </span>
                        </div>
                        <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant mt-2 pt-3 border-t border-white/5">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {c.daysLeft} days left
                        </span>
                        <span>{c.participants} active</span>
                      </div>

                      {c.isJoined ? (
                        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-signal-green/10 border border-signal-green/20 text-signal-green text-[9px] font-bold uppercase tracking-wider">
                          <Check size={9} />
                          Active
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            c.isJoined = true;
                            c.participants += 1;
                            refetch();
                          }}
                          className="mt-2 w-full py-2.5 bg-primary-container text-on-primary-container font-bold rounded-xl text-xs hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                        >
                          Join Challenge
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant text-center py-12 glass-card rounded-2xl">No active challenges for this group.</p>
            )}
          </motion.div>
        )}

        {/* SETTINGS PANEL */}
        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-8 max-w-2xl mx-auto"
          >
            <h2 className="font-bold text-on-surface mb-6 flex items-center gap-2">
              Group Administration
            </h2>
            <form onSubmit={handleSaveSettings} className="flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Group Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-high border border-white/10 rounded-xl text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Subject</label>
                <input
                  type="text"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-high border border-white/10 rounded-xl text-on-surface text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-high border border-white/10 rounded-xl text-on-surface text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* Privacy */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Privacy Setting</span>
                <div className="grid grid-cols-2 gap-3">
                  {(["private", "public"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditPrivacy(p)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-semibold
                        ${editPrivacy === p
                          ? "border-primary bg-primary-container/15 text-primary"
                          : "border-white/10 bg-surface-container-high text-on-surface-variant hover:border-white/20"
                        }`}
                    >
                      {p === "private" ? <Lock size={16} /> : <Globe size={16} />}
                      <span className="capitalize">{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              {saveSuccess && (
                <p className="text-signal-green text-xs font-bold text-center">Settings saved successfully!</p>
              )}

              {/* Submit / Destructive buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl text-xs hover:brightness-110 active:scale-[0.98] transition-all flex-1"
                >
                  Save Modifications
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to leave this group?")) {
                      navigate("/groups");
                    }
                  }}
                  className="px-6 py-3 border border-error/30 text-error hover:bg-error-container/10 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  Leave Group
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
