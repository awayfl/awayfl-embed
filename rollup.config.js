import typescript from 'rollup-plugin-typescript2'
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import replace  from '@rollup/plugin-replace'
import fs from 'fs';

const p = require('./package.json');
const VERSION = p.version;
const DEPS = p.dependencies;
const REAL_VERS = {};

const versions = Object.keys(DEPS).map( (name) => {
	const pstring = fs.readFileSync(`./node_modules/${name}/package.json`);
	const p = JSON.parse(pstring);

	REAL_VERS[name] = p.version;
	return `${name}:${p.version}`;
});

const emit = [
	`Bundle version: ${VERSION}`,
	`Build at: ${new Date()}`,
	'='.repeat(10),
	'Modules:',
	...versions
];

console.log(JSON.stringify(JSON.stringify(DEPS)));

fs.writeFileSync('./dist/VERSIONS.txt', emit.join('\n'));

export default [
{
	input: './src/loader/index.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'AwayLoader',
		file: './dist/loader.js'
	},
	plugins: [
		replace({
			__VERSION__: VERSION,
			__DATE__: new Date().toDateString(),
		}), 
		typescript({
			rollupCommonJSResolveHack:true,
			tsconfigOverride: {
				compilerOptions: {
					target: 'es2017'
				}
			}
		}),
		nodeResolve({
			mainFields: ['jsnext', 'module']
		}),
		commonjs({
			include: /node_modules/,
		}),
		terser({})
	]
},
{
	input: './src/runtime.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'AWAYFL',
		file: './dist/runtime.js'
	},
	plugins: [
		replace({
			__VERSION__: VERSION,
			__LIBS__: JSON.stringify(JSON.stringify(REAL_VERS)),
			__DATE__: new Date().toDateString()
		}),
		typescript({
			rollupCommonJSResolveHack:true,
		}),
		nodeResolve({
			mainFields: ['jsnext', 'module']
		}),
		commonjs({
			include: /node_modules/,
			namedExports: {
				'random-seed': [ 'create' ],
				'../@awayjs/scene/node_modules/he/he.js': ['decode'],
				'../@awayfl/avm1/node_modules/random-seed/index.js':['create']
			},
		}),
		terser({})
	]
}
];