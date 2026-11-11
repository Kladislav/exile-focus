#!/bin/sh
# Подтягивает свежий маршрут и данные из HeartofPhos/exile-leveling.
# Внутри upstream/ ничего не правим руками, иначе будут конфликты.
set -e
cd "$(dirname "$0")/.."
git subtree pull --prefix upstream https://github.com/HeartofPhos/exile-leveling.git main --squash -m "Sync upstream exile-leveling"
