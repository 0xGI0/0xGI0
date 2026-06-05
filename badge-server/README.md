# badge-server

A tiny, self-hosted, **shields.io-compatible** static badge service.

It is a drop-in replacement for the two external badge hosts used in the
profile README:

- `https://img.shields.io/badge/...`
- `https://custom-icon-badges.demolab.com/badge/...`

The URL grammar, query parameters (`style`, `logo`, `logoColor`, `label`,
`labelColor`, `color`) and the optional `.svg` suffix are identical, so
migrating is just a host swap — nothing else in the URLs changes.

Logos are rendered from:

- [`simple-icons`](https://simple-icons.org) — the same icon set shields.io uses
- [`@primer/octicons`](https://primer.style/octicons) — for logos simple-icons
  doesn't have (`device-desktop`, `server`, `terminal`, `code`, …), which is
  exactly what `custom-icon-badges` was being used for.

No database and **no Upstash/Redis** is needed — every badge here is static.

## How it works

```
/badge/<label>-<message>-<color>?style=plastic&logo=linux&logoColor=black
```

- `_`  → space  (`Active_Directory` → "Active Directory")
- `__` → literal underscore
- `--` → literal dash
- a trailing `.svg` is accepted and ignored

Rendering is done by the official [`badge-maker`](https://www.npmjs.com/package/badge-maker)
package (the same engine behind shields.io), so the output is visually
identical, including the `plastic` style used throughout the README.

## Deploy to Vercel

This repository is a self-contained Vercel project (everything lives at the
repo root).

### Option A — Vercel dashboard

1. In Vercel: **Add New… → Project → Import** this repository.
2. **Root Directory:** leave as `.` (the repo root).
3. Framework preset: **Other**. No build command needed.
4. Deploy. You'll get a domain like `https://your-badges.vercel.app`.

### Option B — Vercel CLI

```bash
npx vercel        # preview deploy
npx vercel --prod # production deploy
```

### Verify

Open these in a browser (replace the host with your domain):

```
https://YOUR-DOMAIN/badge/Linux-FCC624?style=plastic&logo=linux&logoColor=black
https://YOUR-DOMAIN/badge/Windows-0078D6.svg?style=plastic&logo=device-desktop&logoColor=white
```

The root page (`https://YOUR-DOMAIN/`) shows live examples.

## Point the README at your service

Once deployed, run the helper against your **profile** repo's README (clone it
first, then point the script at its README):

```bash
./swap-readme.sh your-badges.vercel.app /path/to/profile-repo/README.md
```

It rewrites every `img.shields.io` and `custom-icon-badges.demolab.com` badge
URL to your domain and writes a `README.md.bak` backup. Review the diff, then
commit the profile repo.

## Local development / tests

```bash
npm install
npm test          # renders every badge used in the profile README
npx vercel dev    # serve locally at http://localhost:3000
```

## Adding new badges later

Just use the shields.io syntax against your domain. If you need a logo that
isn't in simple-icons, add its Octicon name to `OCTICON_LOGOS` in
`lib/render.js`.
