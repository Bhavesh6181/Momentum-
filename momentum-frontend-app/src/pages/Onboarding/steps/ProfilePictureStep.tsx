import React, { useState, useCallback, useRef } from "react";
import { ArrowLeft, ArrowRight, Camera, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "../../../store/onboardingStore";
import api from "../../../lib/axios";
import { useAuthStore } from "../../../store/authStore";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface Props {
  onNext: () => void;   // → completion / dashboard
  onBack: () => void;
}

export const ProfilePictureStep: React.FC<Props> = ({ onNext, onBack }) => {
  const { answers, setAnswer } = useOnboardingStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(answers.profilePictureDataUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    
    // Create preview locally first
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
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
        setPreview(returnedUrl);
        setAnswer("profilePictureDataUrl", returnedUrl);
        useAuthStore.getState().updateUser({ avatarUrl: returnedUrl });
      }
    } catch (error) {
      console.error("Profile picture upload failed:", error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [setAnswer]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleClearPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setAnswer("profilePictureDataUrl", null);
    useAuthStore.getState().updateUser({ avatarUrl: undefined });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center text-center">
      {/* Step label */}
      <p className="text-label-caps text-primary uppercase tracking-widest mb-4 self-start">
        Onboarding 05 / 05
      </p>
      <div className="text-right self-stretch mb-2">
        <span className="text-label-caps text-on-surface-variant tracking-[0.2em]">STEP 05 / 05</span>
      </div>

      {/* Headline */}
      <h1
        className="font-extrabold tracking-[-0.04em] leading-[1.1] mb-12 text-on-surface"
        style={{ fontSize: "clamp(36px, 5vw, 48px)" }}
        id="step-heading"
      >
        Let them see the focus.
      </h1>

      {/* Dropzone */}
      <div
        className="relative group cursor-pointer"
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        aria-label={preview ? "Change profile picture — click or drop a new image" : "Upload profile picture — click or drop an image"}
        onKeyDown={(e) => e.key === "Enter" && !isUploading && fileInputRef.current?.click()}
      >
        {/* Outer hover ring (always present, scales up on hover) */}
        <motion.div
          className="absolute -inset-4 rounded-full border border-primary/10 pointer-events-none"
          animate={{ scale: isDragOver ? 1.05 : 1, opacity: isDragOver ? 1 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        />

        {/* Main circle */}
        <motion.div
          className="w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center overflow-hidden relative"
          animate={{
            borderColor: isDragOver ? "var(--primary-container)" : preview ? "var(--primary-container)" : "rgba(146,142,160,0.4)",
            boxShadow: isDragOver ? "0 0 40px rgba(108,92,231,0.4), 0 0 0 1px var(--primary-container)" : "none",
          }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{
            border: "1px dashed",
            background: isDragOver
              ? "rgba(108,92,231,0.08)"
              : preview
              ? "transparent"
              : "var(--surface-container-low)",
          }}
        >
          {/* Preview image */}
          <AnimatePresence>
            {preview && !isUploading && (
              <motion.img
                key="preview"
                src={preview}
                alt="Profile picture preview"
                className="w-full h-full object-cover rounded-full"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: EASE }}
              />
            )}
          </AnimatePresence>

          {/* Uploading progress indicator */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                key="progress"
                className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-4 z-30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <span className="font-mono text-sm text-primary font-bold">{uploadProgress}%</span>
                <span className="text-[10px] text-on-surface-variant/60 uppercase font-semibold tracking-wider">Uploading...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload prompt (hidden when preview or uploading shown) */}
          <AnimatePresence>
            {!preview && !isUploading && (
              <motion.div
                key="prompt"
                className="flex flex-col items-center justify-center gap-4 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  animate={{ scale: isDragOver ? 1.2 : 1 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {isDragOver
                    ? <Upload size={40} className="text-primary" aria-hidden="true" />
                    : <Camera size={40} className="text-primary" aria-hidden="true" />
                  }
                </motion.div>
                <p className="text-label-caps text-on-surface-variant/60 uppercase">
                  {isDragOver ? "Drop to upload" : "Drag or Click"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-full" />
        </motion.div>

        {/* Clear button when preview active */}
        {preview && (
          <button
            onClick={handleClearPreview}
            className="absolute -top-2 -right-2 w-8 h-8 bg-error text-on-error rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-20"
            aria-label="Remove profile picture"
          >
            <X size={14} />
          </button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          id="profile-picture-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          aria-hidden="true"
        />
      </div>

      {preview && (
        <p className="mt-4 text-[14px] text-signal-green">
          ✓ Looking great! Click to change.
        </p>
      )}

      {/* Footer Actions */}
      <div className="mt-16 flex flex-col md:flex-row gap-6 items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-label-caps text-on-surface-variant hover:text-on-surface transition-colors duration-300 py-3 px-8 uppercase tracking-widest"
          aria-label="Go back to social links"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Previous
        </button>
        <button
          onClick={onNext}
          className="text-label-caps text-on-surface-variant hover:text-on-surface transition-colors duration-300 py-3 px-8 uppercase tracking-widest"
          aria-label="Skip profile picture and finish"
        >
          Skip for Now
        </button>
        <button
          onClick={onNext}
          aria-label="Finish profile and go to dashboard"
          className="
            group flex items-center gap-3
            bg-primary-container text-on-primary-container
            py-4 px-12 rounded-full text-[20px] font-semibold
            shadow-lg hover:shadow-primary-container/20
            active:scale-95 hover:brightness-110
            transition-all duration-300
          "
          style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          Finish Profile
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform duration-300"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  );
};
