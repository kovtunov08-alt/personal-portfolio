export const SF_FLIP_MS = 82
export const SF_MIN_FLIPS = 5
export const SF_MAX_FLIPS = 10

export type FlipPlan = {
  flips: number
  durationMs: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Deterministic shuffle for settle-order chaos. */
export function shuffleIndices(count: number, seed = 0.5): number[] {
  const indices = Array.from({ length: count }, (_, i) => i)
  let state = Math.floor(seed * 1_000_000) + count * 17 + 1

  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 0x100000000
  }

  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1))
    const tmp = indices[i]!
    indices[i] = indices[j]!
    indices[j] = tmp
  }

  return indices
}

/**
 * All letters start together; settle order is shuffled for slight chaos.
 * Duration stays roughly in the 700–1000ms band for typical titles.
 */
export function buildFlipPlan(letterCount: number, seed = 0.5): FlipPlan[] {
  if (letterCount <= 0) return []

  const order = shuffleIndices(letterCount, seed)
  const plans: FlipPlan[] = Array.from({ length: letterCount }, () => ({
    flips: SF_MIN_FLIPS,
    durationMs: SF_MIN_FLIPS * SF_FLIP_MS,
  }))

  for (let rank = 0; rank < letterCount; rank++) {
    const letterIndex = order[rank]!
    const t = letterCount === 1 ? 0 : rank / (letterCount - 1)
    const noise = Math.abs(Math.sin((seed + 1) * (rank + 1) * 12.9898)) % 1
    const flips = clamp(
      Math.round(SF_MIN_FLIPS + t * (SF_MAX_FLIPS - SF_MIN_FLIPS) + (noise - 0.5) * 1.2),
      SF_MIN_FLIPS,
      SF_MAX_FLIPS,
    )
    plans[letterIndex] = { flips, durationMs: flips * SF_FLIP_MS }
  }

  return plans
}
