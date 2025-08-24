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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet">
  <meta property="og:type" content="article"/>
  <meta property="og:title" content="${safeTitle}"/>
  <meta property="og:description" content="${og}"/>
  <meta property="og:url" content="${canonical}"/>
  ${published ? `<meta property="article:published_time" content="${published}"/>` : ""}
  ${Array.isArray(tags) ? tags.map(t => `<meta property="article:tag" content="${esc(t)}"/>`).join("\n  ") : ""}
  <style>
:root {
  /* Light mode (your Material tokens -> simple semantics) */
  --bg:            #f5fafb;   /* surface */
  --text:          #171d1e;   /* on surface */
  --accent:        #006a6a;   /* primary */
  --accent-weak:   #9cf1f0;   /* primary container */
  --accent-2:      #006a6a;   /* secondary (same as primary per your input) */
  --accent-2-weak: #9cf1f1;   /* secondary container */
  --link:          #006a6a;   /* primary */
  --link-hover:    #36618e;   /* tertiary */
  --error:         #ba1a1a;   /* error */
  --error-weak:    #ffdad6;   /* error container */
  --card:          #ffffff;   /* simple card bg */
  --on-accent:     #ffffff;   /* text on dark accent */
  --on-weak:       #003233;   /* readable on light teal containers */
  --on-card:       #171d1e;
  --border:        #d2dee1;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode */
    --bg:            #0e1415;  /* surface */
    --text:          #ffffff;  /* inferred on-surface */
    --accent:        #80d5d4;  /* primary */
    --accent-weak:   #004f50;  /* primary container */
    --accent-2:      #80d4d5;  /* secondary */
    --accent-2-weak: #004f50;  /* secondary container (same as primary container) */
    --link:          #80d5d4;  /* primary */
    --link-hover:    #a0cafd;  /* tertiary */
    --error:         #ffb4ab;  /* error */
    --error-weak:    #93000a;  /* error container */
    --card:          #121a1b;
    --on-accent:     #000000;  /* text on light accent */
    --on-weak:       #d1f6f5;  /* readable on dark teal containers */
    --on-card:       #ffffff;
    --border:        #283436;
  }
}

/* Minimal element defaults so "basic HTML" just works */
html, body { background: var(--bg); color: var(--text); }
a { color: var(--link); text-decoration: underline; }
a:hover { color: var(--link-hover); }
button {
  background: var(--accent); color: var(--on-accent);
  border: 1px solid transparent; padding: .6rem 1rem; border-radius: .5rem; cursor: pointer;
}
button.ghost { background: var(--accent-weak); color: var(--on-weak); }
.card {
  background: var(--card); color: var(--on-card);
  border: 1px solid var(--border); border-radius: .75rem; padding: 1rem;
}
.alert-error {
  background: var(--error-weak); color: #000;
  border-left: .4rem solid var(--error); padding: .75rem 1rem; border-radius: .5rem;
}

    body{font-family:'Nunito', sans-serif;line-height:1.6;margin:0;padding:0;}
    header,main,footer{max-width:720px;margin:0 auto;padding:16px}
    header{border-bottom:1px solid var(--border)}
    footer{border-top:1px solid var(--border);color:var(--text)}
    article :is(h1,h2,h3){font-family:'Merriweather', serif;line-height:1.25}
    pre{background:var(--accent-weak);color:var(--on-weak);padding:12px;overflow:auto}
    code{font-family:ui-monospace,Menlo,Consolas,monospace}
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&family=Nunito:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
:root {
  /* Light mode (your Material tokens -> simple semantics) */
  --bg:            #f5fafb;   /* surface */
  --text:          #171d1e;   /* on surface */
  --accent:        #006a6a;   /* primary */
  --accent-weak:   #9cf1f0;   /* primary container */
  --accent-2:      #006a6a;   /* secondary (same as primary per your input) */
  --accent-2-weak: #9cf1f1;   /* secondary container */
  --link:          #006a6a;   /* primary */
  --link-hover:    #36618e;   /* tertiary */
  --error:         #ba1a1a;   /* error */
  --error-weak:    #ffdad6;   /* error container */
  --card:          #ffffff;   /* simple card bg */
  --on-accent:     #ffffff;   /* text on dark accent */
  --on-weak:       #003233;   /* readable on light teal containers */
  --on-card:       #171d1e;
  --border:        #d2dee1;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Dark mode */
    --bg:            #0e1415;  /* surface */
    --text:          #ffffff;  /* inferred on-surface */
    --accent:        #80d5d4;  /* primary */
    --accent-weak:   #004f50;  /* primary container */
    --accent-2:      #80d4d5;  /* secondary */
    --accent-2-weak: #004f50;  /* secondary container (same as primary container) */
    --link:          #80d5d4;  /* primary */
    --link-hover:    #a0cafd;  /* tertiary */
    --error:         #ffb4ab;  /* error */
    --error-weak:    #93000a;  /* error container */
    --card:          #121a1b;
    --on-accent:     #000000;  /* text on light accent */
    --on-weak:       #d1f6f5;  /* readable on dark teal containers */
    --on-card:       #ffffff;
    --border:        #283436;
  }
}

/* Minimal element defaults so "basic HTML" just works */
html, body { background: var(--bg); color: var(--text); }
a { color: var(--link); text-decoration: underline; }
a:hover { color: var(--link-hover); }
button {
  background: var(--accent); color: var(--on-accent);
  border: 1px solid transparent; padding: .6rem 1rem; border-radius: .5rem; cursor: pointer;
}
button.ghost { background: var(--accent-weak); color: var(--on-weak); }
.card {
  background: var(--card); color: var(--on-card);
  border: 1px solid var(--border); border-radius: .75rem; padding: 1rem;
}
.alert-error {
  background: var(--error-weak); color: #000;
  border-left: .4rem solid var(--error); padding: .75rem 1rem; border-radius: .5rem;
}

    body{font-family:'Nunito', sans-serif;line-height:1.6;margin:0;padding:0;}
    h1{font-family:'Merriweather', serif;}
    main{max-width:720px;margin:0 auto;padding:16px}
    li{margin:8px 0}
    time{color:var(--text);font-size:.9em}
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
<?xml-stylesheet href="rss.xsl" type="text/xsl"?>
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
