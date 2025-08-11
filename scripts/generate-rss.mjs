import fs from "node:fs/promises";
import path from "node:path";
import MarkdownIt from "markdown-it";

const ROOT = process.cwd();
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });

// Configure via env or defaults
const FEED_TITLE = process.env.FEED_TITLE ?? "<FEED_TITLE>";
// SITE_BASE_URL is the public base where your feed and (optionally) HTML pages live.
// For GitHub Pages from /docs on master: https://<GITHUB_USERNAME>.github.io/<REPO_NAME>
const SITE_BASE_URL = (process.env.SITE_BASE_URL ?? "https://<GITHUB_USERNAME>.github.io/<REPO_NAME>").replace(/\/$/, "");
const RSS_OUTPUT = process.env.RSS_OUTPUT ?? "docs/rss.xml";
const CHANNEL_DESC = process.env.FEED_DESC ?? "Updates and articles from <FEED_TITLE>";

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
    const permalink = `${SITE_BASE_URL}/${encodeURIComponent(slug)}`;

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
  }

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
}

master().catch((e) => {
  console.error(e);
  process.exit(1);
});
