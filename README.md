# Blog Content

Markdown-based content, static post pages, and an RSS feed for the app blog.

- Source of truth:
  - `index.json` — list of posts and metadata
  - `posts/<slug>.md` — Markdown body per post
- Generated output (served by GitHub Pages from `/docs`):
  - `docs/rss.xml` — RSS 2.0 feed with XSL styling for browser viewing
  - `docs/index.html` — redirect page that forwards visitors to the RSS feed
  - `docs/<slug>/index.html` — one HTML page per post

## Publish a new post (start to finish)

1) Create the Markdown file
- Path: `posts/<slug>.md`
- Example:
  ```md
  # My New Post

  Your content here…
  ```
- Tip: The `<slug>` must match the filename (e.g., `my-new-post.md` → slug: `"my-new-post"`).

2) Add a metadata entry to `index.json`
- Append a new object (the generator sorts by `date` descending):
  ```json
  {
    "slug": "my-new-post",
    "title": "My New Post",
    "date": "2025-08-21T19:02:00Z",
    "excerpt": "A short summary for readers and social embeds.",
    "coverImageUrl": null,
    "tags": ["tag1", "tag2"]
  }
  ```
- Tips:
  - Use ISO 8601 with Z (UTC), e.g., `2025-08-21T19:02:00Z`.
  - `tags` become `<category>` entries in RSS and `article:tag` meta tags on the HTML page.

3) Commit and push to your default branch (e.g., `main`)
- Example:
  - `git add posts/my-new-post.md index.json`
  - `git commit -m "post: my-new-post"`
  - `git push`

4) What CI will do automatically
- The GitHub Actions job will install deps and run the generator, then update and commit:
  - `docs/rss.xml` (the RSS feed)
  - `docs/<slug>/index.html` (individual post pages)
  - `docs/index.html` (redirect page to RSS feed)
- With GitHub Pages serving from `/docs`, your readers will have:
  - Index: `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>/` (redirects to RSS)
  - Post:  `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>/<slug>/`
  - RSS:   `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>/rss.xml`

## Optional: preview locally before pushing

- `npm ci`
- Optionally set env vars for local titles/links (examples):
  - PowerShell:
    - `$env:FEED_TITLE = "My Blog"`
    - `$env:FEED_DESC = "Updates and articles from My Blog"`
    - `$env:SITE_BASE_URL = "http://127.0.0.1:8080"`
- Build: `npm run build:rss`
- Serve `docs/` locally (pick one):
  - `npx http-server .\docs -p 8080`
  - or: `npx serve .\docs -p 8080`
- Open:
  - `http://127.0.0.1:8080/` (will redirect to RSS feed)
  - `http://127.0.0.1:8080/<slug>/` (individual post pages)
  - `http://127.0.0.1:8080/rss.xml` (RSS feed with styled presentation)

## One-time setup checklist

- GitHub Pages:
  - Settings → Pages → Source: Deploy from a branch
  - Branch: your default branch (e.g., `main`) • Folder: `/docs`
- GitHub Actions → Secrets and variables → Actions → Variables:
  - `FEED_TITLE` (e.g., `My Blog`)
  - `FEED_DESC` (e.g., `Updates and articles from My Blog`)
  - `SITE_BASE_URL` (exactly `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>` with no trailing slash)
  - `RSS_OUTPUT` (optional; defaults to `docs/rss.xml`)
- Workflow branch filter:
  - Current workflow watches `main`. If your default branch differs, update `.github/workflows/rss.yml` accordingly.

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

- Dates should be ISO 8601 (UTC recommended).
- Tags in `index.json` become `<category>` entries in the RSS feed.
- Enable GitHub Pages for this repo (Settings → Pages → Source: Deploy from a branch → Branch: your default branch → Folder: `/docs`). The RSS feed is at `/rss.xml`, posts at `/<slug>/`, and the index redirects to the RSS feed.

## Troubleshooting

- Workflow didn’t run:
  - Confirm you pushed to the watched branch and changed files in watched paths (`index.json` or `posts/**`).
  - Ensure the workflow’s `branches` filter matches your default branch.
- 404 on first click:
  - Make sure `docs/<slug>/index.html` exists and Pages serves from `/docs`.
  - RSS item links include a trailing slash (`/<slug>/`).
- Placeholders (`<FEED_TITLE>`, `<GITHUB_USERNAME>`) on the live site:
  - Set `FEED_TITLE`, `FEED_DESC`, and `SITE_BASE_URL` repository Variables.
- Wrong canonical/links:
  - `SITE_BASE_URL` must be exactly `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>` (no trailing slash).
