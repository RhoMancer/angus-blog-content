# Blog Content

Markdown-based content, static post pages, and an RSS feed for the app blog.

- Source of truth:
  - `index.json` — list of posts and metadata
  - `posts/<slug>.md` — Markdown body per post
- Generated output (served by GitHub Pages from `/docs`):
  - `docs/rss.xml` — RSS 2.0 feed
  - `docs/index.html` — simple blog index
  - `docs/<slug>/index.html` — one page per post

## Add a new post

1. Add a Markdown file at `posts/<slug>.md`.
2. Append a new entry to `index.json`:
   ```json
   {
     "slug": "<slug>",
     "title": "Post Title",
     "date": "2025-01-02T10:00:00Z",
     "excerpt": "Short summary.",
     "coverImageUrl": null,
     "tags": ["tag1", "tag2"]
   }
   ```
3. Commit and push to your default branch.
4. GitHub Actions regenerates the site and RSS automatically.

## URLs

- Raw content base (for the app):
  - `https://raw.githubusercontent.com/<GITHUB_USERNAME>/<REPO_NAME>/<BRANCH>`
  - Example: `<base>/index.json`, `<base>/posts/<slug>.md`
- Hosted site:
  - `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>/` (index)
  - `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>/<slug>/` (post page)
- RSS feed (for readers and the app):
  - `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>/rss.xml`

## Notes

- Set these repository Variables (Settings → Secrets and variables → Actions → Variables):
  - `FEED_TITLE`, `FEED_DESC`, `SITE_BASE_URL` (e.g. `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>`), and (optional) `RSS_OUTPUT`.
- Dates should be ISO 8601 (UTC recommended).
- Tags in `index.json` become `<category>` entries in the RSS feed.
- Enable GitHub Pages for this repo (Settings → Pages → Source: Deploy from a branch → Branch: your default branch → Folder: /docs). The feed is at `/rss.xml` and posts at `/<slug>/`.
