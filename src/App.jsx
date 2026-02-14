import { useState, useMemo, useRef, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toPng } from 'html-to-image';
import { simulate } from './simulation';
import './App.css';

const fmtIdx = (v) => `${v.toFixed(1)}x`;

// ─── Tooltip ────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const trad = payload.find(p => p.dataKey === 'traditional')?.value || 0;
  const port = payload.find(p => p.dataKey === 'portless')?.value || 0;
  return (
    <div className="bg-[#12131a] border border-[#2a2b35] rounded-lg p-3 shadow-2xl">
      <div className="text-[10px] text-gray-500 mb-2">Month {label}</div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-[#4b5563]" />
        <span className="text-xs text-gray-400">Traditional</span>
        <span className="text-xs font-semibold text-gray-300 ml-auto tabular-nums">{fmtIdx(trad)}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-xs text-emerald-400">Portless</span>
        <span className="text-xs font-semibold text-emerald-300 ml-auto tabular-nums">{fmtIdx(port)}</span>
      </div>
    </div>
  );
}

// ─── Slider ─────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange, format }) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</label>
        <span className="text-lg font-bold text-white tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-gray-600">{format(min)}</span>
        <span className="text-[10px] text-gray-600">{format(max)}</span>
      </div>
    </div>
  );
}

// ─── Dropdown ───────────────────────────────────────────
function Dropdown({ label, value, options, onChange }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2 block">{label}</label>
      <div className="flex gap-2">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all border ${
              value === opt.value
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-[#1a1b24] border-[#2a2b35] text-gray-500 hover:border-[#3a3b45] hover:text-gray-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Comparison Row (for benefits section) ──────────────
function ComparisonRow({ label, oldWay, newWay }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 py-3 border-b border-[#1a1b24] last:border-0 items-start">
      <div className="text-xs text-gray-400 font-medium">{label}</div>
      <div className="text-xs text-gray-500">{oldWay}</div>
      <div className="text-xs text-emerald-400">{newWay}</div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────
export default function App() {
  const exportRef = useRef(null);
  const [cm, setCm] = useState(0.50);
  const [roas, setRoas] = useState(3.0);
  const [netTerms, setNetTerms] = useState(45);

  const { data, multiplier } = useMemo(() => simulate(cm, roas, netTerms), [cm, roas, netTerms]);

  const handleExport = useCallback(async () => {
    if (!exportRef.current) return;
    try {
      const url = await toPng(exportRef.current, {
        backgroundColor: '#0a0b0f',
        pixelRatio: 2,
        style: { padding: '32px' },
      });
      const link = document.createElement('a');
      link.download = 'portless-cash-velocity.png';
      link.href = url;
      link.click();
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0b0f] px-4 py-10">
      <div className="w-full max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-sm font-bold text-white tracking-tight">Portless</span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       bg-[#1a1b24] border border-[#2a2b35] text-gray-500
                       hover:border-emerald-500/30 hover:text-emerald-400 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>

        {/* Exportable area */}
        <div ref={exportRef}>

          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              The Cash Velocity Calculator
            </h1>
            <p className="text-sm text-gray-500">
              Same product. Same marketing. See what happens when your cash compounds faster.
            </p>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <Slider
              label="Contribution Margin"
              value={cm} min={0.20} max={0.80} step={0.05}
              onChange={setCm}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <Slider
              label="ROAS"
              value={roas} min={1.5} max={6.0} step={0.1}
              onChange={setRoas}
              format={(v) => `${v.toFixed(1)}x`}
            />
            <Dropdown
              label="Supplier Terms"
              value={netTerms}
              options={[
                { value: 30, label: 'Net 30' },
                { value: 45, label: 'Net 45' },
                { value: 60, label: 'Net 60' },
                { value: 90, label: 'Net 90' },
              ]}
              onChange={setNetTerms}
            />
          </div>

          {/* Chart card */}
          <div className="bg-[#12131a] border border-[#1e1f2a] rounded-2xl p-5 sm:p-6 mb-4">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-300">Revenue Growth — 12 Months</h2>
                <p className="text-[11px] text-gray-600 mt-0.5">Indexed to starting revenue (1.0x)</p>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tabular-nums leading-none">
                  {multiplier.toFixed(1)}x
                </div>
                <div className="text-[10px] text-emerald-600 mt-1 uppercase tracking-wider font-medium">
                  faster growth
                </div>
              </div>
            </div>

            <div className="h-[300px] sm:h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPortless" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gTraditional" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6b7280" stopOpacity={0.08} />
                      <stop offset="100%" stopColor="#6b7280" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1b24" />
                  <XAxis
                    dataKey="month"
                    stroke="transparent"
                    tick={{ fill: '#4b5563', fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="transparent"
                    tick={{ fill: '#4b5563', fontSize: 11 }}
                    tickLine={false}
                    tickFormatter={fmtIdx}
                    width={48}
                  />
                  <Tooltip content={<ChartTooltip />} />

                  {/* Traditional — smooth curve with subtle fill */}
                  <Area
                    type="monotone"
                    dataKey="traditional"
                    stroke="#4b5563"
                    strokeWidth={2}
                    fill="url(#gTraditional)"
                    animationDuration={600}
                    name="Traditional"
                  />

                  {/* Portless — smooth curve with gradient fill */}
                  <Area
                    type="monotone"
                    dataKey="portless"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#gPortless)"
                    animationDuration={600}
                    name="Portless"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-[#4b5563] rounded" />
                <span className="text-[10px] text-gray-500">Traditional (ocean freight)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-emerald-500 rounded" />
                <span className="text-[10px] text-emerald-500">Portless (direct fulfillment)</span>
              </div>
            </div>
          </div>

          {/* Assumptions */}
          <div className="mb-8 px-1">
            <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
              <span className="text-gray-500 font-medium">Model assumptions:</span>{' '}
              Revenue is reinvested into marketing each cycle. Marketing takes ~3 weeks to convert to sales.
              Ad efficiency decays 3.5% monthly as spend scales (rising CPAs, audience saturation).
              Traditional model uses ~3.5-month cash cycles (ocean freight + customs + inbound).
              Portless model uses ~1-month cycles. Longer supplier terms let Portless overlap inventory orders,
              increasing the growth ceiling.
            </p>
            <p className="text-[11px] text-gray-500 italic">
              This shows the power of faster cash cycles — not a guarantee of exact results.
              Actual growth depends on your product, market, and execution.
            </p>
          </div>

          {/* Insight */}
          <p className="text-center text-[13px] text-gray-500 mb-8">
            The only difference is how fast your inventory turns into cash you can reinvest.
          </p>

          {/* CTA */}
          <div className="text-center mb-10">
            <a
              href="https://portless.com/demo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-500 text-white text-sm font-semibold
                         hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              Book a Demo
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Benefits comparison */}
          <div className="bg-[#12131a] border border-[#1e1f2a] rounded-2xl p-5 sm:p-6 mb-6">
            <h3 className="text-sm font-semibold text-white mb-1">Why cash cycles faster with Portless</h3>
            <p className="text-[11px] text-gray-600 mb-5">The same inventory, handled completely differently.</p>

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-4 pb-3 border-b border-[#2a2b35] mb-1">
              <div className="text-[10px] text-gray-600 uppercase tracking-wider font-medium"></div>
              <div className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">Traditional</div>
              <div className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">Portless</div>
            </div>

            <ComparisonRow
              label="Time to first sale"
              oldWay="8–12 weeks after production (ocean freight + customs + warehouse inbound)"
              newWay="2–3 days after production (ships direct from China)"
            />
            <ComparisonRow
              label="When you pay tariffs"
              oldWay="Upfront on entire shipment — before you've sold a single unit"
              newWay="Per order, as customers buy — funded by incoming revenue"
            />
            <ComparisonRow
              label="Cash conversion"
              oldWay="Cash locked 3–5 months per cycle. You pay the factory and wait."
              newWay="Cash returns in weeks. With Net 45+, revenue often arrives before factory payment is due."
            />
            <ComparisonRow
              label="Scaling marketing"
              oldWay="Limited by cash tied up in transit inventory and bulk tariffs"
              newWay="Revenue flows back fast — continuously fund more ad spend"
            />
            <ComparisonRow
              label="Expanding to new regions"
              oldWay="Set up warehouse, customs broker, 3PL in each region. Months of overhead."
              newWay="One centralized hub ships globally. Launch a new market in days, not months."
            />
            <ComparisonRow
              label="Inventory risk"
              oldWay="Commit to large bulk orders. If demand shifts, you're stuck with dead stock."
              newWay="Smaller, faster batches. Test demand before going deep on inventory."
            />
          </div>

          {/* Watermark */}
          <div className="text-center">
            <span className="text-[10px] text-gray-700">portless.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
