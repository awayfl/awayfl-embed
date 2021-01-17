export const supportDecoderApi = ('DecompressionStream' in self);
export const isSWC = (head:Uint8Array) => (head[0] === 0x43 && head[1] === 0x57 && head[2] === 0x53);
export const outputSize = (head: Uint8Array) => new DataView(head.buffer).getUint32(4, true);

/*
declare global {
    interface Window { DecompressionStream: any; }
}*/

export function Decoder(size: number, offset = 8) {
	if(!supportDecoderApi) {
		throw 'Your browser not support DecompressionStream =(';
	}

	const decoder = new self.DecompressionStream('deflate');
	const decoderW = decoder.writable.getWriter();
	const decoderR = decoder.readable.getReader();
	const buffer = new Uint8Array(size);

	let isRunned = false;
	let isDone = false;

	let donableCallback: () => void;

	function run() {
		decoderR.read().then(function next(state: {done: boolean, value: Uint8Array}) {
			const done = state.done;
			const value = state.value;

			if (value) {
				buffer.set(value, offset);
				//console.debug("[Loader] Decoded chunk:", offset);

				offset += value.length;
			}

			if (done || offset >= size) {
				isDone = true;

				if(donableCallback) {
					donableCallback();
				}

				console.debug("[Loader] Decoder closed:", offset);
				return;
			}

			return decoderR.read().then(next);
		});
	}

	return {
		get buffer() {
			return buffer;
		},
		
		write(buffer: Uint8Array) {
			decoderW.ready.then(()=>{
				decoderW.write(buffer);

				if(!isRunned) {
					isRunned = true;
					run();
				}
			});
		},

		readAll() {
			if(isDone) {
				return Promise.resolve(buffer);
			}

			return new Promise((res)=>{
				donableCallback = () => {
					res(buffer);
				}
			})
		}
	}
}