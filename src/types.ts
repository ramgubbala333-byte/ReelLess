export type PlatformId = 'instagram' | 'youtube' | 'facebook' | 'snapchat';

export interface PlatformInfo {
  id: PlatformId;
  label: string;
  short: string;
  color: string;
  deep: string;
}

export const PLATFORMS: PlatformInfo[] = [
  { id: 'instagram', label: 'Instagram', short: 'IG', color: '#D97B4F', deep: '#4A2C1E' },
  { id: 'youtube', label: 'YouTube', short: 'YT', color: '#C6502E', deep: '#452017' },
  { id: 'facebook', label: 'Facebook', short: 'FB', color: '#7C93B8', deep: '#26303F' },
  { id: 'snapchat', label: 'Snapchat', short: 'SC', color: '#E8C33D', deep: '#4A3D16' },
];

export type PlatformCounts = Record<PlatformId, number>;

export interface DayRecord {
  date: string; // yyyy-mm-dd, local
  total: number;
  byPlatform: PlatformCounts;
}

export function emptyPlatformCounts(): PlatformCounts {
  return { instagram: 0, youtube: 0, facebook: 0, snapchat: 0 };
}
