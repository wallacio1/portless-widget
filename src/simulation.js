/**
 * Portless Cash Velocity Simulation — v3
 *
 * Core insight: same growth rate per cycle, but Portless cycles ~3.5x faster.
 * Compounding at higher frequency = dramatically more growth over 12 months.
 *
 * The math:
 *   Growth per cycle = f(CM, ROAS)
 *     - CM determines how much cash is available to reinvest each cycle
 *     - ROAS determines how effectively that cash generates new revenue
 *     - Higher CM = more to reinvest = faster growth (directly proportional)
 *     - Higher ROAS = each dollar works harder = faster growth
 *
 *   Portless: ~1 cycle/month (inventory sellable in days, cash returns fast)
 *   Traditional: ~1 cycle/3.5 months (ocean freight locks cash for months)
 *
 *   Net terms: longer terms let Portless overlap inventory orders
 *     (order next batch before paying for the first), raising the growth ceiling.
 *
 * Realism constraints:
 *   - Marketing takes ~3 weeks to convert (built into cycle time)
 *   - 4% monthly decay: rising CPAs, audience saturation, diminishing returns
 *   - Per-cycle growth capped at 35% (even the best brands can't 2x per cycle)
 */

function round2(n) {
  return Math.round(n * 100) / 100;
}

export function simulate(cm, roas, netTermsDays) {
  // ── Growth per reinvestment cycle ──
  //
  // "Excess return" = CM × (ROAS - 1)
  //   CM 50%, ROAS 3 → excess = 1.0 (each dollar invested returns $1 profit)
  //   CM 80%, ROAS 6 → excess = 4.0 (each dollar returns $4 profit)
  //   CM 20%, ROAS 1.5 → excess = 0.1 (each dollar returns $0.10 profit)
  //
  // Raised to ^0.7 for mild diminishing returns at extremes
  //   (a brand with 4x excess return doesn't grow 4x faster — there's friction)
  //
  // × 0.14 efficiency: accounts for overhead, marketing conversion lag (~3 weeks),
  //   inventory replenishment costs, imperfect execution
  //
  // Capped at 35% per cycle — even with perfect unit economics,
  //   you can't more than ~1.35x your revenue in a single inventory cycle.
  const rawExcess = cm * (roas - 1);
  const growthPerCycle = Math.min(Math.pow(Math.max(rawExcess, 0), 0.7) * 0.14, 0.35);

  // ── Cycle timing ──
  //
  // Traditional: 3.5 months per cycle
  //   Production overlap + 56d ocean freight + 7d customs/inbound + 21d marketing lag + 7d processing
  //   ≈ 91 days before cash starts returning → ~3 months effective cycle
  //   Plus time for sell-through to fund next batch → ~3.5 months
  //
  // Portless: ~1 month per cycle
  //   2d to warehouse + 21d marketing conversion lag + 7d processing ≈ 30 days
  //
  // Net terms reduce Portless effective cycle time:
  //   With Net 60+, you can order the next batch before paying for the first.
  //   Each 10 extra days of terms shaves ~0.04 months off the cycle.
  //   Floor at 0.75 months (can't cycle faster than ~3 weeks).
  const TRADITIONAL_CYCLE = 3.5;
  const portlessCycle = Math.max(0.75, 1.0 - (netTermsDays - 30) * 0.004);

  // ── Monthly growth rates ──
  //
  // Portless monthly growth = per-cycle growth / cycle time
  //   Shorter cycles → more compounding per month
  // Traditional monthly growth = per-cycle growth / 3.5
  //
  // Both lines use the same per-cycle growth (capped at 35%), so increasing
  // ROAS always benefits Portless at least as much as traditional.
  // The advantage comes purely from cycle speed.
  const portlessMonthly = growthPerCycle / portlessCycle;
  const traditionalMonthly = growthPerCycle / TRADITIONAL_CYCLE;

  // ── Month-by-month simulation ──
  //
  // 4% monthly decay represents real-world growth headwinds:
  //   - Rising CPAs as you exhaust core audiences
  //   - Ad fatigue and creative burnout
  //   - Market saturation and competition
  //   - Operational friction at scale
  const DECAY = 0.96;

  const data = [{ month: 0, portless: 1, traditional: 1 }];
  let pIdx = 1;
  let tIdx = 1;

  for (let m = 1; m <= 12; m++) {
    const d = Math.pow(DECAY, m - 1);

    pIdx *= (1 + portlessMonthly * d);
    tIdx *= (1 + traditionalMonthly * d);

    data.push({
      month: m,
      portless: round2(pIdx),
      traditional: round2(tIdx),
    });
  }

  return {
    data,
    multiplier: pIdx / tIdx,
  };
}
