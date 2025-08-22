<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:content="http://purl.org/rss/1.0/modules/content/"
                xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>RSS Feed | <xsl:value-of select="/rss/channel/title"/></title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          :root{color-scheme:light dark}
          body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;line-height:1.6;margin:0;padding:0;background:Canvas;color:CanvasText}
          main{max-width:720px;margin:0 auto;padding:16px}
          .rss-info{background:color-mix(in srgb, Canvas 92%, CanvasText);padding:16px;margin:16px 0;border-radius:8px}
          .post{margin:24px 0;padding:16px 0;border-bottom:1px solid color-mix(in srgb, CanvasText 15%, Canvas)}
          .post:last-child{border-bottom:none}
          h1,h2{line-height:1.25}
          h3{margin:0 0 8px 0}
          a{color:LinkText;text-decoration:none}
          a:hover{text-decoration:underline}
          .date{color:GrayText;font-size:.9em;margin-bottom:8px}
          .tags{margin-top:8px}
          .tag{background:color-mix(in srgb, Canvas 85%, CanvasText);padding:2px 8px;border-radius:12px;font-size:.8em;margin-right:8px;display:inline-block}
          .description{color:color-mix(in srgb, CanvasText 85%, Canvas)}
          .copy-url{background:color-mix(in srgb, Canvas 92%, CanvasText);padding:8px;border-radius:4px;font-family:monospace;font-size:.9em;margin:8px 0}
          .highlight{background:color-mix(in srgb, LinkText 15%, Canvas);padding:2px 4px;border-radius:3px}
        </style>
      </head>
      <body>
        <main>
          <h1>🔗 RSS Feed: <xsl:value-of select="/rss/channel/title"/></h1>
          
          <div class="rss-info">
            <h2>📡 What is this RSS feed?</h2>
            <p><strong>RSS (Really Simple Syndication)</strong> is a web feed format that allows you to stay up-to-date with new content from this site automatically. Instead of manually checking this website for new posts, your RSS reader will notify you whenever something new is published.</p>
            
            <h3>🚀 How to subscribe:</h3>
            <p>1. Copy this page's URL from your browser's address bar</p>
            <div class="copy-url">
              <strong>Feed URL:</strong> <span class="highlight"><xsl:value-of select="/rss/channel/atom:link[@rel='self']/@href"/></span>
            </div>
            <p>2. Paste it into your RSS reader application</p>
            
            <h3>📱 Popular RSS readers:</h3>
            <p>• <strong>Web-based:</strong> <a href="https://feedly.com" target="_blank">Feedly</a>, <a href="https://www.inoreader.com" target="_blank">Inoreader</a>, <a href="https://newsblur.com" target="_blank">NewsBlur</a></p>
            <p>• <strong>Desktop:</strong> <a href="https://netnewswire.com" target="_blank">NetNewsWire</a> (Mac), <a href="https://www.thunderbird.net" target="_blank">Thunderbird</a> (Cross-platform)</p>
            <p>• <strong>Mobile:</strong> <a href="https://reederapp.com" target="_blank">Reeder</a> (iOS), <a href="https://play.google.com/store/apps/details?id=net.frju.flym" target="_blank">Flym</a> (Android)</p>
            
            <p><strong>New to RSS?</strong> Learn more at <a href="https://aboutfeeds.com" target="_blank">About Feeds</a> — it's a free and open standard!</p>
          </div>

          <h2>📝 Recent Posts (<xsl:value-of select="count(/rss/channel/item)"/> total)</h2>
          <xsl:for-each select="/rss/channel/item">
            <div class="post">
              <h3>
                <a>
                  <xsl:attribute name="href">
                    <xsl:value-of select="link"/>
                  </xsl:attribute>
                  <xsl:attribute name="target">_blank</xsl:attribute>
                  <xsl:value-of select="title"/>
                </a>
              </h3>
              <div class="date">
                📅 Published: <xsl:value-of select="substring(pubDate, 1, 16)"/>
              </div>
              <xsl:if test="description">
                <p class="description"><xsl:value-of select="description"/></p>
              </xsl:if>
              <xsl:if test="category">
                <div class="tags">
                  🏷️ 
                  <xsl:for-each select="category">
                    <span class="tag"><xsl:value-of select="."/></span>
                  </xsl:for-each>
                </div>
              </xsl:if>
            </div>
          </xsl:for-each>
          
          <div class="rss-info" style="margin-top:32px">
            <p><strong>💡 Tip:</strong> Bookmark this page to easily access the feed URL, or visit <a><xsl:attribute name="href"><xsl:value-of select="/rss/channel/link"/></xsl:attribute><xsl:value-of select="/rss/channel/title"/></a> for the main website.</p>
          </div>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>