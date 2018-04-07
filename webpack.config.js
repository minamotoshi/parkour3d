const path = require('path');
const Webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let obj = {
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
		new HtmlWebpackPlugin({
			title:"parkour"
		}),
		new Webpack.ProvidePlugin({
			THREE:"three",
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
							name: 'images/[1]-[name].[ext]'
						}
					},
					{
						loader: 'image-webpack-loader',
						options: {
							mozjpeg: {
								progressive: true,
								quality: 65
							},
							// optipng.enabled: false will disable optipng
							optipng: {
								enabled: false,
							},
							pngquant: {
								quality: '65-90',
								speed: 4
							},
							gifsicle: {
								interlaced: false,
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
	obj.plugins.push(u);
}
module.exports = obj;
