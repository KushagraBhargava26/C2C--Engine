import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/api.js";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword({ token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err?.error || err?.message || "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="no-scrollbar flex h-screen w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-ink px-6 text-parchment">
      <div className="w-full max-w-[380px]">
        <Link
          to="/login"
          className="mb-8 inline-flex items-center gap-1.5 text-[12.5px] text-parchment-faint transition-colors hover:text-signal-a"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to login
        </Link>

        {!token ? (
          <div className="rounded-lg border border-risk-critical/40 bg-risk-critical/10 px-3.5 py-3 text-[13px] text-risk-critical">
            This reset link is missing its token. Go back and request a new one from the login page.
          </div>
        ) : done ? (
          <>
            <h2 className="mb-2 font-display text-[26px] font-semibold">Password updated</h2>
            <p className="mb-6 text-[13.5px] text-parchment-dim">
              You can log in with your new password now.
            </p>
            <Link
              to="/login"
              className="block w-full rounded-lg bg-gradient-to-r from-signal-a to-signal-b py-3 text-center text-sm font-semibold text-[#06140F] shadow-[0_8px_22px_-8px_rgba(52,211,153,0.45)] transition-transform hover:-translate-y-px"
            >
              Go to login
            </Link>
          </>
        ) : (
          <>
            <h2 className="mb-2 font-display text-[26px] font-semibold">Set a new password</h2>
            <p className="mb-8 text-[13.5px] text-parchment-dim">
              Choose a new password for your account.
            </p>

            {error && (
              <div className="mb-5 rounded-lg border border-risk-critical/40 bg-risk-critical/10 px-3.5 py-2.5 text-[12.5px] text-risk-critical">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-1.5 block text-[11.5px] font-medium text-parchment-faint">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-lg border border-steel bg-ink-soft py-3 pl-3.5 pr-10 text-[13.5px] text-parchment transition-colors focus:border-signal-a focus:bg-ink-raised focus:outline-none"
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

              <div className="mb-6">
                <label className="mb-1.5 block text-[11.5px] font-medium text-parchment-faint">
                  Confirm password
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full rounded-lg border border-steel bg-ink-soft py-3 pl-3.5 pr-3.5 text-[13.5px] text-parchment transition-colors focus:border-signal-a focus:bg-ink-raised focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-gradient-to-r from-signal-a to-signal-b py-3 text-sm font-semibold text-[#06140F] shadow-[0_8px_22px_-8px_rgba(52,211,153,0.45)] transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Please wait…" : "Update password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
