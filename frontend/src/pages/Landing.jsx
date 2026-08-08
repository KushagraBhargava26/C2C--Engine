import { Link } from "react-router-dom";
import earthHero from "../assets/earth-hero.jpg";

const FEATURES = [
  {
    title: "Real-Time Alerts",
    desc: "Incident detection within minutes of first report.",
    icon: (
      <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />
    ),
  },
  {
    title: "Risk Scoring",
    desc: "FinBERT-driven sentiment across 40+ categories.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </>
    ),
  },
  {
    title: "Exposure Mapping",
    desc: "See which holdings sit in the blast radius.",
    icon: (
      <>
        <path d="M3 3v18h18" />
        <path d="M7 15l4-5 3 3 5-7" />
      </>
    ),
  },
  {
    title: "Causal Chains",
    desc: "Trace how one event cascades through markets.",
    icon: (
      <>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="18" cy="6" r="2.5" />
        <circle cx="12" cy="18" r="2.5" />
        <path d="M8.2 7.2 10 16M15.8 7.2 14 16M8.5 6h7" />
      </>
    ),
  },
];

export default function Landing() {
  return (
    <div className="no-scrollbar relative flex h-screen w-full flex-col overflow-x-hidden overflow-y-auto bg-ink text-parchment">
      {/* Full-screen background image + fades, sit behind nav and hero both */}
      <div
        className="absolute inset-0 z-0 bg-cover [background-position:58%_38%] motion-safe:animate-[kenburns_26s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: `url(${earthHero})` }}
      />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(90deg,#0D1117_0%,rgba(13,17,23,0.92)_32%,rgba(13,17,23,0.55)_54%,rgba(13,17,23,0.08)_74%,rgba(13,17,23,0)_88%),linear-gradient(0deg,rgba(13,17,23,0.55)_0%,rgba(13,17,23,0)_16%,rgba(13,17,23,0)_84%,#0D1117_100%)]" />

      {/* Nav */}
      <nav className="relative z-10 flex flex-shrink-0 items-center justify-between px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-[30px] w-[30px] items-center justify-center rounded-md bg-gradient-to-br from-signal-a to-signal-b font-display text-[13px] font-bold text-[#06110C]">
            C2
          </div>
          <span className="font-display text-base font-semibold tracking-tight">C2C</span>
          <span className="rounded-md bg-signal-a px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-widest text-[#0B1712]">
            ENGINE
          </span>
        </div>
        <div className="hidden items-center gap-9 md:flex">
          <a href="#features" className="text-[13.5px] font-medium text-parchment-dim transition-colors hover:text-parchment">
            Features
          </a>
          <a href="#solutions" className="text-[13.5px] font-medium text-parchment-dim transition-colors hover:text-parchment">
            Solutions
          </a>
          <a href="#about" className="text-[13.5px] font-medium text-parchment-dim transition-colors hover:text-parchment">
            About Us
          </a>
          <a href="#contact" className="text-[13.5px] font-medium text-parchment-dim transition-colors hover:text-parchment">
            Contact
          </a>
        </div>
        <Link
          to="/login"
          className="rounded-md border border-steel bg-ink-raised px-5 py-2 text-[13px] font-medium text-parchment transition-all hover:-translate-y-px hover:border-signal-a"
        >
          Login
        </Link>
      </nav>

      {/* Hero */}
      <div className="relative mx-auto flex w-full max-w-[1400px] flex-1 items-center gap-10 px-12 pb-10">
        <div className="relative z-10 flex-none md:w-[46%]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-signal-a/30 bg-signal-a/[0.06] px-3 py-1.5 font-mono text-[11px] tracking-widest text-signal-a">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-signal-a shadow-[0_0_8px_theme(colors.signal.a)]" />
            LIVE &nbsp;·&nbsp; 247 INCIDENTS TRACKED TODAY
          </div>

          <h1 className="mb-5 font-display text-[46px] font-semibold leading-[1.08] tracking-tight">
            Global risk, mapped in real time.{" "}
            <span className="bg-gradient-to-r from-signal-a to-signal-b bg-clip-text text-transparent">
              Smarter decisions.
            </span>
          </h1>

          <p className="mb-8 max-w-[460px] text-[15.5px] leading-relaxed text-parchment-dim">
            C2C Engine fuses live geopolitical events, sentiment analysis and portfolio
            exposure into one intelligence layer — so you see the shock before it hits
            the balance sheet.
          </p>

          <div className="mb-11 flex gap-3.5">
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-signal-a to-signal-b px-6 py-3 text-sm font-semibold text-[#06140F] shadow-[0_8px_24px_-8px_rgba(52,211,153,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(52,211,153,0.6)]"
            >
              Get Started
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <a
              href="#dashboard"
              className="rounded-lg border border-steel px-6 py-3 text-sm font-medium text-parchment transition-colors hover:border-steel-light hover:bg-ink-raised"
            >
              Explore the Dashboard
            </a>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-4.5 md:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-t border-steel pt-3.5">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="mb-3 text-signal-a"
                >
                  {f.icon}
                </svg>
                <div className="mb-1 text-xs font-semibold">{f.title}</div>
                <div className="text-[11.5px] leading-tight text-parchment-faint">{f.desc}</div>
              </div>
            ))}
          </div>

          <div className="font-mono text-[10.5px] tracking-wide text-parchment-faint">
            TRUSTED BY ANALYSTS WHO CAN&apos;T AFFORD TO BE LAST TO KNOW
          </div>
        </div>

        {/* right side kept empty on purpose — background image carries the visual */}
        <div className="relative z-10 hidden h-[520px] flex-1 md:block">
          <div className="absolute left-[2%] top-[8%] animate-[float_5s_ease-in-out_infinite] rounded-lg border border-steel bg-ink-soft/85 px-3.5 py-2.5 font-mono text-[10.5px] text-parchment-dim backdrop-blur-sm">
            RISK INDEX
            <span className="block font-display text-base font-semibold text-parchment">72.4 ▲</span>
          </div>
          <div className="absolute bottom-[12%] right-[4%] animate-[float_5s_ease-in-out_infinite_1.4s] rounded-lg border border-steel bg-ink-soft/85 px-3.5 py-2.5 font-mono text-[10.5px] text-parchment-dim backdrop-blur-sm">
            ACTIVE FEEDS
            <span className="block font-display text-base font-semibold text-parchment">184</span>
          </div>
        </div>
      </div>
    </div>
  );
}
