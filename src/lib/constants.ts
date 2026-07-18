/** イベント・Journal共通の定数(content.config とページの両方から使う) */

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

export const JOURNAL_CATEGORIES = [
  '季節と手仕事',
  '動物と暮らし',
  '田舎とテクノロジー',
  '山の恵み',
  '集落の記録',
  '写真と映像',
] as const;
