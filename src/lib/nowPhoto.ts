/**
 * 「いまの頃の関川」— 手持ち写真の撮影日(EXIFで確認済み)から、
 * ビルド時点の日付にいちばん近い季節の1枚を選ぶ。
 * 写真が増えたらここに行を足すだけでよい。
 */
import type { ImageMetadata } from 'astro';
import heroSummer from '../assets/photos/hero-summer.jpg';
import workForest from '../assets/photos/work-forest.jpg';
import recordInaboshi from '../assets/photos/record-inaboshi.jpg';
import heroAutumn from '../assets/photos/hero-autumn.jpg';
import duskAlpenglow from '../assets/photos/dusk-alpenglow.jpg';
import firewoodRack from '../assets/photos/firewood-rack.jpg';
import snowField from '../assets/photos/snow-field.jpg';
import heroEarlySpring from '../assets/photos/hero-earlyspring.jpg';

export type SeasonPhoto = {
  month: number;
  day: number;
  img: ImageMetadata;
  caption: string;
  /** 撮影日の表示 */
  taken: string;
  alt: string;
};

export const SEASON_PHOTOS: SeasonPhoto[] = [
  { month: 6, day: 11, img: heroSummer, caption: '川沿いの緑', taken: '2025.06.11', alt: '初夏の関川。緑に覆われた山あいの家々のあいだを川が流れる' },
  { month: 6, day: 29, img: workForest, caption: '山の仕事', taken: '2025.06.29', alt: '夏草の茂る山際で、伐った枝を運ぶ作業の手元' },
  { month: 9, day: 18, img: recordInaboshi, caption: '稲干しの頃', taken: '2025.09.18', alt: '軒先に稲を干した集落の家' },
  { month: 10, day: 26, img: heroAutumn, caption: '霧の朝', taken: '2025.10.26', alt: '霧のかかった山と関川の家並み' },
  { month: 11, day: 20, img: duskAlpenglow, caption: '夕暮れの山', taken: '2025.11.20', alt: '夕日に染まる山と暮れていく集落' },
  { month: 12, day: 23, img: firewoodRack, caption: '薪の冬支度', taken: '2025.12.23', alt: '水路のわきに積み上げられた薪の棚' },
  { month: 1, day: 10, img: snowField, caption: '雪原の足あと', taken: '2026.01.10', alt: '雪に覆われた田んぼに残る動物の足あと' },
  { month: 3, day: 22, img: heroEarlySpring, caption: '雪解け', taken: '2026.03.22', alt: '雪解けの進む集落と、雪の重みで潰れた小屋の屋根' },
];

/** 日付の近さ(円環の日数差)で1枚選ぶ */
export function nowPhoto(date: Date = new Date()): SeasonPhoto {
  const doy = (m: number, d: number) => Math.floor(((m - 1) * 30.44 + d) % 365);
  const today = doy(date.getMonth() + 1, date.getDate());
  let best = SEASON_PHOTOS[0]!;
  let bestDist = Infinity;
  for (const p of SEASON_PHOTOS) {
    const diff = Math.abs(doy(p.month, p.day) - today);
    const dist = Math.min(diff, 365 - diff);
    if (dist < bestDist) {
      bestDist = dist;
      best = p;
    }
  }
  return best;
}
