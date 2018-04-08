/**
 *	准备动作
 */
var Prep = function(){
	var _this = this;
	var __entity = null,
		__bottle = null,
		__symbol = null;
	var _mixer = null,
		_action = null;
	_this.init = function(){
		THREE.Object3D.call(_this);
		var __entity = Preload.getModel("prep");
		_mixer = new THREE.AnimationMixer( __entity );
		var clip = __entity.animations[ 0 ];
		_action = _mixer.clipAction( clip );
		_action.play();
		_this.add(__entity);
	};
	_this.update = function(delta){
		if(_mixer) _mixer.update(delta);
	};
	_this.init();
};
Prep.prototype = Object.create( THREE.Object3D.prototype );
Prep.prototype.constructor = Prep;

export default Prep;