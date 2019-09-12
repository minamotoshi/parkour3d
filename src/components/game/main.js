import TWEEN from '@tweenjs/tween.js';
import Person from './person';
import Field from './field';
import Service from './service';
import Prep from './prep';

/**
 *	版本
 */
const VER = "1.0";
/**
 *	事件
 */
const EVENT = {
	RUNNING:	"running",
	MODEL_LOADED:	"modeLoaded",
	PERSON_FAIL: "personFail",
	GAME_INIT: "gameInit",
	GAME_START:	"gameStart",
	GAME_OVER:	"gameOver"
}
/**
 *	主体
 */
var main = function(){
	var _this = this;
	
	var WIDTH = 0,
		HEIGHT = 0;
		
	var CAMERA = {
		x : 0,
		y : 0,
		z : 0,
		fov : 60,
		near : 10,
		far : 2000
	};
	var __camera = null,	//摄像头
		__scene = null,	//场景
		__renderer = null,	//渲染器
		__field = null,	//场地
		__person = null,	//人视角
		__prep = null,	//准备的人
		__service = null,	//送水人
		__environment = null;	//环境
	var _prepTween = null;
	var _pos = 0,
		SPEED = 3,
		_isRunning = false,
		_isPreping = false,
		DISTANCE = 1000;
	var _mixers = [];
	var _offset = new THREE.Vector2(0,0),
		THRESHOLD = 20;	//鼠标偏移
	var _life = 100,
		LOSS = 1;
	var _controls = null;	//控制器
	var _clock = new THREE.Clock();
	var __stats = null;	//fps
	/**
	 *	初始化
	 */
	_this.init = function(){
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;
		__camera = new THREE.PerspectiveCamera( CAMERA.fov, WIDTH / HEIGHT, CAMERA.near, CAMERA.far );
		__camera.position.set(0, 0, 100);
		__scene = new THREE.Scene();	//场景
		__renderer = new THREE.WebGLRenderer();	//渲染器
		__renderer.setPixelRatio( window.devicePixelRatio );
		__renderer.setSize( WIDTH, HEIGHT );
		__renderer.setClearColor(0x00aaaa);
		//TWEEN.autoPlay(true);
		//__stats = new Stats();
		//document.body.appendChild(__stats.dom);
		animate();
	};
	_this.resize = function(width, height){
		if(!width) width = window.innerWidth;
		if(!height) height = window.innerHeight;
		WIDTH = width;
		HEIGHT = height;
		__camera.aspect = WIDTH/HEIGHT;
		__camera.updateProjectionMatrix();
		__renderer.setSize( WIDTH, HEIGHT );
	};
	_this.getEntity = function(){
		return __renderer.domElement;
	};
	/**
	 *	启动
	 */
	_this.launch = function(){
		var texture = new THREE.Texture(Preload.getResult("sky"));
		texture.needsUpdate = true;
		__scene.background = texture;
		_clock = new THREE.Clock();
		__field = new Field();
		__person =  new Person();
		__person.position.z = 0;
		__person.position.y = __field.getTrackHeight();
		__person.addEventListener(Person.EVENT.PERSON_FAIL, onPersonFail);
		__service =  new Service();
		__service.check(__person, 0);
		__person.setCamera(__camera);
		__scene.add(__field, __person, __service);
		_this.ready();
	};
	_this.replay = function(){
		__scene.remove(__field, __person, __service);
		_this.launch();
		_this.start();
	}
	/**
	 *	游戏准备
	 */
	_this.ready = function(){
		_isPreping = true;
		__prep = new Prep();
		__prep.position.copy(__person.position);
		__scene.add(__prep);
		__person.hide();
		var v1 = __person.position.clone();
		var v2 = __person.position.clone();
		v1.add(new THREE.Vector3(100,100,100));
		v2.add(new THREE.Vector3(-100,100,100));
		//var v1 = new THREE.Vector3(100,100,100);
		//var v2 = new THREE.Vector3(-100,100,100);
		_prepTween = new TWEEN.Tween( v1 )
			.to( v2, 5000 )
			.yoyo( true )
			.repeat( Infinity )
			.easing( TWEEN.Easing.Quadratic.InOut )
			.onUpdate(function(){
				__camera.position.copy(v1);
				__camera.lookAt(__person.position);
			});
		_prepTween.start();
	};
	/**
	 *	游戏开始
	 */
	_this.start = function(){
		_pos = 0;
		_clock = new THREE.Clock();
		_isPreping = false;
		_isRunning = true;
		_prepTween.stop();
		__scene.remove(__prep);
		__person.show();
		_this.control();
	};
	/**
	 *	控制
	 */
	_this.control = function(){
		__renderer.domElement.addEventListener("touchstart", onTouchStart, false);
		__renderer.domElement.addEventListener("touchmove", onTouchMove, false);
		__renderer.domElement.addEventListener("touchend", onTouchEnd, false);
	};
	function onPersonFail (e) {
		_isRunning = false;
		var v = __person.position.clone();
		v.y = 200;
		new TWEEN.Tween( __camera.position )
			.to( v, 2000 )
			.onUpdate(function(){__camera.lookAt(__person.position)})
			.onComplete(gameOver)
			.easing( TWEEN.Easing.Cubic.InOut )
			.start();
	}
	/**
	 *	获取距离
	 */
	function getDistance () {
		return Math.floor(_pos / 20);
	}
	/**
	 *	获取时间
	 */
	function getTime () {
		var time = _clock.getElapsedTime();
		var second = Math.floor(time);
		var minute = Math.floor(second / 60);
		if(minute>60) minute = 60;
		second = second % 60;
		if(minute < 10) minute = "0" + minute;
		if(second < 10) second = "0" + second;
		var str = minute + ":" + second;
		return str;
	}
	/**
	 *	游戏结束
	 */
	function gameOver () {
		createjs.Sound.play("fail");
		_this.dispatchEvent({ type: EVENT.GAME_OVER, time: _clock.getElapsedTime(), dis: getDistance()});
	}
	function onTouchStart(e) {
		e.preventDefault();
		_offset.x = e.touches[0].clientX;
		_offset.y = e.touches[0].clientY;
	}
	function onTouchMove(e) {
		e.preventDefault();
		var offset = new THREE.Vector2(e.touches[0].clientX, e.touches[0].clientY);
		if(offset.y - _offset.y < -THRESHOLD){
			__person.jump();
		}
		if(offset.x - _offset.x < -THRESHOLD){
			__person.left();
		}else if(offset.x - _offset.x > THRESHOLD){
			__person.right();
		}else{
			//__person.reset();
		}
	}
	function onTouchEnd(e) {
		e.preventDefault();
		//__person.reset();
	}
	/**
	 *	动画
	 */
	function animate() {
		requestAnimationFrame( animate );
		TWEEN.update();
		if(__stats)__stats.update();
		if(_isPreping) __prep.update(_clock.getDelta());
		if(_isRunning){
			__person.setCamera(__camera);
			_pos += SPEED;
			__person.forward(_pos);
			var delta = _clock.getDelta();
			__person.update(delta);
			__service.update(delta);
			__service.check(__person);
			__field.route(__person);
			_this.dispatchEvent({ type: EVENT.RUNNING, life:__person.getLife(), time:_clock.getElapsedTime(), dis:getDistance()});
		}
		__renderer.clear();
		__renderer.render( __scene, __camera );
	}
	_this.init();
};

Object.assign( main.prototype, THREE.EventDispatcher.prototype);
main.prototype.constructor = main;

export {main,VER,EVENT};