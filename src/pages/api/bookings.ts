/**
 * イベント申込みAPI。
 * 静的サイト内で唯一のサーバー処理(Cloudflare Pages Functionとして動く)。
 *
 * 必要な環境変数(.env / Cloudflare Pagesの環境変数):
 * - SUPABASE_URL              SupabaseプロジェクトURL
 * - SUPABASE_SERVICE_ROLE_KEY service_roleキー(サーバー専用。公開しない)
 * - RESEND_API_KEY            Resend APIキー(確認メール送信)
 * - RESEND_FROM_EMAIL         送信元 例: NISHYOI <info@nishyoi.com>
 * - OWNER_EMAIL               管理者通知の宛先
 *
 * 未設定の間は「準備中」としてエラーを返す(フォーム自体は表示される)。
 */
import type { APIRoute } from 'astro';

export const prerender = false;

type Env = Record<string, string | undefined>;

function getEnv(locals: App.Locals): Env {
  // Cloudflareランタイム → import.meta.env(ローカルdev) の順で読む
  const runtime = (locals as { runtime?: { env?: Env } }).runtime;
  return { ...(import.meta.env as unknown as Env), ...(runtime?.env ?? {}) };
}

function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const form = await request.formData();

  const eventId = String(form.get('event_id') ?? '').slice(0, 100);
  const eventTitle = String(form.get('event_title') ?? '').slice(0, 200);
  const name = String(form.get('name') ?? '').trim().slice(0, 100);
  const email = String(form.get('email') ?? '').trim().slice(0, 200);
  const guests = Math.min(Math.max(parseInt(String(form.get('guests') ?? '1'), 10) || 1, 1), 9);
  const message = String(form.get('message') ?? '').trim().slice(0, 2000);
  const consent = form.get('consent') === 'on';
  // ハニーポット(botはこの不可視欄を埋める)
  const trap = String(form.get('website') ?? '');

  const back = `/events/${encodeURIComponent(eventId)}/`;

  if (trap) return redirect(`${back}?sent=1#apply`); // botには成功したふりをする
  if (!eventId || !name || !email || !consent || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return redirect(`${back}?error=input#apply`);
  }

  const env = getEnv(locals);
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, RESEND_FROM_EMAIL, OWNER_EMAIL } = env;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return redirect(`${back}?error=unconfigured#apply`);
  }

  // 1) Supabaseへ保存
  const insert = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ event_id: eventId, event_title: eventTitle, name, email, guests, message }),
  });
  if (!insert.ok) {
    console.error('Supabase insert failed', insert.status, await insert.text());
    return redirect(`${back}?error=server#apply`);
  }

  // 2) 確認メール(失敗しても申込み自体は成立させる)
  if (RESEND_API_KEY && RESEND_FROM_EMAIL) {
    const send = (to: string, subject: string, text: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: RESEND_FROM_EMAIL, to: [to], subject, text }),
      }).catch((e) => console.error('Resend failed', e));

    await Promise.all([
      send(
        email,
        `【NISHYOI】お申込みを受け付けました — ${eventTitle}`,
        `${name} 様\n\n以下のイベントへのお申込みを受け付けました。\n\nイベント: ${eventTitle}\n人数: ${guests}名\n\n集合場所などの詳細は、追ってこのメールアドレスへご案内します。\nキャンセルやご質問は、このメールへの返信でお知らせください。\n\nNISHYOI(にしょい)\nhttps://nishyoi.com/`
      ),
      OWNER_EMAIL
        ? send(
            OWNER_EMAIL,
            `【申込】${eventTitle} — ${name}様(${guests}名)`,
            `イベント: ${eventTitle} (${eventId})\n名前: ${name}\nメール: ${email}\n人数: ${guests}\nメッセージ:\n${message || '(なし)'}`
          )
        : Promise.resolve(),
    ]);
  }

  return redirect(`${back}?sent=1#apply`);
};
