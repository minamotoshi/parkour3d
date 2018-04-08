import FBXLoader from 'three-fbx-loader';

const VER = 1.0;
const EVENT = {
	MODEL_LOADED:'modelLoaded'
};
/**
 *	模型
 *	@param {string}	模型地址
 */
var main = function(url){
	var _this = this;
	var __object = null;
	_this.init = function(url){
		let manager = new THREE.LoadingManager();
		manager.onProgress = function( item, loaded, total ) {
			//console.log( item, loaded, total );
		};
		let loader = new FBXLoader( manager );
		loader.load( url, onload, onProgress, onError );
	};
	_this.getObject = function(){
		var o = __object.clone();
		o.animations = __object.animations;
		return o;
	};
	_this.o = function(){
		return __object;
	}
	function onload (object) {
		__object = object;
		var e = { type: EVENT.MODEL_LOADED };
		_this.dispatchEvent(e);
	}
	function onProgress (e) {
		//console.log(e);
	}
	function onError (e) {
		console.log(e);
	}
	_this.init(url);
};
main.prototype = Object.create( THREE.EventDispatcher.prototype );
main.prototype.constructor = main;

export {main, EVENT, VER};