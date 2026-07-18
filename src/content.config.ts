import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * 予約状態:
 * draft=下書き / soon=受付予定 / open=受付中 / full=満席 /
 * closed=受付終了 / cancelled=中止 / ended=終了
 */
export const EVENT_STATUS = {
  draft: '下書き',
  soon: '受付予定',
  open: '受付中',
  full: '満席',
  closed: '受付終了',
  cancelled: '中止',
  ended: '終了',
} as const;

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/events' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** 所要時間(分) */
    durationMinutes: z.number().optional(),
    /** 対象 例: どなたでも / 中学生以上 */
    audience: z.string().optional(),
    capacity: z.number(),
    /** 残席。未指定なら表示しない(手動更新運用) */
    remaining: z.number().optional(),
    /** 料金表示 例: "3,000円" 未確定なら省略 */
    fee: z.string().optional(),
    status: z.enum(['draft', 'soon', 'open', 'full', 'closed', 'cancelled', 'ended']),
    /** おおよその地域(正確な集合場所は申込者のみに通知) */
    area: z.string().default('山形県鶴岡市関川周辺'),
    summary: z.string(),
    /** 関連する節気名(フォトウォーク等) */
    sekki: z.string().optional(),
  }),
});

export const JOURNAL_CATEGORIES = [
  '季節と手仕事',
  '動物と暮らし',
  '田舎とテクノロジー',
  '山の恵み',
  '集落の記録',
  '写真と映像',
] as const;

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/journal' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    /** 更新日(本文を大きく直した時のみ) */
    updated: z.coerce.date().optional(),
    category: z.enum(JOURNAL_CATEGORIES),
    sekki: z.string().optional(),
    tags: z.array(z.string()).default([]),
    summary: z.string(),
    /** 使用した技術・道具 */
    tools: z.array(z.string()).default([]),
    /** noteの詳細記事など外部リンク */
    noteUrl: z.string().url().optional(),
    /** trueの間は本番ビルドに含めない(仮記事・執筆中) */
    draft: z.boolean().default(false),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/works' }),
  schema: z.object({
    title: z.string(),
    year: z.number(),
    url: z.string().url().optional(),
    /** 担当範囲 */
    roles: z.array(z.string()).default([]),
    summary: z.string(),
    /** クライアントの掲載許可が確認できるまで false のまま */
    published: z.boolean().default(false),
  }),
});

export const collections = { events, journal, works };
