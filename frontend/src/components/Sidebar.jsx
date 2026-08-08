import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", glyph: "◧" },
  { to: "/dashboard/global-feed", label: "Global Feed", glyph: "≡" },
  { to: "/dashboard/risk-map", label: "Risk Map", glyph: "◎" },
  { to: "/dashboard/portfolio", label: "Portfolio Exposure", glyph: "▦" },
  { to: "/dashboard/knowledge-graph", label: "Knowledge Graph", glyph: "◈" },
  { to: "/dashboard/analytics", label: "Analytics", glyph: "▤" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-steel bg-ink-soft md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-steel px-5">
        <span className="font-display text-lg font-semibold tracking-tight text-parchment">
          C2C
        </span>
        <span className="rounded-sm border border-bullion-dim px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-bullion">
          Engine
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 font-body text-sm transition-colors ${
                isActive
                  ? "bg-ink-raised text-bullion"
                  : "text-parchment-dim hover:bg-ink-raised hover:text-parchment"
              }`
            }
          >
            <span className="font-mono text-base leading-none">{item.glyph}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-steel px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-parchment-faint">
          Conflict → Currency
        </p>
        <p className="mt-1 text-xs text-parchment-faint">Geopolitical risk desk</p>
      </div>
    </aside>
  );
}