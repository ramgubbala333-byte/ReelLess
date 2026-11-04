import { PLATFORMS, PlatformId } from './types';
import { seededRandom } from './utils';

export interface ReelCard {
  id: string;
  platform: PlatformId;
  handle: string;
  caption: string;
  topic: string;
  panelColor: string;
  accentColor: string;
  likes: string;
  comments: string;
}

const TOPICS: Array<{ topic: string; captions: string[]; color: string; deep: string }> = [
  {
    topic: 'Street food',
    captions: ['rating every taco truck on this block', 'the crunch on this is unreal', 'POV: the vendor knows your order'],
    color: '#8A4B2A',
    deep: '#3A2113',
  },
  {
    topic: 'Skate clips',
    captions: ['landed it on the 40th try, no notes', 'this line took all summer', 'watch the board, not the feet'],
    color: '#5B6E46',
    deep: '#27301E',
  },
  {
    topic: 'Desk setups',
    captions: ['cable management final boss', 'the before and after nobody asked for', 'three monitors, zero excuses'],
    color: '#4E5D75',
    deep: '#232B38',
  },
  {
    topic: 'Dog content',
    captions: ['he waits like this every single day', 'zoomies: a documentary', 'the side eye is generational'],
    color: '#97743A',
    deep: '#403114',
  },
  {
    topic: 'Dance trends',
    captions: ['day 12 of learning this choreo', 'the transition is the whole video', 'nobody is ready for the drop'],
    color: '#7A4460',
    deep: '#38202C',
  },
  {
    topic: 'Travel cuts',
    captions: ['this train window view broke me', '48 hours in the mountains, zero signal', 'the market opens at 5am and so did we'],
    color: '#3F6B63',
    deep: '#1D332E',
  },
  {
    topic: 'Gym form',
    captions: ['your squat is fine, your shoes are not', '60 seconds that fix your deadlift', 'the last rep tells the truth'],
    color: '#6E3B2E',
    deep: '#331D16',
  },
  {
    topic: 'Comedy sketches',
    captions: ['when the group chat plans a trip', 'POV: mom found the report card', 'the meeting could have been this video'],
    color: '#77653A',
    deep: '#362D18',
  },
];

const HANDLES = [
  '@marco.eats', '@sk8.lena', '@deskanddone', '@golden.hour.pup', '@mia.moves',
  '@trailnotes', '@formcheckfred', '@thearchanaShow', '@quiet.frames', '@loop.legend',
  '@sana.studies', '@bassline.ben', '@tiny.kitchen', '@orbit.cam', '@nina.naps',
];

export function buildReelDeck(count: number, sessionSeed: string): ReelCard[] {
  const cards: ReelCard[] = [];
  for (let i = 0; i < count; i++) {
    const seed = `${sessionSeed}-${i}`;
    const topic = TOPICS[Math.floor(seededRandom(seed + 't') * TOPICS.length)];
    const platform = PLATFORMS[Math.floor(seededRandom(seed + 'p') * PLATFORMS.length)];
    const caption = topic.captions[Math.floor(seededRandom(seed + 'c') * topic.captions.length)];
    const handle = HANDLES[Math.floor(seededRandom(seed + 'h') * HANDLES.length)];
    cards.push({
      id: `reel-${i}`,
      platform: platform.id,
      handle,
      caption,
      topic: topic.topic,
      panelColor: topic.color,
      accentColor: topic.deep,
      likes: `${(1 + seededRandom(seed + 'l') * 240).toFixed(1)}K`,
      comments: `${Math.floor(12 + seededRandom(seed + 'k') * 900)}`,
    });
  }
  return cards;
}
