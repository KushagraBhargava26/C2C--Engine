import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import earthHero from "../assets/earth-hero.jpg";

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: wire up to the real auth endpoint once the Spring Boot
    // backend exposes /api/auth/login. For now this just goes to the dashboard.
    navigate("/dashboard");
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

          <h2 className="mb-2 font-display text-[26px] font-semibold">Welcome back</h2>
          <p className="mb-8 text-[13.5px] text-parchment-dim">
            Sign in to access your risk intelligence dashboard.
          </p>

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
                  placeholder="Enter your password"
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

            <div className="mb-6 mt-4.5 flex items-center justify-between">
              <label className="flex items-center gap-2 text-[12.5px] text-parchment-dim">
                <input type="checkbox" className="h-3.5 w-3.5 accent-signal-a" />
                Remember me
              </label>
              <a href="#forgot" className="text-[12.5px] font-medium text-signal-a hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-gradient-to-r from-signal-a to-signal-b py-3 text-sm font-semibold text-[#06140F] shadow-[0_8px_22px_-8px_rgba(52,211,153,0.45)] transition-transform hover:-translate-y-px"
            >
              Login
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-steel" />
              <span className="font-mono text-[11px] text-parchment-faint">OR CONTINUE WITH</span>
              <div className="h-px flex-1 bg-steel" />
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-steel bg-ink-soft py-3 text-[13.5px] font-medium text-parchment transition-colors hover:border-steel-light hover:bg-ink-raised"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.05H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.95l3.66-2.85z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-parchment-faint">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Your data is encrypted and never shared
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
