/**
 * お問い合わせフォームの送信先。FormSubmit経由でOWNER_EMAILへ届き、
 * 送信者には受付の自動返信を送る(保存はしない)。
 */
import type { APIRoute } from 'astro';

export const prerender = false;

type Env = Record<string, string | undefined>;

function getEnv(locals: App.Locals): Env {
  const runtime = (locals as { runtime?: { env?: Env } }).runtime;
  return { ...(import.meta.env as unknown as Env), ...(runtime?.env ?? {}) };
}

function redirect(location: string): Response {
  return new Response(null, { status: 303, headers: { Location: location } });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const form = await request.formData();
  const kind = String(form.get('kind') ?? 'その他').slice(0, 50);
  const name = String(form.get('name') ?? '').trim().slice(0, 100);
  const email = String(form.get('email') ?? '').trim().slice(0, 200);
  const org = String(form.get('org') ?? '').trim().slice(0, 200);
  const message = String(form.get('message') ?? '').trim().slice(0, 4000);
  const consent = form.get('consent') === 'on';
  const trap = String(form.get('website') ?? '');

  if (trap) return redirect('/contact/?sent=1');
  if (!name || !email || !message || !consent || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return redirect('/contact/?error=input');
  }

  const owner = getEnv(locals).OWNER_EMAIL || 'jmfs24@gmail.com';

  try {
    const send = await fetch(`https://formsubmit.co/ajax/${owner}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Origin: 'https://nishyoi.com',
        Referer: 'https://nishyoi.com/contact/',
      },
      body: JSON.stringify({
        _subject: `【NISHYOI問い合わせ/${kind}】${name}様`,
        _template: 'table',
        name,
        email,
        種別: kind,
        組織名: org || '(なし)',
        本文: message,
        _autoresponse:
          `${name} 様\n\nお問い合わせを受け付けました。\n内容を確認のうえ、数日以内にご返信します。\n\nNISHYOI(にしょい)\nhttps://nishyoi.com/`,
      }),
    });
    if (!send.ok) {
      console.error('FormSubmit failed', send.status, await send.text());
      return redirect('/contact/?error=server');
    }
  } catch (e) {
    console.error('FormSubmit error', e);
    return redirect('/contact/?error=server');
  }

  return redirect('/contact/?sent=1');
};
