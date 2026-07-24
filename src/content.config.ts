import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { JOURNAL_CATEGORIES } from './lib/constants';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/events' }),
  schema: ({ image }) => z.object({
    /** イベント写真(src/assets内を相対パスで指定) */
    image: image().optional(),
    imageAlt: z.string().optional(),
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

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/journal' }),
  schema: ({ image }) => z.object({
    /** 記事メイン写真(src/assets内を相対パスで指定) */
    image: image().optional(),
    imageAlt: z.string().optional(),
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

/** noteの記事引用(サイト内Journalとは別の、note掲載記事の紹介) */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/notes' }),
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    date: z.coerce.date().optional(),
    /** 記事からの短い引用文 */
    excerpt: z.string().optional(),
    /** trueの間は本番ビルドに含めない */
    draft: z.boolean().default(false),
  }),
});

/** 興味本位でつくったホームページ(仕事のWorksとは別枠) */
const labs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/labs' }),
  schema: z.object({
    title: z.string(),
    url: z.string().url().optional(),
    year: z.number().optional(),
    description: z.string(),
    /** trueの間は本番ビルドに含めない(URL未確定など) */
    draft: z.boolean().default(false),
  }),
});

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/works' }),
  schema: z.object({
    title: z.string(),
    /** 一言でわかる業種・種別 例: フラワーショップ */
    kind: z.string().optional(),
    year: z.number().optional(),
    url: z.string().url().optional(),
    /** 担当範囲 */
    roles: z.array(z.string()).default([]),
    summary: z.string(),
    /** クライアントの掲載許可が確認できるまで false のまま */
    published: z.boolean().default(false),
  }),
});

export const collections = { events, journal, works, notes, labs };
