# Momentum-dx website

Source of the Momentum-dx website at <https://momentum-dx.project516.dev>. Momentum-dx is a bleeding-edge fork of Momentum Firmware for the Flipper Zero. The site is an unofficial fork of the Momentum website, built with VitePress and Vue 3. It has the web updater, release pages, asset packs and the wiki.

Momentum-dx is not affiliated with Next-Flip or the Momentum team.

## How releases reach the site

Firmware releases come from GitHub Releases of [`momentum-dx/Momentum-Firmware-dx`](https://github.com/momentum-dx/Momentum-Firmware-dx). A release is a tag named `dx-YYYY.MM.DD` on `dev`. CI there builds the tag and publishes the release.

At build time, `scripts/releases.ts`:

1. Reads the releases from the GitHub API. It keeps tags that start with `dx-` and are not drafts or prereleases, and takes the newest 5.
2. Downloads their assets into `public/builds/firmware/<tag>/`.
3. Writes `public/firmware/directory.json` in the format of the Momentum update server, with the latest release only. The web updater and qFlipper read this file.
4. Writes `public/firmware/latest.txt` with the latest tag.
5. Writes `_data/releases.ts` for the pages.

The deploy workflow publishes the site to GitHub Pages. It runs on every push to `dev`, and every 30 minutes it compares the latest release tag with `latest.txt` on the live site. It only builds when they differ.

Asset packs still come from the public Momentum asset pack index at `up.momentum-fw.dev`.

## Development

Requires [Bun](https://bun.sh/docs/installation).

```bash
bun install
bun run dev          # fetches data, then starts the dev server
bun run dev:skip     # reuses the data from the last fetch
bun run build        # production build into .vitepress/dist
bun run lint:check
```

Set `GITHUB_TOKEN` to avoid GitHub API rate limits. To test with fake releases, set `RELEASES_FIXTURE` to a JSON file in the GitHub releases API format. Asset `browser_download_url` values may be `file://` URLs.

## Credits

- [Momentum-Website](https://github.com/Next-Flip/Momentum-Website) by Next-Flip, the site this fork is based on
- [flipperzero-protobuf](https://github.com/flipperdevices/flipperzero-protobuf)
- [lab.flipper.net](https://github.com/flipperdevices/lab.flipper.net)

Licensed under GPL-3.0. See [LICENSE](LICENSE).
