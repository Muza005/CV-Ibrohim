# Ibrohim Sirojiddinov: backend engineer portfolio

A multi-page portfolio for **Ibrohim Sirojiddinov**, Backend Software Engineer (Node.js) in Tashkent, Uzbekistan.

The design follows the dark "developer workspace" style of the DevPro portfolio template (GitHub-dark colours, green accents, Fira Code headings, terminal windows), rebuilt from scratch for a **backend** profile. It is plain HTML, CSS and vanilla JavaScript: no framework, no build step, and it is ready to deploy on Vercel.

## Pages

| File | Contents |
| --- | --- |
| `index.html` | Hero with an animated backend workspace (neofetch-style terminal, Fastify code on the laptop), tech-stack marquee, About with a live API log, "Ready to Collaborate?" ring, latest projects, blog, reviews and a contact form |
| `about.html` | Profile and bio, key numbers, `package.json` and `/api/v1/me` terminals, how a request flows through the backend, experience and education as a `git log` |
| `services.html` | Eight backend services written as terminal commands, the working process and ways to work together (no pricing) |
| `projects.html` | M-System (featured, in production), B2B Ticket & Appeals Module, OTP-based 2FA and the Task Management Application |
| `blog.html`, `posts/*.html` | Six articles based on the CV, with a working category filter |
| `reviews.html` | Feedback cards and a "Leave a review" email button |
| `contact.html` | Contact form, contact details, availability and local time in Tashkent |
| `privacy.html`, `404.html` | Privacy note and a custom "route not found" page |

## How the contact form works

The site has no server, so it does not send email itself. When a visitor presses **Send Message**, the form checks the fields and opens the visitor's own email app with a ready email to `sironiddinooov@gmail.com`: the subject (topic and name), the message and their reply address. The visitor then presses **Send** in their mail app.

If the visitor has no mail app set up, the form also offers **Open mail app**, **Open in Gmail** and **Copy message**, so the message is never lost.

## Deploy on Vercel

**Option A: import from GitHub**

1. In Vercel, choose **Add New → Project** and import the `CV-Ibrohim` repository.
2. Framework preset: **Other**. Leave the build command empty and keep the root directory as is.
3. Deploy, then open **Settings → Git** and set **Production Branch** to `new-cv`, so the production site comes from this branch.

The Vercel account must be connected to a GitHub account that can access this repository. If it is a different account, give it access or fork the repository first.

**Option B: Vercel CLI**

```bash
git clone https://github.com/Muza005/CV-Ibrohim.git
```

```bash
cd CV-Ibrohim && git checkout new-cv
```

```bash
npx vercel --prod
```

`vercel.json` enables clean URLs (`/about` instead of `/about.html`), long caching for fonts and a few security headers.

**After the first deploy:** link previews, `sitemap.xml` and `robots.txt` use `https://ibrohim-sirojiddinov.vercel.app`. If your address is different, replace that text in all files with your real URL.

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080. Locally the pages are served as `about.html` and so on; on Vercel the same links redirect to clean URLs.

## Editing content

- **Text** lives in the HTML files. The header and footer are repeated on every page, so update all pages when you change the navigation (find and replace works well).
- **Colours and fonts**: the tokens at the top of `assets/css/style.css`.
- **Reviews**: the six reviews are drafts written from the CV. Replace them with real quotes from colleagues, with their permission, before you rely on them. They appear in `reviews.html` and in the reviews section of `index.html`.
- **Blog**: each article is a file in `posts/`. Post dates are shown as "Nov 2026".
- **CV**: replace `assets/Ibrohim-Sirojiddinov-CV.pdf` with a file of the same name.
- **Photo**: `assets/img/ibrohim.jpg` (cropped from the CV).

## Structure

```text
index.html, about.html, services.html, projects.html,
blog.html, reviews.html, contact.html, privacy.html, 404.html
posts/                    blog articles
assets/css/style.css      all styles, design tokens at the top
assets/js/main.js         menu, animations, typing, live log, blog filter, contact form
assets/fonts/             Inter and Fira Code (self-hosted, with licences)
assets/img/               photo, favicon, touch icon, social preview, patterns
assets/Ibrohim-Sirojiddinov-CV.pdf
vercel.json               clean URLs and headers
sitemap.xml, robots.txt
```

## Features

- Responsive from phones to wide screens, with a mobile menu
- Scroll-reveal animations, typing terminal, live API log, animated skill bars and counters; all of them respect `prefers-reduced-motion`
- No cookies, analytics or third-party requests; fonts are self-hosted
- Accessible: skip link, keyboard-friendly navigation, visible focus, checked with axe-core
- SEO: page titles and descriptions, Open Graph image, `schema.org` Person and BlogPosting data, sitemap

## Credits

- Fonts: [Inter](https://rsms.me/inter/) and [Fira Code](https://github.com/tonsky/FiraCode), SIL Open Font License 1.1 (licence files in `assets/fonts/`).
- Technology logos: [Simple Icons](https://simpleicons.org/) (CC0). Trademarks belong to their owners.
- Layout inspired by the DevPro portfolio template; the code, illustrations and text were written for this site.
