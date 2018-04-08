/**
 *	声音
 */
var Sounds = function() {
	var _this = this;
	var _sounds = {};
	_this.init = function(){
		_sounds = {};
	}
	_this.add = function(key){
		var instance = createjs.Sound.play(key);
		instance.stop();
		_sounds[key] = instance;
	};
	_this.play = function(key){
		var instance = _sounds[key];
		instance.play();
		return instance;
	};
	_this.stop = function(key){
		var instance = _sounds[key];
		instance.stop();
		return instance;
	};
	_this.stopAll = function(){
		for (var k in _sounds) {
			var instance = _sounds[key];
			instance.stop();
		}
	};
	_this.init();
};
Sounds.prototype = Object.create( THREE.EventDispatcher.prototype );
Sounds.prototype.constructor = Sounds;
export default Sounds;