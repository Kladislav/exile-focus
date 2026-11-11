# Exile Focus

Path of Exile 1 leveling guide: the whole route as one calm, readable list that keeps
your current step in view and moves on by itself when you enter the next zone.

- **Route list**: current step highlighted and kept in view, click any step to make it current.
- **Languages**: interface RU/EN and game language RU/EN separately. Zone, quest, gem, NPC and
  boss names follow the game language, everything else the interface language.
- **Themes**: system, light, dark.
- **Auto-progress**: link the game's `Client.txt` once (Chrome / Edge), the guide follows you zone by zone.
  Steam: `<Steam library>\steamapps\common\Path of Exile\logs\Client.txt`.
- **Path of Building import**: gem rewards and vendor purchases appear on the right quest step;
  a side panel shows gem links and the passive tree per PoB set ("Act 1-3" etc.), following the current act.
- **Keys**: `Space` done, `Backspace` back, `G` gem links, `B` build, `H` hints, `?` help.

## Development

```sh
npm install
npm run seed-tree  # passive tree data from GGG's skilltree-export, not committed
npm run dev        # http://localhost:5173/exile-focus/
npm run build
```

## Route and data

Game data and the route parser come from
[HeartofPhos/exile-leveling](https://github.com/HeartofPhos/exile-leveling) (MIT),
vendored in `upstream/` as a git subtree. Do not edit files in `upstream/`;
pull new leagues' changes with `npm run sync-upstream`.

The route itself is our fork in `web/src/route/routes/`:

- removed: The Great White Beast, The Silver Locket, Essence of Umbra and Essence of the Hag rewards;
- quests that only give gems (Intruders in Black, Sharp and Cruel, Sever the Right Hand,
  A Fixture of Fate) are wrapped in `#ifdef OPT_<quest>`: without a build they are shown as optional,
  with a build they are included only if they give a needed gem earlier than the rest of the route;
- crafting recipes are filtered to the ones listed in `web/src/route/crafting.ts`.

After syncing upstream, see what the author changed in the route and port it by hand:

```sh
sh scripts/route-diff.sh
cp upstream/common/data/routes/*.txt web/src/route/routes/.upstream-base/   # once ported
```

Our own UI lives in `web/`.

## Russian game names

`web/src/i18n/game-ru.json` is generated from the game files (same source as poedb.tw):

```sh
cd scripts/game-i18n
npx pathofexile-dat   # downloads tables listed in config.json from the PoE patch CDN
node build.mjs
```

Update `patch` in `config.json` for a new league. Terms that are not in the game tables
live in `manual-ru.json`. Route phrases (not game names) are translated in `web/src/i18n/route-ru.ts`.
