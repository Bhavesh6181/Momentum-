import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { LiveActivityFeed } from "../components/common/LiveActivityFeed";
import { Button } from "../components/ui/Button";
import { AlertCircle, Loader2 } from "lucide-react";

interface LoginFormInputs {
  usernameOrEmail: string;
  password?: string;
}

export const Login: React.FC = () => {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shakeFields, setShakeFields] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setErrorMessage(null);
    setShakeFields(false);
    try {
      const result = await login({ usernameOrEmail: data.usernameOrEmail, password: data.password });
      if (result && result.user && !result.user.onboardingCompleted) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || "Invalid credentials. Please try again.";
      setErrorMessage(errMsg);
      setShakeFields(true);
      setTimeout(() => setShakeFields(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex overflow-hidden w-full select-none">
      {/* Left Column Form */}
      <main className="relative w-full lg:w-[55%] min-h-screen flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 bg-background z-20 text-left">
        {/* Grain overlay */}
        <div className="absolute inset-0 bg-noise opacity-[0.02] mix-blend-overlay pointer-events-none" />

        {/* Wordmark Header */}
        <header className="absolute top-12 left-8 sm:left-16 lg:left-24">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-2 h-8 bg-primary-container rounded-full group-hover:scale-y-110 transition-transform duration-300" />
            <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary">
              Momentum
            </span>
          </Link>
        </header>

        {/* Main Content Area */}
        <div className="max-w-md w-full mt-12">
          <div className="mb-10">
            <h1 className="text-[36px] font-bold tracking-[-0.02em] leading-tight mb-3">
              Welcome back
            </h1>
            <p className="text-on-surface-variant text-body-lg">
              Enter your credentials to access your command center.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* Email Address */}
              <div className="relative group">
                <input
                  type="text"
                  id="usernameOrEmail"
                  required
                  placeholder=" "
                  {...register("usernameOrEmail", { required: true })}
                  className={`w-full bg-surface-container-low border rounded-xl px-4 pt-6 pb-2 text-on-surface focus:outline-none focus:border-primary transition-all duration-200 placeholder-transparent peer ${
                    shakeFields || errors.usernameOrEmail ? "border-error/50 animate-shake" : "border-white/10"
                  }`}
                />
                <label
                  htmlFor="usernameOrEmail"
                  className="absolute left-4 top-4 text-on-surface-variant/60 pointer-events-none transition-all duration-200 peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:text-primary peer-focus:uppercase peer-focus:tracking-wider peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:text-primary peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
                >
                  Email or Username
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
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-primary hover:text-primary-fixed-dim text-body-sm font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
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
              disabled={isLoggingIn}
              className="w-full py-4 text-body-lg font-bold flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </Button>

            {/* Link to Register */}
            <div className="flex items-center gap-4 py-4">
              <div className="h-[1px] flex-1 bg-white/5" />
              <span className="text-on-surface-variant font-label-caps text-label-caps uppercase">
                or
              </span>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <p className="text-center text-on-surface-variant text-body-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Register
              </Link>
            </p>
          </form>
        </div>

        {/* Footer Meta */}
        <footer className="absolute bottom-12 left-8 sm:left-16 lg:left-24">
          <p className="text-on-surface-variant text-body-sm opacity-50">
            © 2024 Momentum Performance Systems.
          </p>
        </footer>
      </main>

      {/* Right Column Activity Feed */}
      <LiveActivityFeed />
    </div>
  );
};
