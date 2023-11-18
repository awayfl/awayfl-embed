import { IGameConfigBase } from "./iConfigBase";

const transformRel = (val: string | number, base: number) => {
	if (typeof val !== 'string') return +val;
	return val.includes("%")
		? (parseFloat(val) / 100) * base
		: parseFloat(val);
}

export class ProgressUI {
	splash: HTMLDivElement;
	prRoot: HTMLDivElement;
	prLine: HTMLDivElement;

	constructor (
		public root: HTMLElement | HTMLDocument = document, 
		public config: IGameConfigBase) 
	{
		this.onUpdate = this.onUpdate.bind(this);
		this.onProgress = this.onProgress.bind(this);

		window.addEventListener("resize", this.onUpdate);
	}

	build() {
		this.splash = this.root.querySelector<HTMLDivElement>("#splash__image");
		this.prRoot = this.root.querySelector<HTMLDivElement>("#progress__root");
		this.prLine = this.root.querySelector<HTMLDivElement>("#progress__line");
	}

	init() {
		this.build();

		if(!this.splash) {
			return;
		}

		const config = this.config;

		if (config.backgroundColor) {
			document.body.style.backgroundColor = config.backgroundColor;
		}

		if (config.splash) {
			Object.assign( this.splash.style, {
				backgroundImage: `url(${config.splash})`,
				visibility: "visible",
			});
		}

		const pr_conf = config.progress;
		if (typeof pr_conf === "object") {
			pr_conf.rect = pr_conf.rect || [0.1, 0.9, 0.8, 0.01];

			Object.assign(this.prRoot.style, {
				background: pr_conf.back,
				left: `${100 * pr_conf.rect[0]}%`,
				top: `${100 * pr_conf.rect[1]}%`,
				width: `${100 * pr_conf.rect[2]}%`,
				height: `${100 * pr_conf.rect[3]}%`,
			});
	
			Object.assign(this.prLine.style, {
				background: pr_conf.line,
			});
		}

		this.onUpdate();
	}

	onProgress (p: number) {
		const pr_conf = this.config.progress;

		if (!this.prLine || !pr_conf) {
			return;
		}

		switch (pr_conf.direction) {
			case "tb": {
				Object.assign(this.prLine.style, {
					height: `${p * 100}%`,
					width: "100%",
				});
				break;
			}
			case "lr":
			default: {
				Object.assign(this.prLine.style, {
					height: "100%",
					width: `${p * 100}%`,
				});
			}
		}
	}

	onUpdate() {
		if (!this.splash) {
			return;
		}

		const config = this.config;
		let x = transformRel(config.x, window.innerWidth) || 0;
		let y = transformRel(config.y, window.innerHeight) || 0;
		let w = transformRel(config.w, window.innerWidth) || window.innerWidth;
		let h = transformRel(config.h, window.innerHeight) || window.innerHeight;
		
		const minMax = Math.min(h / config.height, w / config.width);
		const rw = Math.ceil(config.width * minMax);
		const rh = Math.ceil(config.height * minMax);
		const rx = x + (w - rw) / 2;
		const ry = y + (h - rh) / 2;

		Object.assign(this.splash.style, {
			width: `${rw}px`,
			height: `${rh}px`,
			left: `${rx}px`,
			top: `${ry}px`,
		});
	}

	ready () {
		if(!this.splash) {
			return;
		}

		if(this.config.start) {
			this.splash.style.background = `url(${this.config.start})`;
		}

		Object.assign(this.prRoot.style, {
			visibility: "hidden",
			opacity: 0,
		});
	}

	hide (dispose: boolean = false) {
		if (!this.splash) {
			return;
		}

		Object.assign(this.prRoot.style, {
			visibility: "hidden",
			opacity: 0,
		});

		Object.assign(this.splash.style, {
			visibility: "hidden",
			opacity: 0,
		});

		const promise = new Promise((res) => setTimeout(res, 500));
		if (!dispose) {
			return promise;
		}

		return promise.then( () => this.dispose());
	}

	dispose () {
		if(!this.splash) {
			return;
		}

		window.removeEventListener('resize', this.onUpdate);
		this.splash.remove();
		this.prRoot.remove();
		this.splash = null;
	}
}
