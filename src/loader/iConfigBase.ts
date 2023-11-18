
export interface IFile {
	name: string;
	path: string;
	meta: any;
	resourceType: string;
	type: 'swf' | 'js' ,
	data: ArrayBuffer;
	size?: number;
}

export interface IGameConfigBase {
	x: number | string;
	y: number | string;
	w: number | string;
	h: number | string;

	width: number;
	height: number;
	backgroundColor: string,
	splash: string;
	start?: string;
	progress?: {
		back: string;
		rect: [number, number, number, number],
		line: string;
		direction?: 'lr' | 'tb'
	},
	runtime?: Array<IFile | string> | string;
	binary?: Array<IFile | string> | string;
	progressParserWeight?: number;
	files?: IFile[];
	debug?: boolean;
}