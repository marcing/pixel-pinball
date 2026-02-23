export const TW = 633, TH = 1140;
export const BALL_R = 12;
export const FLIPPER_LEN = 140, FLIPPER_W = 22;
export const TOTAL_LEVELS = 20;

// Scale factor — fixed at 1.5 (original 400x760 design)
export const S = 1.5;

// Progressive scoring: 150 (L1) → 1100 (L20), uniform 50-point increments
export function scoreForLevel(level) {
  return 150 + (level - 1) * 50;   // 150, 200, 250, ..., 1100
}
