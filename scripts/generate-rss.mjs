import fs from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";

const ROOT = process.cwd();
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

// Configure via env or defaults
const FEED_TITLE = process.env.FEED_TITLE ?? "<FEED_TITLE>";
// SITE_BASE_URL is the public base where your feed and (optionally) HTML pages live.
// For GitHub Pages from /docs on main: https://<GITHUB_USERNAME>.github.io/<REPO_NAME>
const SITE_BASE_URL = (process.env.SITE_BASE_URL ?? "https://<GITHUB_USERNAME>.github.io/<REPO_NAME>").replace(/\/$/, "");
const RSS_OUTPUT = process.env.RSS_OUTPUT ?? "docs/rss.xml";
const CHANNEL_DESC = process.env.FEED_DESC ?? "Updates and articles from <FEED_TITLE>";
const DOCS_DIR = process.env.DOCS_DIR ?? "docs";

function rfc822(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pageTemplate({ title, htmlBody, excerpt, canonical, rssUrl, date, tags }) {
  const safeTitle = esc(title);
  const desc = esc(excerpt || CHANNEL_DESC);
  const published = date ? new Date(date).toISOString() : "";
  const og = desc;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${safeTitle}</title>
  <meta name="description" content="${desc}"/>
  <link rel="canonical" href="${canonical}"/>
  <link rel="alternate" type="application/rss+xml" title="${esc(FEED_TITLE)}" href="${rssUrl}"/>
  <meta property="og:type" content="article"/>
  <meta property="og:title" content="${safeTitle}"/>
  <meta property="og:description" content="${og}"/>
  <meta property="og:url" content="${canonical}"/>
  ${published ? `<meta property="article:published_time" content="${published}"/>` : ""}
  ${Array.isArray(tags) ? tags.map(t => `<meta property="article:tag" content="${esc(t)}"/>`).join("\n  ") : ""}
  <style>
    :root{color-scheme:light dark}
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.6;margin:0;padding:0;background:Canvas;color:CanvasText}
    header,main,footer{max-width:720px;margin:0 auto;padding:16px}
    header{border-bottom:1px solid color-mix(in srgb, CanvasText 15%, Canvas)}
    footer{border-top:1px solid color-mix(in srgb, CanvasText 15%, Canvas);color:GrayText}
    article :is(h1,h2,h3){line-height:1.25}
    pre{background:color-mix(in srgb, Canvas 92%, CanvasText);padding:12px;overflow:auto}
    code{font-family:ui-monospace,Menlo,Consolas,monospace}
    a{color:LinkText;text-decoration:none}
    a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <header>
    <a href="${SITE_BASE_URL}/" style="text-decoration:none;color:inherit"><strong>${esc(FEED_TITLE)}</strong></a>
    <span style="float:right"><a href="${rssUrl}">RSS</a></span>
  </header>
  <main>
    <article>
      ${htmlBody}
    </article>
  </main>
  <footer>
    <small>© ${new Date().getUTCFullYear()} • <a href="${SITE_BASE_URL}/">Home</a> • <a href="${rssUrl}">RSS</a></small>
  </footer>
</body>
</html>`;
}

function indexTemplate(posts) {
  const rssUrl = `${SITE_BASE_URL}/rss.xml`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${esc(FEED_TITLE)}</title>
  <meta name="description" content="${esc(CHANNEL_DESC)}"/>
  <link rel="alternate" type="application/rss+xml" title="${esc(FEED_TITLE)}" href="${rssUrl}"/>
  <style>
    :root{color-scheme:light dark}
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.6;margin:0;padding:0;background:transparent;color:CanvasText}
    main{max-width:720px;margin:0 auto;padding:16px}
    li{margin:8px 0}
    a{color:LinkText;text-decoration:none}
    a:hover{text-decoration:underline}
    time{color:GrayText;font-size:.9em}
  </style>
</head>
<body>
  <main>
    <h1>${esc(FEED_TITLE)}</h1>
    <p>${esc(CHANNEL_DESC)}</p>
    <ul>
      ${posts.map(p => `<li><a href="${SITE_BASE_URL}/${encodeURIComponent(p.slug)}/">${esc(p.title || p.slug)}</a> · <time datetime="${esc(p.date)}">${new Date(p.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: '2-digit' })}</time></li>`).join("\n      ")}
    </ul>
    <p><a href="${rssUrl}">Subscribe via RSS</a></p>
  </main>
</body>
</html>`;
}

async function master() {
  const indexPath = path.join(ROOT, "index.json");
  const postsDir = path.join(ROOT, "posts");
  const indexRaw = await fs.readFile(indexPath, "utf8");
  const list = JSON.parse(indexRaw);

  // Sort newest first
  list.sort((a, b) => new Date(b.date) - new Date(a.date));

  const items = [];
  for (const post of list) {
    const slug = post.slug;
    const title = post.title ?? slug;
    const date = post.date ?? new Date().toISOString();
    const excerpt = post.excerpt ?? "";
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const mdPath = path.join(postsDir, `${slug}.md`);

    const mdBody = await fs.readFile(mdPath, "utf8");
    const htmlBody = md.render(mdBody);
    const permalink = `${SITE_BASE_URL}/${encodeURIComponent(slug)}/`;

    // RSS item
    const tagXml = tags.map(t => `<category>${esc(t)}</category>`).join("");
    items.push(
      [
        "<item>",
        `<title>${esc(title)}</title>`,
        `<link>${esc(permalink)}</link>`,
        `<guid isPermaLink="false">${esc(slug)}</guid>`,
        `<pubDate>${rfc822(date)}</pubDate>`,
        excerpt ? `<description><![CDATA[${excerpt}]]></description>` : "",
        tagXml,
        `<content:encoded><![CDATA[${htmlBody}]]></content:encoded>`,
        "</item>"
      ].filter(Boolean).join("")
    );

    // HTML page for the post
    const outDir = path.join(ROOT, DOCS_DIR, slug);
    await fs.mkdir(outDir, { recursive: true });
    const pageHtml = pageTemplate({
      title,
      htmlBody,
      excerpt,
      canonical: permalink,
      rssUrl: `${SITE_BASE_URL}/rss.xml`,
      date,
      tags
    });
    await fs.writeFile(path.join(outDir, "index.html"), pageHtml, "utf8");
  }

  // RSS feed
  const lastBuild = list[0]?.date ? rfc822(list[0].date) : new Date().toUTCString();
  const selfHref = `${SITE_BASE_URL}/rss.xml`;

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(FEED_TITLE)}</title>
    <link>${esc(SITE_BASE_URL)}</link>
    <description>${esc(CHANNEL_DESC)}</description>
    <atom:link href="${esc(selfHref)}" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    ${items.join("\n    ")}
  </channel>
</rss>`;

  await fs.mkdir(path.dirname(RSS_OUTPUT), { recursive: true });
  await fs.writeFile(RSS_OUTPUT, rss, "utf8");
  console.log(`Wrote ${RSS_OUTPUT}`);

  // Index page
  const indexHtml = indexTemplate(list);
  await fs.writeFile(path.join(ROOT, DOCS_DIR, "index.html"), indexHtml, "utf8");
  console.log(`Wrote ${path.join(DOCS_DIR, "index.html")}`);
}

master().catch((e) => {
  console.error(e);
  process.exit(1);
});
