import path from 'path';
import defaultConfig from '@wordpress/scripts/config/webpack.config.js';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

const plugins = defaultConfig.plugins.filter(
	( plugin ) => plugin.constructor.name !== 'RtlCssPlugin'
);

export default {
	...defaultConfig,
	entry: {
		index: './src/index.js',
		blocks: './src/blocks/index.js',
	},
	output: {
		path: path.resolve( import.meta.dirname, 'build' ),
		filename: '[name].js',
	},
	watchOptions: {
		ignored: [ '**/build' ],
	},
	module: {
		...defaultConfig.module,
		rules: [
			...defaultConfig.module.rules,
			{
				test: /\.scss$/i,
				include: path.resolve( import.meta.dirname, 'src' ),
				use: [ 'postcss-loader' ],
			},
		],
	},
	plugins: [ ...plugins, new CleanWebpackPlugin() ],
};
