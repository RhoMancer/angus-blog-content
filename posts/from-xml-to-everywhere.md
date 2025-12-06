# From XML to Everywhere: My First Kotlin Multiplatform Run

For about 11 years I've been doing Android—9 of those professionally—and for almost that entire time my UI life was XML and old-school views.

Meanwhile, my "portfolio site" was this ancient Kotlin/JS thing I hacked together in 2019 that really should've been deleted years ago.

At some point I decided:

- I need to learn Compose anyway
- Kotlin Multiplatform (KMP) is clearly not going away
- I should ship something real, not another toy app rotting in a repo

So I built a [portfolio app](https://angussoftware.com) that runs on Android and the web.

It took about three and a half months of nights and weekends. It's not some dribbble-perfect masterpiece, but it's done, it works, and I'm proud of it.

## Why I Picked Kotlin Multiplatform

Short version: I already live in Kotlin all day, so using KMP was the obvious move.

The pitch is: write your core logic once, run it on multiple platforms.

In practice, that mostly worked. I reused a good chunk of code across Android and web, especially around data, networking, and RSS parsing. There were still platform-specific bits and some "why is this only broken on web?" moments, but nothing deal-breaking.

For a Kotlin-heavy Android dev, it felt like the least painful way to get something running in a browser without switching languages or brain models.

## Unlearning XML: Getting Used to Compose

The hardest part of this project was not "learning Compose." It was getting my brain to stop thinking in layouts and XML attributes.

I've spent years staring at things like:

- LinearLayout, ConstraintLayout
- android:layout_* soup
- Inflaters, adapters, recycling, view holders, all that

Compose does not care about any of that. It's all:

- Functions
- State in, UI out
- Recomposition instead of "findViewById and mutate"

Once I stopped trying to force the old mental model on top of Compose, everything got a lot smoother. Simple screens came together quickly. Stateful parts felt cleaner than the equivalent view code I've written in the past.

There's still some "Compose brain" I'm building, but I get why the industry is moving this way.

## Designing for Android and Web: Twice the UX Work

One thing I absolutely underestimated: designing for both phone and browser at the same time.

Stuff that feels good on a phone can look weird stretched across a big monitor. A layout that's perfect for thumbs and scrolling suddenly feels clunky with a mouse.

Things I kept running into:

- Buttons that were fine on mobile but looked oversized on desktop
- Navigation patterns that made sense on Android but felt off in a browser tab
- Spacing and typography that needed tweaks between narrow and wide layouts

This isn't really a KMP problem. It's a "you chose to target more than one platform" problem. The shared code is great, but the UX still needs platform-aware decisions.

If you go down this route, just assume your design workload is basically multiplied.

## Rolling My Own RSS Feed Parser

The part I'm weirdly most happy with is the blog section. It reads from an RSS feed that I control, and I ended up writing my own RSS parser.

Could I have used a library? Probably. But:

- I wanted something that worked the same on Android and in the browser
- I didn't want to pull in a big dependency that was JVM-only
- It was a good excuse to get my hands dirty

So the flow is:

- Fetch the RSS XML as plain text
- Parse out what I care about (title, link, description, pub date, images, etc.)
- Deal with the usual nonsense: CDATA, HTML entities, weird formatting
- Return clean data objects for Compose to render

On top of that, I created a separate repo whose only job is to generate the RSS XML and host it via GitHub Pages. That repo builds the feed, pushes it, and the app consumes it.

Yes, my blog is effectively powered by a stack of GitHub repos and XML. I'm fine with that.

## CI/CD: From Commit to Play Store and Web

Once the basic app was working, I set up a pipeline so I wouldn't have to manually build and upload things like an amateur every time.

Here's what happens when I push to a release branch:

- GitHub Actions runs the unit tests
- Builds and signs the Android release
- Uploads the build to Google Play (Internal Testing track)
- Builds the WebAssembly version
- Deploys the web bundle to GitHub Pages

The Android part was the most annoying to wire up:

- Keystore management
- Google Play Console service account
- Getting the right permissions and JSON config lined up

The web part was comparatively easy: just configure GitHub Pages and give the workflow permission to deploy.

All the sensitive stuff (keys, tokens, passwords) lives in GitHub secrets, not in the repo. It took some trial and error to get that right, but now releases are basically "push and let the robots handle it."

## DNS, Cloudflare, and Accidentally Learning How the Internet Works

Previously, I just used Squarespace or similar tools that hide all the DNS details. Click some buttons, type a domain, magically it works.

This time I wanted more control:

- Primary site on angussoftware.com
- angussoftware.dev pointing to the same thing
- Proper HTTPS, redirects, etc.
- Bonus: verify my Bluesky handle using my own domain

That meant actually learning:

- A records vs CNAME
- How Cloudflare handles DNS and proxying
- Page rules and redirects

It's not rocket science, but there's a difference between "I clicked around until it worked" and "I actually know which record does what." I'm now closer to the second one.

## How Much AI Helped (Honestly, a Lot)

I used AI constantly during this project: JetBrains' Junie (with Claude) and ChatGPT.

Things it helped with:

- Boring boilerplate and wiring
- "How do people usually do X in KMP?"
- Sketching out navigation and state patterns for multiplatform
- GitHub Actions YAML and signing/release config
- JavaScript/HTML bits where I was rusty

The important part is: it didn't magically build the app. It just made it faster to move from "stuck" to "trying something concrete."

I still had to:

- Understand what the code was doing
- Fix the parts that didn't work
- Make tradeoffs that made sense for my app

But compared to my old way of working (hours of docs + StackOverflow rabbit holes), this felt much more like pairing with a very fast, occasionally wrong coworker.

## What's Next?

A few things on my mind now that the first version is shipped:

**iOS**
I'd love to add an iOS target. Realistically, the main thing stopping me is hardware. I don't own a Mac, and Apple has decided that's mandatory. KMP itself is ready for it; my wallet is not.

**More content**
The app is a portfolio and blog, so it's only as good as what I put into it. I want to add more writeups of past projects, especially some of the more interesting Android work and side projects I've done.

**Games in the browser**
I've got some Android games I'd like to drag into the modern world and make playable on the web. That's a bigger effort than a blog reader, but now that the multiplatform foundation exists, it's at least not a totally wild idea.

## Would I Use KMP Again?

Yes.

As someone who already writes Kotlin every day, KMP is the most straightforward way for me to build something that runs on more than one platform without feeling like a beginner again.

Is it perfect? No:

- You'll still hit platform-specific bugs
- The tooling isn't flawless
- You still have to think separately about UX for each platform

But given my background, it's a very solid fit. I'd absolutely use it again for future projects where Android + web (and maybe iOS someday) make sense.

## Wrapping Up

This project ate 3.5 months of my free time and pulled me into all kinds of side quests:

- Learning Compose
- Thinking in multiplatform instead of just "Android"
- Wiring up CI/CD so releases don't suck
- Figuring out DNS and domain setup
- Building an RSS system end-to-end

The app itself is simple: it shows who I am, what I've built, and pulls in my blog posts. But the real win was proving to myself that I could take a brand-new stack, stick with it long enough, and actually ship something real instead of abandoning it halfway like so many other side projects.

That alone made it worth it.
