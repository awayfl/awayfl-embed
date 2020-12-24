import typescript from 'rollup-plugin-typescript2'
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
	input: './src/index.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'AWAYFL',
		file: './public/js/runtime.js'
	},
	plugins: [
		typescript({
			rollupCommonJSResolveHack:true,
		}),
		nodeResolve({
			mainFields: ['jsnext', 'mian', 'module']
		}),
		commonjs({
			include: /node_modules/,
			namedExports: {
				'random-seed': [ 'create' ],
				'../@awayjs/scene/node_modules/he/he.js': ['decode'],
				'../@awayfl/avm1/node_modules/random-seed/index.js':['create']
			},
		}),
		terser({
			// mangle: {
			// 	properties: {
			// 		reserved: ['startPokiGame', 'userAgent', 'Number', '__constructor__', 'prototype']
			// 	}
			// }
		})
	]
};