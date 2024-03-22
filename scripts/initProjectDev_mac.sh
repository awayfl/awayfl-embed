set -euo pipefail
echo [32m Links all AwayFL modules and AwayJS modules to existing checked-out source modules[0m
read -n 1 -s -r -p "Press any key to continue"
cd $(dirname "$0")
cd ..

echo [32m link "@awayjs/core" module[0m
yarn link @awayjs/core

echo [32m link "@awayjs/stage" module[0m
yarn link @awayjs/stage

echo [32m link "@awayjs/view" module[0m
yarn link @awayjs/view

echo [32m link "@awayjs/renderer" module[0m
yarn link @awayjs/renderer

echo [32m link "@awayjs/graphics" module[0m
yarn link @awayjs/graphics

echo [32m link "@awayjs/materials" module[0m
yarn link @awayjs/materials

echo [32m link "@awayjs/scene" module[0m
yarn link @awayjs/scene

echo [32m link "@awayfl/swf-loader" module[0m
yarn link @awayfl/swf-loader

echo [32m link "@awayfl/avm1" module[0m
yarn link @awayfl/avm1

echo [32m link "@awayfl/avm2" module[0m
yarn link @awayfl/avm2

echo [32m link "@awayfl/playerglobal" module[0m
yarn link @awayfl/playerglobal

echo [32m link "@awayfl/awayfl-player" module[0m
yarn link @awayfl/awayfl-player

echo [32m link "coolmath-player" module[0m
yarn link coolmath-player

read -n 1 -s -r -p "Press any key to continue . . ."
exit