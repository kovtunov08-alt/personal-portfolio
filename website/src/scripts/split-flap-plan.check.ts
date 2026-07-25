import {
  buildFlipPlan,
  shuffleIndices,
  SF_FLIP_MS,
  SF_MAX_FLIPS,
  SF_MIN_FLIPS,
} from './split-flap-plan'

const plan = buildFlipPlan(8, 0.42)
if (plan.length !== 8) throw new Error(`expected 8 letters, got ${plan.length}`)

for (const item of plan) {
  if (item.flips < SF_MIN_FLIPS || item.flips > SF_MAX_FLIPS) {
    throw new Error(`flips out of range: ${item.flips}`)
  }
  if (item.durationMs !== item.flips * SF_FLIP_MS) {
    throw new Error(`duration mismatch for ${item.flips} flips`)
  }
}

const durations = plan.map((item) => item.durationMs)
const maxDuration = Math.max(...durations)
const minDuration = Math.min(...durations)
if (minDuration < SF_MIN_FLIPS * SF_FLIP_MS) {
  throw new Error(`min duration too short: ${minDuration}`)
}
if (maxDuration < 700 || maxDuration > 1000) {
  throw new Error(`max duration ${maxDuration}ms outside 700–1000ms`)
}

const order = shuffleIndices(8, 0.42)
const isIdentity = order.every((value, index) => value === index)
if (isIdentity) throw new Error('expected shuffled settle order, got identity')

const isStrictLTR = durations.every((duration, index, list) => index === 0 || duration >= list[index - 1]!)
if (isStrictLTR) throw new Error('expected non-L→R settle chaos for seed 0.42')

console.log(
  `split-flap plan ok: min=${minDuration}ms max=${maxDuration}ms order=${order.join(',')}`,
)
