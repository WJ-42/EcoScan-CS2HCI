export const TEXT_SCALE_NORMAL = 1;
export const TEXT_SCALE_LARGE = 1.2;

export const TOUCH_TARGET_MIN = 44;
export const TOUCH_TARGET_LARGE = 56;

export function scaleFontSize(base: number, largerText: boolean): number {
  return largerText ? Math.round(base * TEXT_SCALE_LARGE) : base;
}

export function getMinTouchTarget(largerTouchTargets: boolean): number {
  return largerTouchTargets ? TOUCH_TARGET_LARGE : TOUCH_TARGET_MIN;
}
