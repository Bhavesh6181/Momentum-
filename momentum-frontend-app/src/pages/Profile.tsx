import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ExternalLink, Edit2, Flame, Clock, Trophy, Star, Check, X, Camera } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/axios";
import { useAuthStore } from "../store/authStore";
import { cn } from "../lib/utils";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface UserProfile {
  name: string;
  username: string;
  college: string;
  branch: string;
  year: string;
  bio: string;
  avatar?: string;
  initials: string;
  totalHours: number;
  streak: number;
  rank: number;
  badges: { icon: string; label: string; color: string }[];
  socialLinks: { github?: string; linkedin?: string; portfolio?: string };
  goals: string[];
}

// ─── Query & Mutation hooks ───────────────────────────────────────────────────

export function useProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/users/me");
      const data = response.data?.data;
      if (!data) throw new Error("No profile data returned");
      
      const name = data.profile?.name || data.username || "User";
      const parts = name.trim().split(/\s+/);
      const initials = parts.map((p: string) => p[0]).join("").substring(0, 2).toUpperCase();

      const userProfile: UserProfile = {
        name: data.profile?.name || data.username,
        username: data.username,
        college: data.profile?.college || "Not specified",
        branch: data.profile?.branch || "Not specified",
        year: data.profile?.graduationYear ? `${data.profile.graduationYear} Grad` : "Not specified",
        bio: data.profile?.bio || "No bio yet. Write something about yourself!",
        avatar: data.profile?.profilePictureUrl || undefined,
        initials: initials,
        totalHours: data.stats?.studyHours || 0,
        streak: data.stats?.currentStreak || 0,
        rank: 4, // Mocked global rank
        badges: [
          { icon: "🔥", label: `${data.stats?.currentStreak || 0}-Day Streak`, color: "border-orange-400/40 bg-orange-400/10 text-orange-400" },
          { icon: "⚡", label: "Speed Learner", color: "border-yellow-400/40 bg-yellow-400/10 text-yellow-400" },
          { icon: "🎯", label: "Goal Crusher", color: "border-primary/40 bg-primary/10 text-primary" },
          { icon: "🏆", label: "Top 5 Global", color: "border-amber-400/40 bg-amber-400/10 text-amber-400" },
        ],
        socialLinks: {
          github: data.profile?.githubLink || undefined,
          linkedin: data.profile?.linkedinLink || undefined,
        },
        goals: data.profile?.targetCompany ? [`Target Company: ${data.profile.targetCompany}`, `Target Package: ${data.profile.targetPackage || 'Not set'} USD/Yr`] : [],
      };
      return userProfile;
    },
    staleTime: 5_000,
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updatedFields: Partial<UserProfile>) => {
      const requestData: any = {};
      if (updatedFields.bio !== undefined) requestData.bio = updatedFields.bio;
      if (updatedFields.name !== undefined) requestData.name = updatedFields.name;
      if (updatedFields.college !== undefined) requestData.college = updatedFields.college;
      if (updatedFields.branch !== undefined) requestData.branch = updatedFields.branch;

      const response = await api.put("/users/me", requestData);
      const data = response.data?.data;
      if (data) {
        useAuthStore.getState().updateUser({
          college: data.profile?.college || undefined,
          branch: data.profile?.branch || undefined,
          year: data.profile?.graduationYear?.toString() || undefined,
          avatarUrl: data.profile?.profilePictureUrl || undefined,
        });
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ─── Count-up Stat ─────────────────────────────────────────────────────────────

function CountUpStat({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = 0;
    if (start === target) return;
    const increment = Math.ceil(target / 15) || 1;
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        setVal(target);
        clearInterval(interval);
      } else {
        setVal(start);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [target]);

  return (
    <span className="font-mono font-extrabold text-xl sm:text-2xl tabular-nums text-on-surface">
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function Profile() {
  const { data: profile, isLoading } = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const bioInputRef = useRef<HTMLTextAreaElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleUploadPicture = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const formData = new FormData();
    formData.append("file", file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await api.post("/users/me/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || file.size;
          const progress = Math.round((progressEvent.loaded * 100) / total);
          setUploadProgress(progress);
        },
      });
      const returnedUrl = res.data?.data;
      if (returnedUrl) {
        useAuthStore.getState().updateUser({ avatarUrl: returnedUrl });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUploadPicture(file);
    }
  };

  // Sync bio input state when fetched
  useEffect(() => {
    if (profile) {
      setBioInput(profile.bio);
    }
  }, [profile]);

  const handleStartEditBio = () => {
    setIsEditingBio(true);
    setTimeout(() => {
      bioInputRef.current?.focus();
      bioInputRef.current?.select();
    }, 50);
  };

  const handleSaveBio = async () => {
    if (bioInput.trim() === profile?.bio) {
      setIsEditingBio(false);
      return;
    }
    await updateMutation.mutateAsync({ bio: bioInput.trim() });
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    if (profile) {
      setBioInput(profile.bio);
    }
    setIsEditingBio(false);
  };

  if (isLoading || !profile) {
    return (
      <div className="animate-pulse max-w-3xl mx-auto pb-16">
        <div className="glass-card rounded-2xl p-8 mb-6 h-64 bg-surface-container-highest/20" />
      </div>
    );
  }

  return (
    <div className="pb-16 max-w-3xl mx-auto">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass-card rounded-2xl p-6 sm:p-8 mb-6 border border-white/5 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col sm:flex-row gap-6 relative z-10">
          {/* Avatar initials/image circle */}
          <div
            className="relative shrink-0 mx-auto sm:mx-0 cursor-pointer group/avatar"
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 relative shadow-lg transition-all duration-300",
                isDragOver ? "border-primary bg-primary/10 scale-105" : "border-primary/30 bg-primary-container/20"
              )}
            >
              {isUploading ? (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-1">
                  <span className="text-[10px] font-bold text-primary">{uploadProgress}%</span>
                  <div className="w-12 h-1 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-3xl font-bold text-primary">{profile.initials}</span>
              )}

              {/* Hover camera overlay */}
              {!isUploading && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </div>
              )}
            </div>

            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary-fixed-dim border-2 border-background shadow-md flex items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-background">PRO</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUploadPicture(file);
              }}
            />
          </div>

          {/* Info segment */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
              <div>
                <h1 className="font-headline-md text-headline-md font-extrabold text-on-surface">{profile.name}</h1>
                <p className="text-xs text-on-surface-variant/80 font-semibold">@{profile.username}</p>
              </div>
              {!isEditingBio && (
                <button
                  onClick={handleStartEditBio}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-white/10 rounded-xl text-xs font-bold text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all active:scale-95"
                >
                  <Edit2 size={12} />
                  Edit Bio
                </button>
              )}
            </div>

            {/* Bio with Hover-to-edit field */}
            <div className="mt-4 relative group/bio">
              {isEditingBio ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    ref={bioInputRef}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    maxLength={150}
                    className="w-full bg-surface-container-high border border-white/15 px-3 py-2 rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancelBio}
                      className="p-1 border border-white/10 hover:border-error hover:text-error rounded-md transition-colors"
                      title="Cancel changes"
                    >
                      <X size={14} />
                    </button>
                    <button
                      onClick={handleSaveBio}
                      className="p-1 bg-primary text-background hover:brightness-110 rounded-md transition-colors"
                      title="Save changes"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleStartEditBio}
                  className="inline-block cursor-pointer hover:bg-white/5 rounded-lg px-2.5 py-1.5 -mx-2.5 transition-all text-xs sm:text-sm text-on-surface-variant/90 leading-relaxed text-left relative group-hover/bio:text-on-surface border border-transparent hover:border-white/5"
                  title="Click to edit bio"
                >
                  {profile.bio}
                  <Edit2
                    size={10}
                    className="inline-block ml-1.5 opacity-0 group-hover/bio:opacity-100 transition-opacity text-primary"
                  />
                </div>
              )}
            </div>

            {/* Meta details */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1.5 mt-4 text-xs font-semibold text-on-surface-variant">
              <span className="flex items-center gap-1.5">
                <User size={13} className="text-primary" />
                {profile.branch}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10 mt-1.5 hidden sm:inline-block" />
              <span>{profile.college}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/10 mt-1.5 hidden sm:inline-block" />
              <span>{profile.year}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Count-Up stats row */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
          {[
            { icon: <Clock size={16} />, component: <CountUpStat target={profile.totalHours} suffix="h" />, label: "Focus Hours" },
            { icon: <Flame size={16} />, component: <CountUpStat target={profile.streak} suffix="d" />, label: "Daily Streak" },
            { icon: <Trophy size={16} />, component: <CountUpStat target={profile.rank} prefix="#" />, label: "Global Rank" },
          ].map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="flex justify-center mb-1 text-primary">{stat.icon}</div>
              {stat.component}
              <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Social links row */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-white/5 relative z-10">
          {profile.socialLinks.github && (
            <a
              href={`https://${profile.socialLinks.github}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              <ExternalLink size={12} />
              <span>GitHub</span>
            </a>
          )}
          {profile.socialLinks.linkedin && (
            <a
              href={`https://${profile.socialLinks.linkedin}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              <ExternalLink size={12} />
              <span>LinkedIn</span>
            </a>
          )}
          {profile.socialLinks.portfolio && (
            <a
              href={`https://${profile.socialLinks.portfolio}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              <ExternalLink size={12} />
              <span>Portfolio</span>
            </a>
          )}
        </div>
      </motion.div>

      {/* Grid of Achievements & Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievements badges */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="glass-card rounded-2xl p-6 border border-white/5"
        >
          <h2 className="font-bold text-on-surface mb-5 flex items-center gap-2 text-left">
            <Star size={16} className="text-yellow-400" />
            Achievements
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {profile.badges.map((badge, i) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                className={`flex items-center gap-2 px-3 py-2.5 border rounded-xl text-xs font-bold ${badge.color}`}
              >
                <span className="text-base">{badge.icon}</span>
                <span>{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Current Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="glass-card rounded-2xl p-6 border border-white/5"
        >
          <h2 className="font-bold text-on-surface mb-5 flex items-center gap-2 text-left">
            <Flame size={16} className="text-primary" />
            Current Goal
          </h2>

          {profile.goals.length > 0 ? (
            <div className="flex flex-col gap-4 text-left">
              {/* Goal title */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Target</p>
                <p className="text-[18px] font-extrabold text-on-surface leading-tight">
                  {profile.goals[0]?.replace("Target Company: ", "") ?? "Set a goal"}
                </p>
                {profile.goals[1] && (
                  <p className="text-[12px] text-on-surface-variant mt-1">
                    {profile.goals[1]}
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Preparation Progress</p>
                  <span className="text-[12px] font-bold text-primary">68%</span>
                </div>
                <div className="h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "68%" }}
                    transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-primary to-primary-container rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-2">
                  {["DSA", "System Design", "Projects", "Mock"].map((step, i) => (
                    <div key={step} className="flex flex-col items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${i < 2 ? "bg-primary" : i === 2 ? "bg-primary/40" : "bg-white/10"}`} />
                      <span className="text-[9px] text-on-surface-variant font-medium">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next action */}
              <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3 flex items-start gap-3">
                <span className="text-primary text-base mt-0.5">→</span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-0.5">Next Action</p>
                  <p className="text-[13px] text-on-surface font-medium">Complete 3 System Design mock sessions this week</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
              <span className="text-4xl">🎯</span>
              <p className="text-on-surface-variant text-sm">No goal set yet.</p>
              <p className="text-on-surface-variant/60 text-xs">Complete your profile to set your target company.</p>
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}
