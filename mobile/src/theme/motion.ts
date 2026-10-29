/**
 * Shared motion language. Springs feel native (iOS-like) and are reused across
 * press feedback, entrances, and transitions so the whole app moves as one.
 */
export const spring = {
  /** Default UI motion — settled, confident. */
  gentle: { damping: 18, stiffness: 180, mass: 1 },
  /** Quick reactions — chips, toggles, small reveals. */
  snappy: { damping: 20, stiffness: 320, mass: 0.8 },
  /** Button/press feedback — tight and immediate. */
  press: { damping: 15, stiffness: 420, mass: 0.6 },
} as const;

export const duration = {
  fast: 160,
  base: 240,
  slow: 420,
} as const;

/** Scale a pressable collapses to while held. */
export const PRESS_SCALE = 0.97;

/** Base delay step for staggered entrance sequences (ms). */
export const STAGGER = 70;
