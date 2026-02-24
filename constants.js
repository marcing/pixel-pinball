export const TW = 633, TH = 1140;
export const BALL_R = 12;
export const FLIPPER_LEN = 140, FLIPPER_W = 22;
export const TOTAL_LEVELS = 20;

// Scale factor — fixed at 1.5 (original 400x760 design)
export const S = 1.5;

// Progressive scoring: 150 (L1) → 1000 (L20)
// L1-L5: +25 increments, L6-L20: +50 increments
export function scoreForLevel(level) {
  if (level <= 5) return 150 + (level - 1) * 25;   // 150, 175, 200, 225, 250
  return 250 + (level - 5) * 50;                    // 300, 350, ..., 1000
}
