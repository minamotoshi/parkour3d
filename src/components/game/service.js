/**
 *	送水人
 */
var Service = function(){
	var _this = this;
	var __entity = null,
		__bottle = null,
		__symbol = null;
	var _mixer = null,
		_action = null;
	var POS_X = 50,
		POS_Y = 10,
		POS_Z = 800,
		POS_MAX = 200,
		LIFE = 20;
	var _expire = 0;
	var _disenable = false;
	_this.init = function(){
		THREE.Object3D.call(_this);
		var __entity = Preload.getModel("service");
		__bottle = __entity.getObjectByName("Cylinder001"), 
		__symbol = __entity.getObjectByName("Cylinder002");
		_mixer = new THREE.AnimationMixer( __entity );
		_action = _mixer.clipAction( __entity.animations[ 0 ] );
		_action.play();
		resetting(0);
		_this.add(__entity);
	};
	_this.check = function(person){
		if(_this.position.z - person.position.z > POS_MAX){
			resetting(person.position.z);
		}
		if(_disenable) return;
		var d = _this.position.distanceTo(person.getAthlete());
		if(d < 50){
			_disenable = true;
			__bottle.visible = false;
			__symbol.visible = false;
			person.serve(LIFE);
			createjs.Sound.play("drink");
		}
	}
	function resetting (z) {
		var x = -POS_X;
		var z = z - POS_Z;
		if(Math.random() >0.5){
			x = POS_X;
			_this.rotation.y = Math.PI;
		}else{
			_this.rotation.y = 0;
		}
		_this.position.set(x, POS_Y, z);
		if(__bottle)__bottle.visible = true;
		if(__symbol)__symbol.visible = true;
		_disenable = false;
	}
	_this.update = function(delta){
		if(_mixer) _mixer.update(delta);
	};
	_this.init();
};
Service.prototype = Object.create( THREE.Object3D.prototype );
Service.prototype.constructor = Service;
export default Service;