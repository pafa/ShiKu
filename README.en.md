# ShiKu · A walk through China's Buddhist grottoes

[中文](README.md) · [Contributing](CONTRIBUTING.md) · [Asset credits](docs/ASSETS.md)

ShiKu is an independent, browser-based 3D museum connecting Mogao, Maijishan, Yungang and Longmen. Walk around the reclining Buddha in Mogao Cave 158 or climb the stairs in front of Longmen's Fengxian Temple. Stop near a mural, niche or sculpture for its story. Mandarin narration follows your position after you enable sound.

## Run locally

Use Node.js **22.12 or newer**. No package installation, database or API key is required to visit.

```sh
node server/museum.mjs --port 4173
```

Open [the museum](http://127.0.0.1:4173/), choose an avatar and enter a nickname. Use the arrow keys or WASD to walk and drag to look around. [Enter Mogao 158](http://127.0.0.1:4173/?experience=mogao-158), [approach Fengxian Temple](http://127.0.0.1:4173/?experience=longmen-1280), or [browse the collection](http://127.0.0.1:4173/?catalog=art). To invite someone on the same local network, add `--lan` and share the local address printed by the server. Press Ctrl+C to stop it.

Nine linked period galleries frame the historical collection. The curatorial catalogue contains 179 exhibits, with 33 cave interpretation rooms, a manuscript room and 139 narration stops. Gallery circulation is designed for exploration. Captions distinguish documented objects, historical photographs and measured models from interpretive architecture. The public edition retains all 179 exhibit labels: 94 with redistributable photographs and 85 with catalogue or institutional references. Of 34 walk-in spaces, 23 include photographs of the corresponding objects and 11 are documentary interpretations. The public edition distributes only the media listed in [the asset records](docs/ASSETS.md); other evidence may be consulted at the credited institution.

Each running museum instance admits up to 50 visitors. Additional visitors join a first-come queue. People in the same room can see each other's chosen names, avatars and recent movements. [Privacy notes](docs/PRIVACY.md) describe what the service keeps. Multi-user visits need a room service; a static file host alone does not provide one.

Original software: [Apache License 2.0](LICENSE). Original guide texts, sound recordings, entrance artwork and maps: [CC BY 4.0, credited to ShiKu](CONTENT-LICENSE.md). Third-party software, images, models, data, motions and sound are governed separately. See [NOTICE](NOTICE), [asset credits](docs/ASSETS.md), [contributing](CONTRIBUTING.md) and [security reporting](SECURITY.md). The [Cloudflare deployment](deploy/cloudflare/README.md) uses a single persistent SQLite Durable Object for shared presence and admissions. The intended public hostname is `shiku.xiaoha.org`.
