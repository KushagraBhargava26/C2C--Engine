import { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import worldData from "world-atlas/countries-110m.json";
import { alpha2ForNumericId } from "../utils/isoCountries.js";
import { getMockRiskScoreForMap } from "../data/mockCountries.js";
import { getCountryDetail } from "../services/api.js";
import { exposureColor, riskStyle } from "../utils/risk.js";
import { FlagIcon } from "../utils/region.jsx";

function CountryDetailPanel({ detail, onClose }) {
  if (!detail) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-steel bg-ink-soft p-6 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-parchment-faint">Click a country to view details</p>
      </div>
    );
  }

  if (detail.error) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-steel bg-ink-soft p-6 text-center gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-parchment-faint">No risk data available for {detail.region}</p>
        <button onClick={onClose} className="text-xs text-parchment-dim underline">Back</button>
      </div>
    );
  }

  const style = riskStyle(detail.riskLevel);

  return (
    <div className="rounded-lg border border-steel bg-ink-soft p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlagIcon regionCode={detail.region} className="h-5 w-7" />
          <h3 className="font-display text-base font-semibold text-parchment">{detail.region}</h3>
        </div>
        <button onClick={onClose} className="text-parchment-faint hover:text-parchment">
          ✕
        </button>
      </div>

      <div className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-parchment-faint">Risk score</p>
        <div className="flex items-baseline gap-2">
          <p className="font-mono text-3xl font-semibold text-parchment">{detail.riskScore}</p>
          <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${style.chip}`}>
            {detail.riskLevel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-parchment-faint">Active events</p>
          <p className="font-mono text-lg text-parchment">{detail.activeEvents}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-parchment-faint">Market impact</p>
          <p className={`font-mono text-lg ${detail.marketImpactPct >= 0 ? "text-risk-low" : "text-risk-critical"}`}>
            {detail.marketImpactPct >= 0 ? "+" : ""}
            {detail.marketImpactPct}%
          </p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-parchment-faint">Affected sectors</p>
        <div className="flex flex-wrap gap-1.5">
          {detail.affectedSectors.map((s) => (
            <span key={s} className="rounded border border-steel-light px-2 py-0.5 text-xs text-parchment-dim">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RiskMap() {
  const [selected, setSelected] = useState(null);

  async function handleCountryClick(geo) {
  const alpha2 = alpha2ForNumericId(geo.id);
  if (!alpha2) return;
  try {
    const detail = await getCountryDetail(alpha2);
    setSelected(detail);
  } catch (err) {
    setSelected({ error: true, region: alpha2 });
  }
}

  return (
    <div className="grid grid-cols-1 gap-5 p-8 lg:grid-cols-3">
      <div className="rounded-lg border border-steel bg-ink-soft p-4 lg:col-span-2">
        <h2 className="mb-3 font-display text-sm font-semibold text-parchment">Global Risk Map</h2>
        <ComposableMap projectionConfig={{ scale: 140 }} width={800} height={450} style={{ width: "100%", height: "auto" }}>
          <Geographies geography={worldData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const alpha2 = alpha2ForNumericId(geo.id);
                const score = alpha2 ? getMockRiskScoreForMap(alpha2) : null;
                const fill = score != null ? exposureColor(score) : "#2A3542";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleCountryClick(geo)}
                    style={{
                      default: { fill, stroke: "#0D1117", strokeWidth: 0.5, outline: "none" },
                      hover: { fill, stroke: "#E7E4DA", strokeWidth: 0.75, outline: "none", cursor: score != null ? "pointer" : "default" },
                      pressed: { fill, outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <CountryDetailPanel detail={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
