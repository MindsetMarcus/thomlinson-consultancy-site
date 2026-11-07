// Cloudflare Worker route: POST /api/enquiry
// Emails the enquiry from the website form to you, using Resend. Nothing is stored, and your address is never shown on the site.
//
// Settings (Workers > Settings > Variables and Secrets):
//   RESEND_API_KEY  (secret)  your Resend API key
//   NOTIFY_TO       (text)    the address that receives enquiries, e.g. marcus@marcusthomlinson.com
//   NOTIFY_FROM     (text, optional) sender; defaults to "The Thomlinson Consultancy <hello@thethomlinsonconsultancy.com>"
//                   (the domain must be verified in Resend)

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('Origin');
  const self = new URL(request.url).origin;
  if (origin && origin !== self) return json({ error: 'forbidden', message: 'Sorry, that did not work.' }, 403);

  let b;
  try { b = await request.json(); } catch { return json({ error: 'bad_request', message: 'Please try again.' }, 400); }

  // Spam traps: bots fill the hidden field, or submit faster than a person can. Pretend success.
  if (b.company) return json({ ok: true });
  if (typeof b.elapsed === 'number' && b.elapsed < 3000) return json({ ok: true });

  const name = String(b.name || '').trim().slice(0, 100);
  const email = String(b.email || '').trim().slice(0, 200);
  const phone = String(b.phone || '').trim().slice(0, 40);
  const topic = String(b.topic || '').trim().slice(0, 80);
  const message = String(b.message || '').trim().slice(0, 4000);
  if (!name) return json({ error: 'invalid', message: 'Please add your name.' }, 422);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ error: 'invalid', message: 'Please check your email address.' }, 422);
  if (message.length < 5) return json({ error: 'invalid', message: 'Please add a short message.' }, 422);
  if (b.consent !== true) return json({ error: 'consent', message: 'Please tick the box so we know you are happy for us to reply.' }, 422);
  // Links in the message are the most common spam signal. Allow one at most.
  if ((message.match(/https?:\/\//gi) || []).length > 1) return json({ ok: true });

  if (!env.RESEND_API_KEY || !env.NOTIFY_TO) return json({ error: 'not_configured', message: 'Sorry, the enquiry form is not switched on yet. Please call us instead.' }, 503);

  const from = env.NOTIFY_FROM || 'The Thomlinson Consultancy <hello@thethomlinsonconsultancy.com>';
  const html = `<p><strong>New website enquiry</strong></p>` +
    `<p>Name: ${esc(name)}<br>Email: ${esc(email)}<br>Phone: ${esc(phone || 'not given')}<br>Interested in: ${esc(topic || 'not given')}</p>` +
    `<p>${esc(message).replace(/\n/g, '<br>')}</p>`;
  let r;
  try {
    r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.RESEND_API_KEY },
      body: JSON.stringify({ from, to: [env.NOTIFY_TO], reply_to: email, subject: `Website enquiry: ${name} (${topic || 'general'})`, html }),
    });
  } catch {
    return json({ error: 'upstream', message: 'Sorry, something went wrong on our side. Please try again in a moment.' }, 502);
  }
  if (!r.ok) return json({ error: 'upstream', message: 'Sorry, something went wrong on our side. Please try again in a moment.' }, 502);
  return json({ ok: true });
}

export const onRequest = () => json({ error: 'method_not_allowed' }, 405);
