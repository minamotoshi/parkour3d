const path = require('path');
const Webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let config = {
	entry: './src/index.js',
	devServer: {
		port: 8000,
		hot: true,
		inline: true,
		progress: true,
		contentBase: './dist'
	},
	plugins:[
		new CleanWebpackPlugin('dist'),
		new Webpack.HotModuleReplacementPlugin(),
		new CopyWebpackPlugin(
			[
				{
					from:'./src/components/game/models/tex/',
					to:'./models/tex/'
				}
			],
			{debug: 'info'}
		),
		new HtmlWebpackPlugin({
			title:"parkour",
			meta: {viewport: 'width=device-width, initial-scale=1, user-scalable=no, shrink-to-fit=no'}
		}),
		new Webpack.ProvidePlugin({
			THREE:"three",
			//TWEEN:'@tweenjs/tween.js/src/dist/tween.esm.js',
			//Preload:"./components/game/preload",
			createjs:"latest-createjs"
		})
	],
	module:{	
		rules:[
			{
				test:/\.css$/i,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							regExp: /(\w+)[\/|\\](\w+)\.(png|jpg|gif)/i,
							name (file){
								return 'images/[1]-[name].[ext]';
							}
						}
					}
				]
			},
			{
				test: /\.(wav|mp3)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'sounds/[name].[ext]'
						}
					}
				]
			},
			{
				test: /\.(fbx|aeo|obj)$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'models/[name].[ext]'
						}
					}
				]
			}
		]
	},
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist')
	}
};

if(process.argv[3] == 'development'){
	
}else if(process.argv[3] == 'production'){
	let u = new UglifyJsPlugin();
	config.plugins.push(u);
}
module.exports = config;
