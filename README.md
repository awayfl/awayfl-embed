AWAYFL Embed Player
==================
AwayFL will help to save your Flash games workable after 2020!

Check your game on:
https://exponenta.games/games/AFL/

__How to use:__

1. [By override a `swfObject` api](./example/index.html)

2. Direct with loader (or direct, with config):
    * Grab template from [/src/embed/embed.html](./src/embed/embed.html)
    * Replace `__LOADER_URL__` to loader url
    * Replace `__GAME_CONFIG__` to game configuration JSON (or object) with interface of [CONFIG](./src/loader/iConfigBase.ts)
    * NOTE! If game use a external fonts, add records as `{path: path/to/font.swf, resourceType:'FONTS'}` to binary array, for `GAME` you should use a record: `{path: path/to/gaem.swf, resourceType:'GAME'}`.
    
    Example:
    ```
    const gameConfig = {
        width: 550,
        height: 400,
        splash: './splash.png',
        progress: { // optional
            back: 'cover url(./progressBack.png)',
            line: #cc0022, // or image, it will passed to progressLine background,
            rect: [0, 0.9, 1, 0.1] // x, y, width, height of preogress line relative contianer 
        },
        baseUrl: '../dist',
        runtime: ['../dist/runtime.js'],
        binary: [{
            path: 'Embeded.swf',
            resourceType: 'GAME',
            name: 'Game', // not used atm
            meta: {} // not used atm
        }],
    }
    ```

3. From ArrayBuffer of SWF (custom loader):
    * Load runtime: `..dist/runtime.js`
    * Construct player: `const player = new AWAYFL.Player()`.
    * Call `player.loadBuffer(arrayBuffer);`

