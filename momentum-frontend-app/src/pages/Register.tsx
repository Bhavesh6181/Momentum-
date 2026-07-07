import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { LiveActivityFeed } from "../components/common/LiveActivityFeed";
import { Button } from "../components/ui/Button";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

interface RegisterFormInputs {
  fullName: string;
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
}

export const Register: React.FC = () => {
  const { register: registerUser, isRegistering } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeFields, setShakeFields] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Username status
  const [usernameVal, setUsernameVal] = useState("");
  const isUsernameAvailable = usernameVal.length > 3;

  // Password Strength
  const [passwordVal, setPasswordVal] = useState("");
  const getPasswordStrength = () => {
    if (!passwordVal) return { label: "", color: "transparent", count: 0 };
    if (passwordVal.length < 6) return { label: "Weak", color: "var(--destructive)", count: 1 };
    if (passwordVal.length < 10) return { label: "Good", color: "var(--primary-container)", count: 2 };
    return { label: "Strong", color: "var(--signal-green)", count: 4 };
  };
  const strength = getPasswordStrength();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const onSubmit = async (data: RegisterFormInputs) => {
    setErrorMessage(null);
    setShakeFields(false);

    if (data.password !== data.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setShakeFields(true);
      setTimeout(() => setShakeFields(false), 500);
      return;
    }

    try {
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      setRegisteredEmail(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Registration failed. Please try again.";
      setErrorMessage(errMsg);
      setShakeFields(true);
      setTimeout(() => setShakeFields(false), 500);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex overflow-hidden w-full select-none">
        {/* Left Column Success Card */}
        <main className="relative w-full lg:w-[55%] min-h-screen flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 bg-background z-20 text-left">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />
          
          <header className="absolute top-12 left-8 sm:left-16 lg:left-24">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-2 h-8 bg-primary-container rounded-full group-hover:scale-y-110 transition-transform duration-300" />
              <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary">
                Momentum
              </span>
            </Link>
          </header>

          <div className="max-w-md w-full">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-signal-green/10 border border-signal-green/20 flex items-center justify-center animate-pulse">
                <CheckCircle2 className="text-signal-green h-8 w-8" />
              </div>
              <h1 className="text-[36px] font-bold tracking-[-0.02em] leading-tight text-on-surface">
                Check your email
              </h1>
              <p className="text-on-surface-variant text-body-lg">
                We've sent a verification link to <strong className="text-on-surface">{registeredEmail}</strong>. Please check your inbox and click the link to activate your account.
              </p>
              <div className="w-full pt-4">
                <Button
                  onClick={() => navigate("/login")}
                  variant="primary"
                  className="w-full py-4 text-body-lg font-bold"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </div>
        </main>
        <LiveActivityFeed />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex overflow-hidden w-full select-none">
      {/* Left Column Form */}
      <main className="relative w-full lg:w-[55%] min-h-screen flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 bg-background z-20 text-left">
        {/* Grain overlay */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

        {/* Wordmark Header */}
        <header className="absolute top-12 left-8 sm:left-16 lg:left-24">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-2 h-8 bg-primary-container rounded-full group-hover:scale-y-110 transition-transform duration-300" />
            <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary">
              Momentum
            </span>
          </Link>
        </header>

        {/* Stepper Navigation */}
        <nav className="mb-10 w-full max-w-md mt-16">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Account</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Profile</span>
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Done</span>
          </div>
          <div className="h-[2px] w-full bg-white/10 flex rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-primary-container shadow-[0_0_8px_rgba(108,92,231,0.5)]" />
            <div className="h-full w-2/3" />
          </div>
        </nav>

        {/* Form Container */}
        <div className="max-w-md w-full">
          <div className="mb-8">
            <h1 className="text-headline-lg font-bold leading-tight mb-2">
              Join the Collective
            </h1>
            <p className="text-on-surface-variant text-body-lg">
              Start your high-performance study journey.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Full Name */}
              <div className="relative group">
                <input
                  type="text"
                  id="fullName"
                  required
                  placeholder=" "
                  {...register("fullName", { required: true })}
                  className={`w-full bg-surface-container-low border rounded-xl px-4 pt-6 pb-2 text-on-surface focus:outline-none focus:border-primary transition-all duration-200 placeholder-transparent peer ${
                    shakeFields || errors.fullName ? "border-error/50 animate-shake" : "border-white/10"
                  }`}
                />
                <label
                  htmlFor="fullName"
                  className="absolute left-4 top-4 text-on-surface-variant/60 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-primary peer-focus:uppercase peer-focus:tracking-wider peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
                >
                  Full Name
                </label>
              </div>

              {/* Username */}
              <div className="relative group">
                <input
                  type="text"
                  id="username"
                  required
                  placeholder=" "
                  {...register("username", { required: true })}
                  onChange={(e) => setUsernameVal(e.target.value)}
                  className={`w-full bg-surface-container-low border rounded-xl px-4 pt-6 pb-2 pr-12 text-on-surface focus:outline-none focus:border-primary transition-all duration-200 placeholder-transparent peer ${
                    shakeFields || errors.username ? "border-error/50 animate-shake" : "border-white/10"
                  }`}
                />
                <label
                  htmlFor="username"
                  className="absolute left-4 top-4 text-on-surface-variant/60 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-primary peer-focus:uppercase peer-focus:tracking-wider peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
                >
                  Username
                </label>
                <div
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity duration-300 pointer-events-none ${
                    isUsernameAvailable ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <CheckCircle2 className="text-signal-green h-5 w-5" />
                </div>
              </div>

              {/* Email Address */}
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  required
                  placeholder=" "
                  {...register("email", { required: true })}
                  className={`w-full bg-surface-container-low border rounded-xl px-4 pt-6 pb-2 text-on-surface focus:outline-none focus:border-primary transition-all duration-200 placeholder-transparent peer ${
                    shakeFields || errors.email ? "border-error/50 animate-shake" : "border-white/10"
                  }`}
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 top-4 text-on-surface-variant/60 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-primary peer-focus:uppercase peer-focus:tracking-wider peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
                >
                  Email Address
                </label>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="relative group">
                  <input
                    type="password"
                    id="password"
                    required
                    placeholder=" "
                    {...register("password", { required: true })}
                    onChange={(e) => setPasswordVal(e.target.value)}
                    className={`w-full bg-surface-container-low border rounded-xl px-4 pt-6 pb-2 text-on-surface focus:outline-none focus:border-primary transition-all duration-200 placeholder-transparent peer ${
                      shakeFields || errors.password ? "border-error/50 animate-shake" : "border-white/10"
                    }`}
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-4 top-4 text-on-surface-variant/60 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-primary peer-focus:uppercase peer-focus:tracking-wider peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
                  >
                    Password
                  </label>
                </div>

                {/* Strength Meter */}
                <div className="flex items-center gap-3 h-4">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        style={{
                          backgroundColor:
                            step <= strength.count ? strength.color : "rgba(255,255,255,0.1)",
                        }}
                        className="h-[2px] flex-1 transition-colors duration-500 rounded"
                      />
                    ))}
                  </div>
                  <span
                    style={{ color: strength.color, opacity: passwordVal ? 1 : 0 }}
                    className="text-[10px] font-bold uppercase tracking-tighter w-12 text-right transition-opacity"
                  >
                    {strength.label}
                  </span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  placeholder=" "
                  {...register("confirmPassword", { required: true })}
                  className={`w-full bg-surface-container-low border rounded-xl px-4 pt-6 pb-2 text-on-surface focus:outline-none focus:border-primary transition-all duration-200 placeholder-transparent peer ${
                    shakeFields || errors.confirmPassword ? "border-error/50 animate-shake" : "border-white/10"
                  }`}
                />
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-4 top-4 text-on-surface-variant/60 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-primary peer-focus:uppercase peer-focus:tracking-wider peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
                >
                  Confirm Password
                </label>
              </div>
            </div>

            {/* Error Message Slide-in */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-error bg-error-container/20 border border-error/20 px-4 py-3 rounded-lg text-body-sm flex items-center gap-2 overflow-hidden"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={isRegistering}
              className="w-full py-4 text-body-lg font-bold flex items-center justify-center gap-2"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create account</span>
              )}
            </Button>

            {/* Terms Footer */}
            <p className="text-body-sm text-on-surface-variant text-center leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link to="/terms" className="text-primary-container hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary-container hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>
        </div>

        {/* Bottom Action */}
        <div className="mt-8 text-center md:text-left">
          <p className="text-body-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </main>

      {/* Right Column Activity Feed */}
      <LiveActivityFeed />
    </div>
  );
};
