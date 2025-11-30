<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>
          RSS Feed |
          <xsl:value-of select="/rss/channel/title"/>
        </title>
        <meta charset="utf-8"/>
        <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin=""/>
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&amp;family=Nunito:wght@300;400;600;700&amp;display=swap" rel="stylesheet"/>
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
          main{max-width:720px;margin:0 auto;padding:16px}
          h1{font-family:'Merriweather', serif;display:flex;align-items:flex-start;line-height:1.25;margin:0 0 16px 0}
          h2{font-family:'Merriweather', serif;line-height:1.25;margin:24px 0 8px 0}
          p{font-family:'Merriweather', serif;font-size:1.05em;margin:8px 0}
          .alert-box{font-family:'Merriweather', serif;background:var(--accent-weak);color:var(--on-weak);border:1px solid var(--border);border-radius:4px;padding:16px;margin:16px 0}
          .rss-icon{flex-shrink:0;width:1em;height:1em;margin-right:12px}
          .post{margin:24px 0;padding:16px 0;border-bottom:1px solid var(--border)}
          .post:last-child{border-bottom:none}
          .date{color:var(--text);font-size:0.9em;margin-bottom:8px}
          .post-title{font-family:'Merriweather', serif;font-weight:bold;font-size:1.2em;margin-bottom:8px}
          .post-description{font-family:'Merriweather', serif;color:var(--text);font-size:1.05em;line-height:1.5}
        </style>
      </head>
      <body>
        <main>
          <div class="alert-box">
            <strong>This is an RSS feed</strong>. Subscribe by copying
            the URL from the address bar into your newsreader. Visit <a
            href="https://aboutfeeds.com">About Feeds
          </a> to learn more and get started. It’s free.
          <br/>
          <a href="https://darekkay.com/blog/rss-styling/">Learn how to style your own RSS.xml here</a>.
          </div>
          <div>
            <h1>
              <!-- https://commons.wikimedia.org/wiki/File:Feed-icon.svg -->
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
                   class="rss-icon"
                   viewBox="0 0 256 256">
                <defs>
                  <linearGradient x1="0.085" y1="0.085" x2="0.915" y2="0.915"
                                  id="RSSg">
                    <stop offset="0.0" stop-color="#E3702D"/>
                    <stop offset="0.1071" stop-color="#EA7D31"/>
                    <stop offset="0.3503" stop-color="#F69537"/>
                    <stop offset="0.5" stop-color="#FB9E3A"/>
                    <stop offset="0.7016" stop-color="#EA7C31"/>
                    <stop offset="0.8866" stop-color="#DE642B"/>
                    <stop offset="1.0" stop-color="#D95B29"/>
                  </linearGradient>
                </defs>
                <rect width="256" height="256" rx="55" ry="55" x="0" y="0"
                      fill="#CC5D15"/>
                <rect width="246" height="246" rx="50" ry="50" x="5" y="5"
                      fill="#F49C52"/>
                <rect width="236" height="236" rx="47" ry="47" x="10" y="10"
                      fill="url(#RSSg)"/>
                <circle cx="68" cy="189" r="24" fill="#FFF"/>
                <path
                  d="M160 213h-34a82 82 0 0 0 -82 -82v-34a116 116 0 0 1 116 116z"
                  fill="#FFF"/>
                <path
                  d="M184 213A140 140 0 0 0 44 73 V 38a175 175 0 0 1 175 175z"
                  fill="#FFF"/>
              </svg>
              RSS Feed Preview
            </h1>
            <h2>
              <xsl:value-of select="/rss/channel/title"/>
            </h2>
            <p>
              <xsl:value-of select="/rss/channel/description"/>
            </p>
            <a href="https://www.angussoftware.com/">
              Visit Website &#x2192;
            </a>

            <h2>Recent blog posts</h2>
            <xsl:for-each select="/rss/channel/item">
              <div class="post">
                <div class="date">
                  Published on
                  <xsl:value-of select="substring(pubDate, 1, 16)" />
                </div>

                <div class="post-title">
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                </div>

                <div class="post-description"><xsl:value-of select="description"/></div>
              </div>
            </xsl:for-each>
          </div>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
