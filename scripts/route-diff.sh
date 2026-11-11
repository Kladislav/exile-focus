#!/bin/sh
# Показывает, что автор поменял в маршруте с момента нашего форка.
# После переноса изменений в web/src/route/routes/ обновите снимок:
#   cp upstream/common/data/routes/*.txt web/src/route/routes/.upstream-base/
cd "$(dirname "$0")/.."
diff -ru web/src/route/routes/.upstream-base upstream/common/data/routes && echo "Маршрут upstream не менялся."
