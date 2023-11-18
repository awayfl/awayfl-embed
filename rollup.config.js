import typescript from 'rollup-plugin-typescript2'
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace  from '@rollup/plugin-replace';
import { string } from 'rollup-plugin-string';
import { releaseLog } from './releaseLog';
import fs from 'fs';

const p = require('./package.json');

export default async (args) => {
	const VERSION = p.version;
	const DEPS = p.dependencies;
	const REAL_VERS = {};

	const depsRegister = Object.keys(DEPS)
		.filter(name => name.indexOf('away') > -1)
		.map( (name) => ({
			name: name,
			url: `./node_modules/${name}`
		}));

	const versions = depsRegister.map((e) => {
		const pstring = fs.readFileSync(`${e.url}/package.json`);
		const p = JSON.parse(pstring);

		REAL_VERS[e.name] = p.version;
		return `${e.name}:${p.version}`;
	});

	const versionMapped = [
		`Bundle version: ${VERSION}`,
		`Build at: ${new Date()}`,
		'='.repeat(10),
		'Modules:',
		...versions
	];
	
	const tags = p.lastUsedTags 
		? depsRegister.map((e) => p.lastUsedTags[e.name]) 
		: undefined;

	const releaseLogs = await releaseLog(depsRegister, tags);
	const releaseLogsMapped = releaseLogs
		.filter((e) => e.commits.length > 0)
		.map((e) => {
			// remove top 2 commits: tag and update version commit
			let commits = e.commits.filter((e, i) => {
				if (e.indexOf('Merge ') > -1) {
					return false;
				}
				
				if (e.indexOf('update version') > -1) {
					return false;
				}

				return true;
			});

			return `${e.name} (${e.endTag}-${e.currentTag}):\n\t${commits.join('\n\t')}`;
		});

	releaseLogsMapped.unshift(
		`Bundle version: ${VERSION}`,
		`Build at: ${new Date()}`,
		'---'
	);

	releaseLogsMapped.push('\n---\n');

	fs.writeFileSync('./dist/VERSIONS.txt', versionMapped.join('\n') + '\n');

	const data = fs.readFileSync('./HISTORY.txt', 'utf8');

	fs.writeFileSync('./HISTORY.txt', releaseLogsMapped.join('\n') + '\n' + data);
	fs.copyFileSync('./HISTORY.txt','./dist/HISTORY.txt');

	p.lastUsedTags = releaseLogs.reduce((acc, e) => (acc[e.name] = e.currentTag, acc) , {});

	fs.writeFileSync('./package.json', JSON.stringify(p, null, 2));
	
	//return;
	const EMBED_CONFIG = {
		input: './src/embed/index.ts',
		output: {
			sourcemap: true,
			format: 'iife',
			name: 'AwayEmbed',
			file: './dist/embed.js'
		},
		plugins: [
			string({
				include: "**/*.html",
			}),
			replace({
				__VERSION__: VERSION,
				__DATE__: new Date().toDateString(),
				preventAssignment: true
			}), 
			typescript({
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
	};

	const LOADER_CONFIG = {
		input: './src/loader/index.ts',
		output: {
			sourcemap: true,
			format: 'iife',
			name: 'AWAYFL',
			file: './dist/loader.js'
		},
		plugins: [
			replace({
				__VERSION__: VERSION,
				__DATE__: new Date().toDateString(),
				preventAssignment: true
			}), 
			typescript({
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
	};

	const RUNTIME_CONFIG = 
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
				__DATE__: new Date().toDateString(),
				preventAssignment: true
			}),
			typescript({
			}),
			nodeResolve({
				mainFields: ['jsnext', 'module']
			}),
			commonjs({
				include: /node_modules/
			}),
			terser({})
		]
	};


	const conf = [];

	if(args.embed) {
		delete args.embed
		conf.push(EMBED_CONFIG)
	}

	if(args.loader) {
		delete args.loader;
		conf.push(LOADER_CONFIG);
	}

	if(args.runtime) {
		delete args.runtime;
		conf.push(RUNTIME_CONFIG);
	}

	if (conf.length === 0)
		conf.push(EMBED_CONFIG, LOADER_CONFIG, RUNTIME_CONFIG);

	return conf;
}