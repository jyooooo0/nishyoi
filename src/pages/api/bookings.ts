/**
 * イベント申込みAPI。
 * 静的サイト内で唯一のサーバー処理(Cloudflare Pages Functionとして動く)。
 *
 * 保存: Firebase Firestore(REST API + 作成専用のセキュリティルール)
 * メール: FormSubmit(無料・アカウント登録不要) → 管理者宛て通知+申込者への自動返信
 *
 * 必要な環境変数(.env / Cloudflare Pagesの環境変数):
 * - FIREBASE_PROJECT_ID  FirebaseプロジェクトID
 * - FIREBASE_API_KEY     ウェブAPIキー(プロジェクトの設定 → 全般)
 * - OWNER_EMAIL          申込み通知の宛先(既定: jmfs24@gmail.com)
 *
 * セットアップ手順は firebase/README.md を参照。
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
  const projectId = env.FIREBASE_PROJECT_ID;
  const apiKey = env.FIREBASE_API_KEY;
  const owner = env.OWNER_EMAIL || 'jmfs24@gmail.com';

  if (!projectId || !apiKey) {
    return redirect(`${back}?error=unconfigured#apply`);
  }

  // 1) Firestoreへ保存(bookingsコレクション。ルールで作成のみ許可)
  const insert = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/bookings?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          created_at: { timestampValue: new Date().toISOString() },
          event_id: { stringValue: eventId },
          event_title: { stringValue: eventTitle },
          name: { stringValue: name },
          email: { stringValue: email },
          guests: { integerValue: String(guests) },
          message: { stringValue: message },
          status: { stringValue: 'pending' },
        },
      }),
    }
  );
  if (!insert.ok) {
    console.error('Firestore insert failed', insert.status, await insert.text());
    return redirect(`${back}?error=server#apply`);
  }

  // 2) メール送信(FormSubmit)。失敗しても申込み自体は成立させる
  //    - 管理者(owner)宛てに申込み内容の通知
  //    - _autoresponse で申込者(email)へ受付メール
  try {
    const send = await fetch(`https://formsubmit.co/ajax/${owner}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `【NISHYOI申込】${eventTitle} — ${name}様(${guests}名)`,
        _template: 'table',
        name,
        email,
        イベント: eventTitle,
        イベントID: eventId,
        人数: `${guests}名`,
        メッセージ: message || '(なし)',
        _autoresponse:
          `${name} 様\n\n以下のイベントへのお申込みを受け付けました。\n\n` +
          `イベント: ${eventTitle}\n人数: ${guests}名\n\n` +
          `集合場所などの詳細は、追ってこのメールアドレスへご案内します。\n` +
          `キャンセルやご質問は、このメールへの返信でお知らせください。\n\n` +
          `NISHYOI(にしょい)\nhttps://nishyoi.com/`,
      }),
    });
    if (!send.ok) console.error('FormSubmit failed', send.status, await send.text());
  } catch (e) {
    console.error('FormSubmit error', e);
  }

  return redirect(`${back}?sent=1#apply`);
};
