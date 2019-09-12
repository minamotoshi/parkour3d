import TWEEN from '@tweenjs/tween.js';
const EVENT = {
	PERSON_FAIL: "personFail"
}
/**
 *	人
 */
var Person = function(){
	var _this = this;
	var ORIGIN = new THREE.Vector3(8,51,137);
	var TARGET = new THREE.Vector3(0,51,-123);
	var __athlete = null;
	var _jump = null,
		_isJumping = false,
		_isTurning = false,
		JUMP_HEIGHT = 20,
		JUMP_DURATION = 500;
	var _turn = null,
		TURN_UNIT = 30;
	var _mixer = null,
		_action = null;
	var _life = 100.0,
		LOSS = 0.05,
		_isDead = false;
	_this.init = function(){
		THREE.Object3D.call(_this);
		__athlete = Preload.getModel("athlete");
		__athlete.rotation.y = Math.PI;
		_this.add(__athlete);
		_mixer = new THREE.AnimationMixer( __athlete );
		_action = _mixer.clipAction( __athlete.animations[ 0 ] );
		_action.play();
		_jump = new TWEEN.Tween( __athlete.position )
			.to( {y:JUMP_HEIGHT}, JUMP_DURATION )
			.easing( TWEEN.Easing.Cubic.Out );
		var fall = new TWEEN.Tween( __athlete.position )
			.to( {y:0}, JUMP_DURATION )
			.easing( TWEEN.Easing.Quadratic.In )
			.onComplete(function(){ _isJumping = false;_action.play(); });
		_jump.chain(fall);
		_turn = new TWEEN.Tween(__athlete.position)
			.onUpdate(e=>console.log(e))
			.onComplete(function(){ _isTurning = false;});
		lightInit();
	};
	function lightInit () {
		var ambient = new THREE.AmbientLight( 0xffffff, 0.7 );
		var point = new THREE.PointLight( 0xe8e8e8, 1, 5000 );
		point.position.set( -1226, 1169, 60 );
		_this.add(ambient, point);
	}
	_this.hide = function() {
		__athlete.visible = false;
	};
	_this.show = function() {
		__athlete.visible = true;
	};
	_this.update = function(delta){
		if(_mixer) _mixer.update(delta);
	};
	/**
	 *	设置摄像机
	 */
	_this.setCamera = function(camera){
		var v1 = ORIGIN.clone();
		var v2 = TARGET.clone();
		var o = _this.localToWorld(v1);
		var t = _this.localToWorld(v2);
		camera.position.copy(o);
		camera.lookAt(t);
	};
	/**
	 *	获取运动员
	 */
	_this.getAthlete = function(){
		var v = __athlete.position.clone();
		return _this.localToWorld(v);
	};
	/**
	 *	补给
	 */
	_this.serve = function(val){
		_life += val;
	};
	/**
	 *	失水
	 */
	_this.loss = function(){
		_life -= LOSS;
		if(_life < 0){
			_life = 0;
			_this.fail();
		}
	};
	/**
	 *	获取生命
	 */
	_this.getLife = function(){
		if(_life > 100) _life = 100.0;
		return Math.floor(_life);
	};
	/**
	 *	前进
	 */
	_this.forward = function(dis){
		if(_isDead) return;
		_this.position.z = -dis;
		_this.loss();
	};
	_this.fail = function(){
		_isDead = true;
		//_action.stop();
		//createjs.Sound.play("fail");
		new TWEEN.Tween( __athlete.position )
			.to( {y:5}, JUMP_DURATION )
			.start();
		new TWEEN.Tween( __athlete.rotation )
			.to( {x:-Math.PI/2}, JUMP_DURATION )
			.start();
		var e = { type: EVENT.PERSON_FAIL};
		_this.dispatchEvent(e);
	}
	/**
	 *	跳跃
	 */
	_this.jump = function(){
		if(_isJumping) return;
		_action.stop();
		createjs.Sound.play("jump");
		_isJumping = true;
		_jump.start();
	};
	/**
	 *	向左
	 */
	_this.left = function(){
		if(_isJumping || _isTurning) return;
		_isTurning = true;
		let x = __athlete.position.x>0?0:-TURN_UNIT;
		_turn.to( {x}, 500 )
			.start();
	};
	/**
	 *	向右
	 */
	_this.right = function(){
		if(_isJumping || _isTurning) return;
		_isTurning = true;
		let x = __athlete.position.x<0?0:TURN_UNIT;
		_turn.to( {x}, 500 )
			.start();
	};
	_this.init();
};
Person.prototype = Object.create( THREE.Object3D.prototype );
Person.prototype.constructor = Person;
Person.EVENT = EVENT;

export default Person;