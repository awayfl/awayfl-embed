!function(){"use strict";const t=document.currentScript.src,e=new URL(".",t).href,r=new URL("./assets/splash.jpg",e).href;class n extends HTMLElement{static get observedAttributes(){return["src","width","height"]}get player(){return this._player}get config(){return this._runConfig}set config(t){this._runConfig=t}get src(){return this._runConfig.src||this.getAttribute("src")}set src(t){this._runConfig.src=t}set width(t){this._runConfig.width=t}get width(){return this._runConfig.width||this.getAttribute("width")}set height(t){this._runConfig.height=t}get height(){return this._runConfig.height||this.getAttribute("height")}set runtimeBaseUrl(t){this._runConfig.runtimeBaseUrl=t}get runtimeBaseUrl(){return this._runConfig.runtimeBaseUrl}constructor(){super(),this._runConfig={},this.onError=this.onError.bind(this),this._root=this.attachShadow({mode:"closed"})}_getRuntimeUrl(){const t=this._runConfig.runtimeBaseUrl;return{loader:new URL("loader.js",t).href,runtime:new URL("runtime.js",t).href,baseUrl:t}}_dropPlayer(){this._gameFrame&&(this._gameFrame.remove(),this._player=null)}onError(t){const e=this._runConfig.onError&&self[this._runConfig.onError];"function"==typeof e&&e(t),this.dispatchEvent(new ErrorEvent("error",{error:new Error("Awayfl runtime error"),message:(null==t?void 0:t.message)||t}))}_attachRuntimeEvents(){const t=this._gameFrame.contentWindow;t.addEventListener("awayfl-player-init",(({detail:t})=>{this._player=t}),{once:!0}),t.addEventListener("awayfl-player-load",(()=>{const t=this._runConfig.onLoad&&self[this._runConfig.onLoad];"function"==typeof t&&t(),this.dispatchEvent(new CustomEvent("load")),this._gameFrame.style.display=""}),{once:!0}),t.addEventListener("awayfl-player-progress",(({detail:t})=>{const e=this._runConfig.onProgress&&self[this._runConfig.onProgress];"function"==typeof e&&e(t),this.dispatchEvent(new CustomEvent("progress",{detail:t}))}))}_buildTemplate(t){const e='<!DOCTYPE html>\r\n<head>\r\n\t<meta name="viewport"\r\n\t\tcontent="height=device-height, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui" />\r\n\t<title>AwayFL Embedded Player 0.1.0</title>\r\n\t<style>\r\n\t\t* {\r\n\t\t\tmargin: 0;\r\n\t\t\tpadding: 0;\r\n\t\t}\r\n\r\n\t\tcanvas {\r\n\t\t\toutline: none\r\n\t\t}\r\n\r\n\t\thtml, body, #container {\r\n\t\t\tmargin: 0;\r\n\t\t\toverflow: hidden;\r\n\t\t\twidth: 100%;\r\n\t\t\theight: 100%;\r\n\t\t}\r\n\r\n\t\t#splash__image {\r\n\t\t\twidth: 100%;\r\n\t\t\theight: 100%;\r\n\t\t\tposition: absolute;\r\n\t\t\tbackground-size: contain;\r\n\t\t\tbackground-position: center;\r\n\t\t\tbackground-repeat: no-repeat;\r\n\t\t\tvisibility: visible;\r\n\t\t\ttransition: all 0.5s;\r\n\t\t\tz-index: 10;\r\n\t\t}\r\n\r\n\t\t#progress__root {\r\n\t\t\tposition: absolute;\r\n\t\t}\r\n\r\n\t\t#progress__line {\r\n\t\t\twidth: 0;\r\n\t\t\theight: 100%;\r\n\t\t\ttransition: all 0.5s;\r\n\t\t}\r\n\t</style>\r\n\t<script src="__LOADER_URL__"><\/script>\r\n</head>\r\n\r\n<body>\r\n\t<div id="splash__image">\r\n\t\t<div id="progress__root">\r\n\t\t\t<div id="progress__line"></div>\r\n\t\t</div>\r\n\t</div>\r\n\t<script>\r\n\t\twindow.addEventListener("load", () => {\r\n\r\n\t\t\tconst config = JSON.parse(__GAME_CONFIG__);\r\n\r\n\t\t\tAWAYFL.LegacyLoader.init(config);\r\n\t\t\tAWAYFL.LegacyLoader.runGame((fill) => {\r\n\t\t\t\twindow.dispatchEvent(new CustomEvent(\'awayfl-player-progress\', {detail: fill}));\r\n\t\t\t}, (config, hideLoader) => {\r\n\t\t\t\tconst player = new AWAYFL.Player(document, config);\r\n\t\t\t\twindow.dispatchEvent(new CustomEvent(\'awayfl-player-init\', {detail: player}));\r\n\t\t\t\tplayer\r\n\t\t\t\t\t.loadAndPlay()\r\n\t\t\t\t\t.then((_, hide) => {\r\n\t\t\t\t\t\twindow.dispatchEvent(new CustomEvent(\'awayfl-player-load\'));\r\n\t\t\t\t\t\thide && hide() || window.swfParseComplete && window.swfParseComplete();;\r\n\t\t\t\t\t});\t\t\t\t\r\n\t\t\t})\r\n\t\t});\r\n\t<\/script>\r\n</body>',r=this._getRuntimeUrl(),n={width:t.clientWidth,height:t.clientHeight,backgroundColor:this._runConfig.backgroundColor,splash:this._runConfig.splash,progress:this._runConfig.progress,runtime:[r.runtime],binary:[{path:this._runConfig.src,resourceType:"GAME",name:"Game",meta:{}}],baseUrl:r.baseUrl,maxStageScale:+this._runConfig.maxStageScale,runtimeFlags:{defaultSmoothBitmap:!!this._runConfig.smoothBitmaps}};return e.replace(/__LOADER_URL__/,r.loader).replace(/__GAME_CONFIG__/,JSON.stringify(JSON.stringify(n)))}_constructPlayer(){const t=this._root,e=document.createElement("iframe");e.style.border="none",e.style.display=this._runConfig.hideBeforeLoad?"none":"",e.width=""+this._runConfig.width,e.height=""+this._runConfig.height,this._gameFrame=e,t.appendChild(e),e.addEventListener("load",this._attachRuntimeEvents.bind(this),{once:!0}),e.addEventListener("error",this.onError),e.srcdoc=this._buildTemplate(e)}_mapAttrs(){const t=this.querySelectorAll("param"),e=this.getAttributeNames(),r=n.BINDING_CONFIG;t.forEach((t=>{t.name in r&&(this._runConfig[t.name]=t.value)})),e.forEach((t=>{t in r&&(this._runConfig[t]=this.getAttribute(t))}))}_loadGlobalConfig(){const t=window.AWAY_EMBED_CFG,e=n.BINDING_CONFIG;for(const[r,n]of Object.entries(t))r in e&&(this._runConfig[r]=n)}_setDefaults(){const t=n.BINDING_CONFIG;for(const e in t){if(t[e].required&&void 0===this._runConfig[e])throw`Parameter ${e} is required!`;void 0===this._runConfig[e]&&(this._runConfig[e]=t[e].default)}}connectedCallback(){setTimeout((()=>{this._loaderHolder=this.querySelector("div.awayfl__loader"),this._loadGlobalConfig(),this._mapAttrs(),this._setDefaults(),this._constructPlayer();const t=document.createElement("style");t.textContent=`\n            :host {\n                display: block;\n                contain: content;\n                width: ${this._runConfig.width};\n                height: ${this._runConfig.height};\n            }\n            `,this._root.appendChild(t)}))}disconnectedCallback(){this._dropPlayer()}attributeChangedCallback(t,e,r){if(this.isConnected)return"src"===t&&this._player?(this._dropPlayer(),this._runConfig.src=r,void this._constructPlayer()):void("width"!==t&&"height"!==t||this._root.styleSheets[0].insertRule(`:host { ${t}: ${r};}`))}}n.BINDING_CONFIG={version:{required:!1,default:"latest"},runtimeBaseUrl:{required:!1,default:e},src:{required:!0},avm1:{required:!1,default:!1},width:{required:!1,default:550},height:{required:!1,default:400},onLoad:{required:!1},onProgress:{required:!1},onError:{required:!1},scaleMode:{required:!1,default:"all"},autoplay:{required:!1,default:!0},hideBeforeLoad:{required:!1,default:!1},maxStageScale:{required:!1,default:void 0},backgroundColor:{required:!1,default:"black"},splash:{required:!1,default:r},progress:{required:!1,default:{direction:"lr",back:"#130d02",line:"#f29f01",rect:[.25,.77,.5,.01]}},smoothBitmaps:{required:!1,default:!1}},customElements.define("awayfl-player",n);const i=t=>console.warn("AwayFL loader does not support "+t);document.currentScript.src;const s=window;let o;(s.swfObject||s.swfobject)&&console.warn("Replace `swfObject` with AwayFl loader!"),document.addEventListener("load",(()=>{}));const a={registerObject:()=>i("registerObject"),getObjectById:()=>i("getObjectById"),switchOffAutoHideShow:()=>i("switchOffAutoHideShow"),enableUriEncoding:()=>i("enableUriEncoding"),getFlashPlayerVersion:()=>i("getFlashPlayerVersion"),createSWF:()=>i("createSWF"),showExpressInstall:()=>i("showExpressInstall"),createCSS:()=>i("createCSS"),getQueryParamValue:()=>i("getQueryParamValue"),get ua(){return i("ua")},embedSWF:function(t,e,r,i,a,l,d,h,u,c){const g="string"==typeof e?document.getElementById(e):e,f=function(t,e,r,i){s.AWAY_EMBED_CFG||(console.info("AwayFL configuration not found. To set custom options, define a `AWAY_EMBED_CFG` object as explained in the Readme"),s.AWAY_EMBED_CFG={}),o=s.AWAY_EMBED_CFG;const a=new n;a.src=t,a.width=r,a.height=i;let l=o.runtimeBaseUrl;l&&(a.runtimeBaseUrl=l);const d=e.id,h=e.className,u=e.parentElement;return e.id=null,e.className="",a.id=d,a.className=h,u.replaceChild(a,e),a}(t,g,r,i);f.onload=()=>{c&&c({success:!0,ref:f,id:g.id})}}};s.swfObject=a,s.swfobject=a}();
//# sourceMappingURL=embed.js.map
