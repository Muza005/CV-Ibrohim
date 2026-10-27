# Ibrohim Sirojiddinov — CV website

A fast, animated one-page resume site for **Ibrohim Sirojiddinov**, Backend Software Engineer (Node.js) in Tashkent, Uzbekistan.

Plain HTML, CSS and vanilla JavaScript: no build step and no dependencies. Open `index.html` and it works.

## Features

- **Hero:** an animated network background with "requests" moving between nodes, a terminal that types out a JSON profile, and rotating "I build …" phrases
- **Sections:** About, Skills, Experience, Projects, Education & Languages, Contact
- **Dark and light themes:** follows the system setting and remembers a manual choice
- **Motion:** scroll-reveal animations, animated counters, cursor-following card spotlight, an animated stack diagram, a skills marquee and a scroll progress bar
- **Contact:** one-click copy for email and phone, a live Tashkent clock and a downloadable PDF CV
- **Accessibility:** keyboard friendly, includes a skip link, respects `prefers-reduced-motion`, and has a print stylesheet
- **Sharing:** SEO and social-preview meta tags, plus `schema.org/Person` structured data

## Structure

```
index.html                         page content (all text lives here)
assets/css/style.css               styles; colour tokens at the top
assets/js/main.js                  interactions and animations
assets/img/                        favicon, touch icon, social preview image
assets/Ibrohim-Sirojiddinov-CV.pdf downloadable CV
```

## Run locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080
```

## Publish with GitHub Pages

1. Open the repository **Settings → Pages**.
2. Under **Build and deployment**, choose **Source: Deploy from a branch**.
3. Pick the branch with the site, set the folder to `/ (root)`, and click **Save**.

The site is published at `https://muza005.github.io/CV-Ibrohim/` within about a minute.

If you host it somewhere else, update the `og:url` and `og:image` addresses in `index.html` so link previews still work.

## Updating content

- Change text, projects or contacts in `index.html`.
- Change colours in the token block at the top of `assets/css/style.css`.
- To update the downloadable CV, replace `assets/Ibrohim-Sirojiddinov-CV.pdf` with a file of the same name.
