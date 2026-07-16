/**
 * 二十四節気。開始日は年により±1日ずれるが、サイトの「現在地」表示には
 * 平均的な固定日で十分なため近似値を使う(天文学的な計算はしない)。
 */
export type Sekki = {
  index: number; // 0 = 立春
  name: string;
  reading: string;
  /** 開始日(月, 日) 近似 */
  start: [number, number];
  season: 'spring' | 'summer' | 'autumn' | 'winter';
};

export const SEKKI: Sekki[] = [
  { index: 0, name: '立春', reading: 'RISSHUN', start: [2, 4], season: 'spring' },
  { index: 1, name: '雨水', reading: 'USUI', start: [2, 19], season: 'spring' },
  { index: 2, name: '啓蟄', reading: 'KEICHITSU', start: [3, 5], season: 'spring' },
  { index: 3, name: '春分', reading: 'SHUNBUN', start: [3, 20], season: 'spring' },
  { index: 4, name: '清明', reading: 'SEIMEI', start: [4, 4], season: 'spring' },
  { index: 5, name: '穀雨', reading: 'KOKUU', start: [4, 20], season: 'spring' },
  { index: 6, name: '立夏', reading: 'RIKKA', start: [5, 5], season: 'summer' },
  { index: 7, name: '小満', reading: 'SHOMAN', start: [5, 21], season: 'summer' },
  { index: 8, name: '芒種', reading: 'BOSHU', start: [6, 5], season: 'summer' },
  { index: 9, name: '夏至', reading: 'GESHI', start: [6, 21], season: 'summer' },
  { index: 10, name: '小暑', reading: 'SHOSHO', start: [7, 7], season: 'summer' },
  { index: 11, name: '大暑', reading: 'TAISHO', start: [7, 22], season: 'summer' },
  { index: 12, name: '立秋', reading: 'RISSHU', start: [8, 7], season: 'autumn' },
  { index: 13, name: '処暑', reading: 'SHOSHO', start: [8, 23], season: 'autumn' },
  { index: 14, name: '白露', reading: 'HAKURO', start: [9, 7], season: 'autumn' },
  { index: 15, name: '秋分', reading: 'SHUBUN', start: [9, 23], season: 'autumn' },
  { index: 16, name: '寒露', reading: 'KANRO', start: [10, 8], season: 'autumn' },
  { index: 17, name: '霜降', reading: 'SOKO', start: [10, 23], season: 'autumn' },
  { index: 18, name: '立冬', reading: 'RITTO', start: [11, 7], season: 'winter' },
  { index: 19, name: '小雪', reading: 'SHOSETSU', start: [11, 22], season: 'winter' },
  { index: 20, name: '大雪', reading: 'TAISETSU', start: [12, 7], season: 'winter' },
  { index: 21, name: '冬至', reading: 'TOJI', start: [12, 21], season: 'winter' },
  { index: 22, name: '小寒', reading: 'SHOKAN', start: [1, 5], season: 'winter' },
  { index: 23, name: '大寒', reading: 'DAIKAN', start: [1, 20], season: 'winter' },
];

/** 指定日(既定: 今日)の節気を返す */
export function currentSekki(date: Date = new Date()): Sekki {
  const key = (m: number, d: number) => m * 100 + d;
  const today = key(date.getMonth() + 1, date.getDate());
  // 暦日順(小寒1/5 → 冬至12/21)に並べ、開始日を過ぎている最後の節気を取る
  const byDate = [...SEKKI].sort((a, b) => key(...a.start) - key(...b.start));
  let found: Sekki | undefined;
  for (const s of byDate) {
    if (key(...s.start) <= today) found = s;
  }
  // 1/1〜1/4 は前年12/21からの冬至期間
  return found ?? SEKKI[21]!;
}
