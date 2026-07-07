import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Globe, Plus, Hash } from "lucide-react";
import { useCreateGroupMutation, useJoinGroupMutation } from "../hooks/useGroupsData";

interface CreateJoinGroupModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "create" | "join";
}

export function CreateJoinGroupModal({ open, onClose, defaultTab = "create" }: CreateJoinGroupModalProps) {
  const [activeTab, setActiveTab] = useState<"create" | "join">(defaultTab);
  
  // Create Form State
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("private");
  const [createErrors, setCreateErrors] = useState<{ name?: string; subject?: string }>({});

  // Join OTP State
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [joinError, setJoinError] = useState("");
  const otpInputsRef = useRef<HTMLInputElement[]>([]);

  const createMutation = useCreateGroupMutation();
  const joinMutation = useJoinGroupMutation();

  // Reset states when active tab changes or modal opens/closes
  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      setName("");
      setSubject("");
      setDescription("");
      setPrivacy("private");
      setCreateErrors({});
      setCode(Array(6).fill(""));
      setJoinError("");
    }
  }, [open, defaultTab]);

  // Handle Tab Switch Animation trigger
  const handleTabChange = (tab: "create" | "join") => {
    setActiveTab(tab);
    setJoinError("");
    setCreateErrors({});
  };

  // OTP inputs auto-advance logic
  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!cleanValue) return;

    const newCode = [...code];
    // Take the last character typed if multiple entered
    const char = cleanValue.charAt(cleanValue.length - 1);
    newCode[index] = char;
    setCode(newCode);
    setJoinError("");

    // Auto-advance focus to the next input
    if (index < 5 && char !== "") {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newCode = [...code];
      if (code[index] !== "") {
        // Clear current field
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        // Focus previous field and clear it
        newCode[index - 1] = "";
        setCode(newCode);
        otpInputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);
    
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedData[i] || "";
      }
      setCode(newCode);
      
      // Focus the last filled input, or the last input box
      const nextFocusIdx = Math.min(pastedData.length, 5);
      otpInputsRef.current[nextFocusIdx]?.focus();
    }
  };

  // Submissions
  const validateCreate = (): boolean => {
    const errs: { name?: string; subject?: string } = {};
    if (!name || name.trim().length < 3) errs.name = "Name must be at least 3 characters";
    if (!subject || subject.trim().length < 2) errs.subject = "Subject is required";
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreate()) return;
    try {
      await createMutation.mutateAsync({ name, subject, privacy, description });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setJoinError("Please enter the full 6-character invite code");
      return;
    }
    try {
      await joinMutation.mutateAsync(fullCode);
      onClose();
    } catch (err) {
      setJoinError("Failed to join group. Please check the code and try again.");
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[9999]"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="glass-card rounded-2xl w-full max-w-lg p-8 relative flex flex-col gap-6"
              role="dialog"
              aria-modal="true"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all duration-200 rounded-lg"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              {/* Title Header */}
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">
                  Study Circle Setup
                </h2>
                <p className="text-body-sm text-on-surface-variant mt-1">
                  Collaborate and achieve academic goals together.
                </p>
              </div>

              {/* Sliding Tabs */}
              <div className="flex gap-1 p-1 bg-surface-container-high rounded-xl w-full relative">
                {(["create", "join"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`flex-1 py-3 text-sm font-bold transition-all relative rounded-lg focus:outline-none ${
                      activeTab === tab ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="modal-tab-indicator"
                        className="absolute inset-0 bg-surface-container-highest rounded-lg shadow-md"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 capitalize">
                      {tab === "create" ? "Create Group" : "Join with Code"}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Screen Tab Content */}
              <div className="min-h-[280px]">
                {activeTab === "create" ? (
                  <motion.form
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-4"
                    onSubmit={handleCreateSubmit}
                    noValidate
                  >
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-group-name" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Group Name *
                      </label>
                      <input
                        id="modal-group-name"
                        type="text"
                        placeholder="e.g. Quantum Physics II"
                        autoComplete="off"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (createErrors.name) setCreateErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        className="w-full px-4 py-3 bg-surface-container-high border border-white/10 rounded-xl 
                                   text-on-surface placeholder:text-on-surface-variant/40 
                                   focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 transition-all text-sm"
                      />
                      {createErrors.name && (
                        <p className="text-xs text-error mt-0.5 font-medium">{createErrors.name}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-group-subject" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Subject *
                      </label>
                      <input
                        id="modal-group-subject"
                        type="text"
                        placeholder="e.g. Physics, Calculus, Economics"
                        autoComplete="off"
                        value={subject}
                        onChange={(e) => {
                          setSubject(e.target.value);
                          if (createErrors.subject) setCreateErrors((prev) => ({ ...prev, subject: undefined }));
                        }}
                        className="w-full px-4 py-3 bg-surface-container-high border border-white/10 rounded-xl 
                                   text-on-surface placeholder:text-on-surface-variant/40 
                                   focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 transition-all text-sm"
                      />
                      {createErrors.subject && (
                        <p className="text-xs text-error mt-0.5 font-medium">{createErrors.subject}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="modal-group-desc" className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                        Description <span className="opacity-40">(optional)</span>
                      </label>
                      <textarea
                        id="modal-group-desc"
                        rows={2}
                        placeholder="What are the rules, topics, and goals?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-high border border-white/10 rounded-xl 
                                   text-on-surface placeholder:text-on-surface-variant/40 
                                   focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/25 transition-all text-sm resize-none"
                      />
                    </div>

                    {/* Privacy */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Privacy</span>
                      <div className="grid grid-cols-2 gap-3">
                        {(["private", "public"] as const).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPrivacy(p)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-semibold
                              ${privacy === p
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

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-5 py-3 bg-surface-container-high text-on-surface font-semibold rounded-xl border border-white/5 hover:bg-surface-container-highest transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="flex-1 px-5 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl 
                                   hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {createMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                        <span>{createMutation.isPending ? "Creating…" : "Create Group"}</span>
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-6"
                    onSubmit={handleJoinSubmit}
                  >
                    {/* Informative text */}
                    <div className="text-center py-2">
                      <Hash className="mx-auto text-primary mb-2 opacity-80" size={32} />
                      <p className="text-sm text-on-surface">Enter Study Circle Invite Code</p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Priya's group code is <span className="font-bold text-primary">QP2XZ4</span> or join a dynamic one.
                      </p>
                    </div>

                    {/* OTP Inputs Grid */}
                    <div className="flex justify-center gap-2 max-w-sm mx-auto w-full">
                      {code.map((char, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            if (el) otpInputsRef.current[index] = el;
                          }}
                          type="text"
                          maxLength={1}
                          value={char}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onPaste={handleOtpPaste}
                          aria-label={`Digit ${index + 1}`}
                          className="w-12 h-14 bg-surface-container-high border border-white/10 rounded-xl text-center text-xl font-bold font-mono
                                     text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                        />
                      ))}
                    </div>

                    {joinError && (
                      <p className="text-center text-xs text-error font-medium">{joinError}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-6">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-5 py-3 bg-surface-container-high text-on-surface font-semibold rounded-xl border border-white/5 hover:bg-surface-container-highest transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={joinMutation.isPending}
                        className="flex-1 px-5 py-3 bg-primary-container text-on-primary-container font-bold rounded-xl 
                                   hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {joinMutation.isPending ? (
                          <div className="w-4 h-4 border-2 border-on-primary-container/30 border-t-on-primary-container rounded-full animate-spin" />
                        ) : (
                          <Plus size={16} />
                        )}
                        <span>{joinMutation.isPending ? "Joining…" : "Join Circle"}</span>
                      </button>
                    </div>
                  </motion.form>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
