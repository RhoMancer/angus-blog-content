# Blog Content

Markdown-based content and RSS feed for the app blog.

- Source of truth:
  - `index.json` — list of posts and metadata
  - `posts/<slug>.md` — Markdown body per post
- Output:
  - `docs/rss.xml` — RSS 2.0 feed (served by GitHub Pages)

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
3. Commit and push to `master`.
4. GitHub Actions updates `docs/rss.xml` automatically.

## URLs

- Raw content base (for the app):
  - `https://raw.githubusercontent.com/<GITHUB_USERNAME>/<REPO_NAME>/master`
  - Example: `<base>/index.json`, `<base>/posts/<slug>.md`
- RSS feed (for readers and the app):
  - `https://<GITHUB_USERNAME>.github.io/<REPO_NAME>/rss.xml`

## Notes

- Dates should be ISO 8601 (UTC recommended).
- Tags in `index.json` become `<category>` entries in the RSS feed.
- If you enable GitHub Pages for this repo (Settings → Pages → Source: Deploy from a branch → Branch: master → Folder: /docs), the feed is served at `/rss.xml`.
