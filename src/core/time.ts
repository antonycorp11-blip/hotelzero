export const START_MINUTE = 23 * 60 + 40;
export const CRITICAL_MINUTE = 24 * 60 + 20;

export const formatTime = (absoluteMinute: number): string => {
  const minute = absoluteMinute % (24 * 60);
  return `${Math.floor(minute / 60).toString().padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')}`;
};
