# MornyeFMT extensions

Extension repository for [MornyeFMT](https://github.com/FedMedTim/MornyeFMT)
and [Mornye](https://github.com/mornyeapp/Mornye).

## Add it to the app

1. Open the **Repository** tab.
2. Paste `https://github.com/FedMedTim/MornyeFMT-extensions` and add it.
3. Install the extensions you want.

## Extensions

### Jamendo (Creative Commons)

Searches [Jamendo](https://www.jamendo.com) through its
[official API](https://developer.jamendo.com/v3.0) and downloads tracks that
their artists publish under Creative Commons licenses with downloads allowed.
Tracks without download permission are not offered.

Setup:

1. Create a free account and an app at
   [devportal.jamendo.com](https://devportal.jamendo.com) to get a client ID.
2. In the app, open the extension's settings and paste the client ID.
3. Optional: choose the download format (`mp32`, `ogg` or `flac`).

Each downloaded file's comment and copyright tags carry the track's Creative
Commons license link. Follow that license when you share or reuse the music
(attribution, non-commercial or no-derivatives terms may apply). The Jamendo
API itself is free for non-commercial use; see Jamendo's API terms.

## Layout

- `registry.json`: the index the app reads.
- `jamendo/`: extension source (`manifest.json`, `index.js`).
- `dist/`: packaged `.mornye-ext` files referenced by `registry.json`.

## License

MIT, see [LICENSE](LICENSE).
