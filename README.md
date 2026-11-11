# Exile Focus

Path of Exile 1 leveling guide built around one idea: show the step you are on right now,
big and clear, and move on by itself when you enter the next zone.

- **Focus mode**: current step, gems to take or buy, the next few steps.
- **Auto-progress**: link the game's `Client.txt` once (Chrome / Edge), the guide follows you zone by zone.
  Steam: `<Steam library>\steamapps\common\Path of Exile\logs\Client.txt`.
- **Path of Building import**: gem rewards and vendor purchases appear on the right quest step.
- **Keys**: `Space` done, `Backspace` back, `L` route, `G` gem links, `B` build, `?` help.

## Development

```sh
npm install
npm run dev        # http://localhost:5173/exile-focus/
npm run build
```

## Route and data

The route, its parser and game data come from
[HeartofPhos/exile-leveling](https://github.com/HeartofPhos/exile-leveling) (MIT),
vendored in `upstream/` as a git subtree. Do not edit files in `upstream/`;
pull new leagues' changes with:

```sh
npm run sync-upstream
```

Our own UI lives in `web/`.
