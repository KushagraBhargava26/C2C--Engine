import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import earthHero from "../assets/earth-hero.jpg";
import { login, register, forgotPassword, googleAuth } from "../services/api.js";
import { saveSession } from "../services/auth.js";
import GoogleSignInButton from "../components/GoogleSignInButton.jsx";

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotResult, setForgotResult] = useState(null); // { message, devResetLink? }
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (mode === "forgot") {
      setSubmitting(true);
      try {
        const data = await forgotPassword({ email });
        setForgotResult(data);
      } catch (err) {
        setError(err?.error || err?.message || "Something went wrong. Try again.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      const action = mode === "login" ? login : register;
      const data = await action({ email, password });
      saveSession(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.error || err?.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleCredential(idToken) {
    setError(null);
    try {
      const data = await googleAuth({ idToken });
      saveSession(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.error || err?.message || "Google sign-in failed. Try again.");
    }
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
    setForgotResult(null);
  }

  return (
    <div className="no-scrollbar flex h-screen w-full overflow-x-hidden overflow-y-auto bg-ink text-parchment">
      {/* Left brand / quote panel */}
      <div className="relative hidden w-[46%] flex-col justify-between overflow-hidden border-r border-steel px-12 py-10 md:flex">
        {/* background image + fades */}
        <div
          className="absolute inset-0 z-0 bg-cover [background-position:70%_45%] motion-safe:animate-[kenburns_26s_ease-in-out_infinite_alternate]"
          style={{ backgroundImage: `url(${earthHero})` }}
        />
        <div className="absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(13,17,23,0.55)_0%,rgba(13,17,23,0.35)_45%,rgba(13,17,23,0.75)_100%),radial-gradient(ellipse_80%_60%_at_30%_20%,rgba(52,211,153,0.06),transparent_60%)]" />

        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-gradient-to-br from-signal-a to-signal-b font-display text-[13px] font-bold text-[#06110C]">
            C2
          </div>
          <span className="font-display text-base font-semibold tracking-tight">C2C</span>
          <span className="rounded-md bg-signal-a px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-widest text-[#0B1712]">
            ENGINE
          </span>
        </Link>

        <div className="relative z-10 max-w-[380px]">
          <div className="mb-4 h-px w-10 bg-signal-a" />
          <p className="mb-3.5 font-display text-[19px] font-medium leading-snug">
            &quot;Every market move has a geopolitical fingerprint. We just make it
            visible before your competitors find it.&quot;
          </p>
          <span className="font-mono text-[11px] tracking-wide text-parchment-faint">
            REAL-TIME GLOBAL MONITORING · ALWAYS ON
          </span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-10">
        <div className="w-full max-w-[380px]">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-1.5 text-[12.5px] text-parchment-faint transition-colors hover:text-signal-a"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>

          <h2 className="mb-2 font-display text-[26px] font-semibold">
            {mode === "login" && "Welcome back"}
            {mode === "register" && "Create your account"}
            {mode === "forgot" && "Reset your password"}
          </h2>
          <p className="mb-8 text-[13.5px] text-parchment-dim">
            {mode === "login" && "Sign in to access your risk intelligence dashboard."}
            {mode === "register" && "Set up access to your risk intelligence dashboard."}
            {mode === "forgot" && "Enter your email and we'll generate a reset link."}
          </p>

          {error && (
            <div className="mb-5 rounded-lg border border-risk-critical/40 bg-risk-critical/10 px-3.5 py-2.5 text-[12.5px] text-risk-critical">
              {error}
            </div>
          )}

          {forgotResult && (
            <div className="mb-5 rounded-lg border border-signal-a/40 bg-signal-a/10 px-3.5 py-3 text-[12.5px] text-parchment">
              <p className="mb-2">{forgotResult.message}</p>
              {forgotResult.devResetLink && (
                <>
                  <p className="mb-1.5 text-parchment-faint">
                    No email service is wired up yet, so here's the link directly (test mode):
                  </p>
                  <Link
                    to={forgotResult.devResetLink}
                    className="break-all font-mono text-signal-a underline"
                  >
                    {forgotResult.devResetLink}
                  </Link>
                </>
              )}
            </div>
          )}

          {mode === "forgot" ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="mb-1.5 block text-[11.5px] font-medium text-parchment-faint">
                  Email
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-parchment-faint">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-steel bg-ink-soft py-3 pl-10 pr-3.5 text-[13.5px] text-parchment transition-colors focus:border-signal-a focus:bg-ink-raised focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-signal-a to-signal-b py-3 text-sm font-semibold text-[#06140F] shadow-[0_8px_22px_-8px_rgba(52,211,153,0.45)] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Please wait…" : "Send reset link"}
              </button>

              <div className="mt-5 text-center text-[12.5px] text-parchment-faint">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-medium text-signal-a hover:underline"
                >
                  Back to login
                </button>
              </div>
            </form>
          ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="mb-1.5 block text-[11.5px] font-medium text-parchment-faint">
                Email
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-parchment-faint">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-steel bg-ink-soft py-3 pl-10 pr-3.5 text-[13.5px] text-parchment transition-colors focus:border-signal-a focus:bg-ink-raised focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-1.5 block text-[11.5px] font-medium text-parchment-faint">
                Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-parchment-faint">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="10" width="16" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={mode === "register" ? 8 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"}
                  className="w-full rounded-lg border border-steel bg-ink-soft py-3 pl-10 pr-10 text-[13.5px] text-parchment transition-colors focus:border-signal-a focus:bg-ink-raised focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-parchment-faint"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>

            {mode === "login" ? (
              <div className="mb-6 mt-4.5 flex items-center justify-between">
                <label className="flex items-center gap-2 text-[12.5px] text-parchment-dim">
                  <input type="checkbox" className="h-3.5 w-3.5 accent-signal-a" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => switchMode("forgot")}
                  className="text-[12.5px] font-medium text-signal-a hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            ) : (
              <div className="mb-6 mt-4.5" />
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-r from-signal-a to-signal-b py-3 text-sm font-semibold text-[#06140F] shadow-[0_8px_22px_-8px_rgba(52,211,153,0.45)] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
            </button>

            <div className="mt-5 text-center text-[12.5px] text-parchment-faint">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-medium text-signal-a hover:underline"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-medium text-signal-a hover:underline"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-steel" />
              <span className="font-mono text-[11px] text-parchment-faint">OR CONTINUE WITH</span>
              <div className="h-px flex-1 bg-steel" />
            </div>

            <GoogleSignInButton onCredential={handleGoogleCredential} onError={setError} />

            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-parchment-faint">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Your data is encrypted and never shared
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
