-- NISHYOI イベント申込みテーブル
-- Supabaseダッシュボード → SQL Editor で実行する

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_id text not null,
  event_title text,
  name text not null,
  email text not null,
  guests integer not null default 1,
  message text,
  -- pending(受付) / confirmed(確定) / cancelled(キャンセル)
  status text not null default 'pending'
);

create index if not exists bookings_event_id_idx on bookings (event_id);
create index if not exists bookings_created_at_idx on bookings (created_at);

-- RLS: APIはservice_roleキーで書き込むため、匿名アクセスは全て拒否
alter table bookings enable row level security;
