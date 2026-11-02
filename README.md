# The Thomlinson Consultancy website

Static site for Cloudflare, with one small Worker route for the newsletter sign-up.
Built the same way as the iCan Thinking site: same structure, same self-hosted Comfortaa typeface, no cookies (so no cookie banner), same deploy steps.

```
public/      the website (this is what Cloudflare serves)
functions/   api/subscribe.js - the newsletter sign-up handler
worker/      index.js - serves the site and routes /api/subscribe to the handler
scripts/     go-live.mjs - switches from staging to live
```

## 1. Put it on Cloudflare (staging first)

The site starts in **staging mode**: every page is sent with `noindex`, robots.txt blocks crawlers and each page carries a "Preview site" strip. Nothing can appear in Google until you go live.

**Option A - GitHub (recommended, updates itself)**
1. Push this folder to a private GitHub repo.
2. Cloudflare dashboard > Workers & Pages > Create > Import a repository. Pick the repo.
3. Project name `thomlinson-consultancy-site` (it must match `name` in `wrangler.toml`). Build command: leave empty. Deploy command: `npx wrangler deploy`. Root directory: leave empty.
4. Deploy. You get a `something.workers.dev` address to review the site on.

**Option B - upload from your computer**
1. Install Node.js, then in this folder run `npm install` and `npx wrangler login`.
2. Run `npm run deploy`.

## 2. Turn on the newsletter sign-up

1. In MailerLite, make a group for the consultancy newsletter and note its group ID.
2. In Cloudflare: your project > Settings > Variables and Secrets:
   - `MAILERLITE_API_KEY` (as a Secret): your MailerLite token
   - `MAILERLITE_GROUPS` (text): `{"default":"111","newsletter":"111"}`
   - Optional: `RESEND_API_KEY` (Secret) to email you each sign-up. `NOTIFY_TO` and `NOTIFY_FROM` default to info@ and hello@thethomlinsonconsultancy.com.
3. Redeploy, then test with your own email. Until the key is added the form shows an honest "not switched on yet" message.

## 3. Connect thethomlinsonconsultancy.com

1. Project > Settings > Domains & Routes > Add > Custom domain: add `thethomlinsonconsultancy.com` and `www.thethomlinsonconsultancy.com`.
2. If the domain is not on Cloudflare yet, add it (Add a site) and change the nameservers at your registrar. Copy across any DNS records you need first.
3. Add a redirect from www to the main address: Rules > Redirect Rules > `www.thethomlinsonconsultancy.com/*` to `https://thethomlinsonconsultancy.com/$1` (301).
4. SSL/TLS > Full (strict).
5. Set up the mailbox `info@thethomlinsonconsultancy.com` (or forward it) before going live, because the site, the privacy policy and the sign-up emails use it.

## 4. Retire marcusthomlinson.com (do this last)

Once the new site is live, send visitors from the old domain to the new one without losing search ranking:
- Cloudflare > marcusthomlinson.com > Rules > Redirect Rules (or Bulk Redirects): `marcusthomlinson.com/*` and `www.marcusthomlinson.com/*` to `https://thethomlinsonconsultancy.com/$1` with a 301 status. Page paths are kept the same where possible (`/about-marcus/`, `/mindset-coaching/`, `/business-growth-coaching/`, `/executive-leadership-coaching/`, `/reviews/`, `/contact-and-booking/`). The old MATAYO pages are redirected inside `public/_redirects`.
- **Do not remove the DNS records for `bookings.marcusthomlinson.com` or the email (MX) records.** The booking page on this site is embedded from `bookings.marcusthomlinson.com`, and the iCan Thinking site uses the same booking system.

## 5. Before going live

Search the site for `[[TODO` and fix every one (go-live checks for these):
- `public/privacy-policy/index.html`: confirm the legal entity, address and ICO number, the providers and the review date, and have the text reviewed.

Check these by eye as well:
- Prices on the Speaker Training Day page, and the next dates once you have them.
- The email address `info@thethomlinsonconsultancy.com` is live.

Then run:

```
node scripts/go-live.mjs --dry-run
node scripts/go-live.mjs
```

It removes the noindex header, swaps in the live robots.txt (which welcomes search and AI crawlers) and removes the preview strip. Commit, deploy, then submit `https://thethomlinsonconsultancy.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

## How it connects to iCan Thinking

This is the affiliate-style site for iCan Thinking. Prices for every iCan level, the courses and the app live at icanthinking.com, and this site links there instead of repeating them, so there is only one place to keep up to date.

## Local preview
`npm install` then `npm run dev` (add a `.dev.vars` file, see `.dev.vars.example`, to test the form).
