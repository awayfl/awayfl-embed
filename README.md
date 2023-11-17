AwayFL Embedded Player
==================
AwayFL helps you save your Flash games and keep them running after 2020!

Check your game on:
https://exponenta.games/games/AFL/

__How to use__

There are 3 main ways to use AwayFL on your site:

1. [Overriding the `swfObject` API](./example/index.html)
    * Load the AwayFL player by adding a script tag to your HTML file. For example:
        `<script src="../dist/embed.js"></script>`
    * Load your SWF file using the [swfObject API](https://web.archive.org/web/20140704095451if_/http://code.google.com/p/swfobject/wiki/documentation#STEP_3:_Embed_your_SWF_with). For example:
        `swfObject.embedSWF('Embedded.swf', 'container', '550', '400');`
    * Optional: Configure AwayFL using the `AWAY_EMBED_CFG` variable.
        This allows you to customize AwayFL's behavior. For a list of available options, see the [IBindingConfig interface](./src/embed/AwayPlayerComponent.ts).

2. Using the AwayFL loader and a custom config:
    * Grab the template from [/src/embed/embed.html](./src/embed/embed.html)
    * Replace `__LOADER_URL__` with the URL of the AwayFL loader script (`loader.js`)
    * Replace `__GAME_CONFIG__` with a game configuration JSON (or object) conforming to the [AwayFL config interface](./src/loader/iConfigBase.ts).
    * To run your game, add a `GAME` resource record to the `binary` array of the game configuration.
      * Example: `{path: path/to/game.swf, resourceType:'GAME'}`
    * If your game uses external fonts, you will need to create separate SWF file(s) containing these fonts, then add font resource records to the `binary` array. 
      * Example: `{path: path/to/font.swf, resourceType:'FONTS'}`
    
    Full Example:
    ```
    const gameConfig = {
        width: 550,
        height: 400,
        splash: './splash.png',
        progress: { // optional
            back: 'cover url(./progressBack.png)',
            line: #cc0022, // or image, it will passed to progressLine background,
            rect: [0, 0.9, 1, 0.1] // x, y, width, height of preogress line relative container 
        },
        baseUrl: '../dist',
        runtime: ['../dist/runtime.js'],
        binary: [{
            path: 'Embedded.swf',
            resourceType: 'GAME',
            name: 'Game', // not used atm
            meta: {} // not used atm
        }],
    }
    ```

3. Creating a custom loader that loads SWF data from an ArrayBuffer:
    * Load the AwayFL runtime from `dist/runtime.js`
    * Construct the player: `const player = new AWAYFL.Player();`
    * Call `player.loadBuffer(arrayBuffer);`

