import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Clock, Wifi } from "lucide-react";
import { useFocusSession } from "../hooks/useFocusSession";
import { PresenceDot } from "../components/ui/PresenceDot";

// ─── Mock room members ─────────────────────────────────────────────────────────

const ROOM_MEMBERS = [
  { id: "1", name: "Priya Sharma", initials: "PS", isOnline: true, sessionTime: "47:22" },
  { id: "2", name: "Alex Chen", initials: "AC", isOnline: true, sessionTime: "38:10" },
  { id: "3", name: "You", initials: "ME", isOnline: true, sessionTime: null, isCurrentUser: true },
  { id: "4", name: "Ravi Kumar", initials: "RK", isOnline: false, sessionTime: null },
  { id: "5", name: "Anjali Patel", initials: "AP", isOnline: true, sessionTime: "12:44" },
  { id: "6", name: "Sam Wilson", initials: "SW", isOnline: true, sessionTime: "01:58" },
];

// ─── Member Tile ──────────────────────────────────────────────────────────────

function MemberTile({
  member,
  index,
}: {
  member: (typeof ROOM_MEMBERS)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={`glass-card rounded-2xl p-5 flex flex-col items-center gap-3 text-center
        ${member.isCurrentUser ? "border-primary/40 bg-primary-container/5" : ""}
        ${!member.isOnline ? "opacity-40" : ""}`}
    >
      <div className="relative">
        <div
          className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-lg font-bold
            ${member.isCurrentUser
              ? "border-primary bg-primary-container/20 text-primary"
              : "border-white/10 bg-surface-container-high text-on-surface-variant"
            }`}
        >
          {member.initials}
        </div>
        <PresenceDot
          status={member.isOnline ? "online" : "offline"}
          className="absolute -bottom-0.5 -right-0.5"
        />
        {member.isOnline && member.sessionTime && (
          <div className="absolute -top-1 -right-2 px-1.5 py-0.5 bg-surface-container-highest rounded-full">
            <span className="text-[9px] font-mono font-bold text-secondary-fixed-dim tabular-nums">
              {member.sessionTime}
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold text-on-surface">{member.name}</p>
        <p className="text-[10px] text-on-surface-variant">
          {member.isCurrentUser ? "You" : member.isOnline ? "Studying" : "Away"}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function StudyRoom() {
  const { id = "1" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { secondsLeft, isActive, mode } = useFocusSession();
  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");
  const timeDisplay = `${mm}:${ss}`;

  const onlineCount = ROOM_MEMBERS.filter((m) => m.isOnline).length;

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(`/groups/${id}`)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={18} />
          Back to Group
        </motion.button>

        <div className="flex items-center gap-2">
          <Wifi size={14} className="text-secondary-fixed-dim animate-pulse" />
          <span className="text-xs font-bold text-secondary-fixed-dim uppercase tracking-wider">Live Room</span>
        </div>
      </div>

      {/* Shared Timer Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl p-8 mb-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-container/10 via-transparent to-transparent pointer-events-none" />

        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-3">
          {mode === "study" ? "Group Focus Session" : "Break Time"}
        </p>
        <h2 className="font-mono text-6xl font-bold tabular-nums text-on-surface mb-2">
          {timeDisplay}
        </h2>
        <p className="text-body-sm text-on-surface-variant">
          {isActive ? "Session in progress" : "Timer paused"}
        </p>

        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Users size={14} />
            <span className="text-sm">{onlineCount} studying now</span>
          </div>
          <div className="w-1 h-1 bg-on-surface-variant/30 rounded-full" />
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Clock size={14} />
            <span className="text-sm">Shared session</span>
          </div>
        </div>
      </motion.div>

      {/* Members Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6"
      >
        <h2 className="font-bold text-on-surface mb-5 flex items-center gap-2">
          <Users size={16} className="text-primary" />
          Room Members
          <span className="px-2 py-0.5 bg-secondary-fixed-dim/20 text-secondary-fixed-dim text-[10px] font-bold rounded-full ml-1">
            {onlineCount} online
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {ROOM_MEMBERS.map((member, i) => (
            <MemberTile key={member.id} member={member} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
