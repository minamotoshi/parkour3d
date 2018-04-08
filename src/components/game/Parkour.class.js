/****************************************************************************
*	@Copyright(c)	2017,保定无双软件
*	@desc	跑酷
*	@date	2017-11-22
*	@author	minamoto
*	@E-mail	jiangtai@wushuang.me
*	@file	js/Parkour.class.js
*	@modify	null
******************************************************************************/
var Parkour = {};
Parkour.VER = "2.0.1";
/**
 *	事件
 */
Parkour.Event = {
	RUNNING:	"running",
	MODEL_LOADED:	"modeLoaded",
	PERSON_FAIL: "personFail",
	GAME_INIT: "gameInit",
	GAME_START:	"gameStart",
	GAME_OVER:	"gameOver"
}
/**
 *	预先加载
 */
Parkour.Preload = {
	_queue : null,	//loder
	_images : [	//图片组
		{id:"sky", src:"sky.jpg"},
		{id:"pool", src:"pool.jpg"}
	],
	_fonts : [	//字体
		{id:"helvetiker", src:"helvetiker_regular.typeface.json"}
	],
	_objs : [	//物体模型
		{id:"gold", src:"gold.fbx"},
		{id:"prep", src:"prep.fbx"},
		{id:"tree0", src:"tree0.fbx"},
		{id:"tree1", src:"tree1.fbx"},
		{id:"athlete", src:"athlete.fbx"},
		{id:"service", src:"service.fbx"},
		{id:"field", src:"field.fbx"},
		{id:"hurdle", src:"hurdle.fbx"}
	],
	_sounds : [	//声音
		{id:"gain", src:"gain.mp3"},//获取金币
		{id:"drink", src:"drink.mp3"},//喝水
		{id:"fail", src:"fail.mp3"},//失败
		{id:"jump", src:"jump.mp3"},//跳跃
		{id:"drown", src:"drown.mp3"},//落水
		{id:"hurt", src:"hurt.mp3"}//撞到障碍
	],
	/**
	 *	初始化
	 */
	init : function(){
		this._queue = new createjs.LoadQueue(false);
		this._queue.loadManifest(this._images, false, "textures/");
		this._queue.loadManifest(this._objs, false, "models/");
		//this._queue.loadManifest(this._fonts, false, "fonts/");
		this._queue.loadManifest(this._sounds, false, "sounds/");
		//createjs.Sound.alternateExtensions = ["mp3"];
		//createjs.Sound.addEventListener("fileload", this.soundLoaded);
		createjs.Sound.registerSounds(this._sounds);
	},
	/**
	 *	加载
	 */
	load : function(progress, complete){
		if(!this._queue) Parkour.Preload.init();
		this._queue.on("fileload", this.onFileLoad);
		if(progress)this._queue.on("progress", progress, this);//资源载入中
		if(complete)this._queue.on("complete", complete, this);//资源载入完毕
		this._queue.load();
	},
	onFileLoad : function(e){
		var item = e.item;
		var queue = e.target;
		if(item.ext == "fbx"){
			queue.setPaused(true);
			var model = new Parkour.FbxModel(item.src);
			Parkour.Preload.addModel(item.id, model);
			model.addEventListener(Parkour.Event.MODEL_LOADED, function(e){
				queue.setPaused(false);
			});
		}
	},
	/**
	 *	模型
	 */
	_models:{},
	/**
	 *	添加模型
	 */
	addModel: function(id, model){
		this._models[id] = model;
	},
	/**
	 *	获取模型
	 */
	getModel: function(id){
		var obj = this._models[id].getObject();
		return obj;
	},
	/**
	 *	获取loader
	 */
	getQueue : function(){
		return this._queue;
	},
	/**
	 *	获取文件实体
	 */
	getResult : function(id){
		return this._queue.getResult(id);
	}
};
/**
 *	声音
 */
Parkour.Sounds = {};
/**
 *	主体
 */
Parkour.main = function(container){
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
	_this.init = function(container){
		WIDTH = window.innerWidth;
		HEIGHT = window.innerHeight;
		__camera = new THREE.PerspectiveCamera( CAMERA.fov, WIDTH / HEIGHT, CAMERA.near, CAMERA.far );
		__camera.position.set(0, 0, 100);
		__scene = new THREE.Scene();	//场景
		var texture = new THREE.Texture(Parkour.Preload.getResult("sky"));
		texture.needsUpdate = true;
		__scene.background = texture;
		__renderer = new THREE.WebGLRenderer({canvas: container});	//渲染器
		__renderer.setPixelRatio( window.devicePixelRatio );
		__renderer.setSize( WIDTH, HEIGHT );
		__renderer.setClearColor(0x00aaaa);
		//__renderer.localClippingEnabled = true;
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
	/**
	 *	启动
	 */
	_this.launch = function(){
		_clock = new THREE.Clock();
		__field = new Parkour.Field();
		__person =  new Parkour.Person();
		__person.position.z = 0;
		__person.position.y = __field.getTrackHeight();
		__person.addEventListener(Parkour.Event.PERSON_FAIL, onPersonFail);
		__service =  new Parkour.Service();
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
		__prep = new Parkour.Prep();
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
		_this.dispatchEvent({ type: Parkour.Event.GAME_OVER, time: _clock.getElapsedTime(), dis: getDistance()});
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
			_this.dispatchEvent({ type: Parkour.Event.RUNNING, life:__person.getLife(), time:_clock.getElapsedTime(), dis:getDistance()});
		}
		__renderer.clear();
		__renderer.render( __scene, __camera );
	}
	_this.init(container);
};

Object.assign( Parkour.main.prototype, THREE.EventDispatcher.prototype);
Parkour.main.prototype.constructor = Parkour.main;
/**
 *	场地
 */
Parkour.Field = function(){
	var _this = this;
	var DISTANCE = 2000;
	var TRACK_X = 31,
		TRACK_Y = 4;
	var __entity = null;
	_this.init = function(){
		THREE.Object3D.call(_this);
		var early = new Parkour.Track();
		early.actual();
		var last = new Parkour.Track();
		last.regular();
		early.position.z = DISTANCE*9/10;
		last.position.z = -DISTANCE/10;
		_this.add(early, last);
	};
	/**
	 *	场地添加以及删除
	 */
	_this.route = function(person) {
		var dis = person.position;
		var current = _this.children[0];
		if(_this.children[0].position.distanceTo(dis) > DISTANCE){
			current = _this.children[1];
		}
		current.checkGolds(person);
		current.checkHurdles(person);
		current.checkPools(person);
		if(_this.children[_this.children.length - 1].position.distanceTo(dis)< DISTANCE * 0.5){
			var o = new Parkour.Track();
            o.setFactor(person.position.z);
			o.regular();
			o.position.copy(_this.children[0].position);
			o.position.z = _this.children[_this.children.length - 1].position.z - DISTANCE;
			_this.add(o);
		}
		if(_this.children[0].position.distanceTo(dis) > DISTANCE*1.5){
			_this.remove(_this.children[0]);
		}
	}
	_this.getTrackHeight = function(){
		return TRACK_Y;
	};
	_this.init();
};
Parkour.Field.prototype = Object.create( THREE.Object3D.prototype );
Parkour.Field.prototype.constructor = Parkour.Field;
/**
 *	跑道
 */
Parkour.Track = function(){
	var _this = this;
	var WIDTH = 90,
		HEIGHT = 2000,
		PLAT_WIDTH = 90,
		PLAT_HEIGHT = 90,
		LINE_WIDTH = 3,
		TRACK_WIDTH = 28,
		TRACK_MAX = 600,
		TRACK_MIN = 300,
		POOL_MAX = 400,
		POOL_MIN = 100,
		HURDLE_MIN = 200,
		HURDLE_MAX = 300,
		GOLD_X = 30,
		GOLD_Y = 20,
		GOLD_Z = 200,
		TREE_X = 150,
		TREE_MIN = 100,
		TREE_MAX = 200,
		TYPE_TRACK = 1,
		TYPE_POOL = 0,
		DEPTH = 4;
	var _factor = 0.4;
	var __golds = null,
		__hurdles = null,
		__pools = null;
	_this.init = function(){
		THREE.Object3D.call(_this);
		var obj = Parkour.Preload.getModel("field");
		__golds = new THREE.Group();
		__hurdles = new THREE.Group();
		__pools = new THREE.Group();
		_this.add(obj,__pools, __hurdles, __golds);
		createTree();
		for(var i = 0;i < 2;i++){
			var line = createLine();
			line.position.x = i * (TRACK_WIDTH + LINE_WIDTH) - (TRACK_WIDTH + LINE_WIDTH)/2;
			_this.add(line);
		}
	};
	/**
	 *	标准的
	 */
	_this.regular = function(){
		var pos = [0, TRACK_WIDTH + LINE_WIDTH, -TRACK_WIDTH - LINE_WIDTH];
		var index = Math.floor(Math.random() * pos.length);
		var x = pos.splice(index, 1);
		createRoad(x);
		createRoad(pos[0], true);
		createRoad(pos[1], true);
		createGold();
	};
	/**
	 *	实际的
	 */
	_this.actual = function(){
		createRoad(0, true, true);
		createRoad(TRACK_WIDTH + LINE_WIDTH, true, true);
		createRoad(-TRACK_WIDTH - LINE_WIDTH, true, true);
	};
	_this.setFactor = function(dis){
        _factor = Math.abs(dis/HEIGHT) * 0.1 + 0.4;
	};
	/**
	 *	检测金币
	 */
	_this.checkGolds = function(person){
		__golds.children.forEach(gold=>{
			var p1 = gold.position.clone();
			_this.localToWorld(p1);
			var p2 = person.getAthlete();
			p2.y = GOLD_Y;
			var d = p1.distanceTo(p2);
			if(d < 10){
				__golds.remove(gold);
				createjs.Sound.play("gain");
				person.serve(1);
			}
		});
	};
	/**
	 *	检测障碍
	 */
	_this.checkHurdles = function(person){
		__hurdles.children.forEach(hurdle=>{
			var p = hurdle.position.clone();
			_this.localToWorld(p);
			var d = p.distanceTo(person.getAthlete());
			if(d < 10){
				hurdle.rotation.x = -Math.PI/2;
				createjs.Sound.play("hurt");
				person.fail();
			}
		});
	};
	/**
	 *	检测水池
	 */
	_this.checkPools = function(person){
		__pools.children.forEach(pool=>{
			var p = person.getAthlete();
			var box = pool.geometry.boundingBox.clone();
			pool.localToWorld(box.min);
			pool.localToWorld(box.max);
			if(box.containsPoint(p)){
				createjs.Sound.play("drown");
				person.fail();
			}
		});
	};
	/**
	 *	创建路
	 */
	function createRoad (x, noPool, noHurdle) {
		var d = 0;
		var type = TYPE_TRACK;
		while(d < HEIGHT){
			var len = HEIGHT;
			if(!noPool) {
				len = type == TYPE_TRACK?Math.floor(Math.random() * (TRACK_MAX - TRACK_MIN) + TRACK_MIN):Math.floor(Math.random() * (POOL_MAX - POOL_MIN) + POOL_MIN);
			}
			if(d + len > HEIGHT){
				len = HEIGHT - d;
			}
			if(type == TYPE_TRACK){
				type = TYPE_POOL;
				var track = createTrack(len);
				track.position.set(x,0,-d);
				_this.add(track);
				if(!noHurdle) {
					var h = 0;
					while(h < len){
						var space = Math.floor(Math.random() * (HURDLE_MAX - HURDLE_MIN) + HURDLE_MIN);
						h += space;
                        if(_factor<1 && Math.random() > _factor) continue;
                        if(h > len) break;
						var hurdle = Parkour.Preload.getModel("hurdle");
						hurdle.position.set(x, DEPTH, -d-h);
						__hurdles.add(hurdle);
					}
				}
			}else if(type == TYPE_POOL){
				type = TYPE_TRACK;
				var pool = createPool(len);
				pool.geometry.computeBoundingBox();
				pool.position.set(x,0,-d);
				__pools.add(pool);
			}
			d += len;
		}
	}
	/**
	 *	创建线
	 */
	function createLine () {
		var g = new THREE.BoxGeometry(LINE_WIDTH, DEPTH, HEIGHT);
		g.translate(0,DEPTH/2,-HEIGHT/2);
		var m = new THREE.MeshBasicMaterial( { color:0xffffff } );
		var mesh = new THREE.Mesh(g, m);
		return mesh;
	}
	/**
	 *	创建跑道
	 */
	function createTrack (length) {
		var g = new THREE.BoxGeometry(TRACK_WIDTH, DEPTH, length);
		g.translate(0,DEPTH/2,-length/2);
		var m = [
			new THREE.MeshBasicMaterial( { color:0xd2d2d2 } ),
			new THREE.MeshBasicMaterial( { color:0xd2d2d2 } ),
			new THREE.MeshLambertMaterial( { color:0xf28100 } ),
			new THREE.MeshBasicMaterial( { color:0xd2d2d2 } ),
			new THREE.MeshBasicMaterial( { color:0xd2d2d2 } ),
			new THREE.MeshBasicMaterial( { color:0xd2d2d2 } )
		];
		var mesh = new THREE.Mesh(g, m);
		mesh.receiveShadow = true;
		return mesh;
	}
	/**
	 *	创建水池
	 */
	function createPool (length) {
		var g = new THREE.BoxGeometry(TRACK_WIDTH, DEPTH, length);
		g.translate(0,DEPTH/2+0.2,-length/2);
		var t = new THREE.Texture(Parkour.Preload.getResult("pool"));
		t.wrapS = THREE.RepeatWrapping;
		t.wrapT = THREE.RepeatWrapping;
		t.repeat.set( TRACK_WIDTH/PLAT_WIDTH, length/PLAT_HEIGHT );
		t.needsUpdate = true;
		var m = [
			null,
			null,
			null,
			new THREE.MeshPhongMaterial( { side:THREE.BackSide, color:0xffffff, map:t } ),
			null,
			null
		];
		var mesh = new THREE.Mesh(g, m);
		return mesh;
	}
	/**
	 *	创建金币
	 */
	function createGold () {
		for(var i=0;i<10;i++){
			//创建金币
			var seed = Math.random();
			var x = 0;
			if(seed > 0.6) x = GOLD_X;
			else if(seed < 0.3) x = -GOLD_X;
			var len = Math.floor(Math.random() * 5)
			for(var j = 0;j < len;j++){
				var gold = Parkour.Preload.getModel("gold");
				gold.position.set(x,GOLD_Y,-GOLD_Z*i - j*30);
				__golds.add(gold);
			}
		}
	}
	/**
	 *	创建树
	 */
	function createTree () {
		for(var i =0; i< HEIGHT; i+=100){
			var x = sinfun(i);
			var id = i%3==0?"tree0":"tree1";
			var scale = (i%5 + 5)/5;
			var left = Parkour.Preload.getModel(id);
			left.position.set(-TREE_X + x, 0, -i);
			left.scale.set(scale, scale, scale);
			var right = Parkour.Preload.getModel(id);
			right.position.set(TREE_X + x, 0, -i);
			right.scale.set(scale, scale, scale);
			_this.add(left, right);
		}
		/*
		var d = 0;
		while(d < HEIGHT){
			//if(Math.random() < 0.5) continue;
			var len = Math.floor(Math.random() * (TREE_MAX - TREE_MIN) + TREE_MIN);
			d += len;
			if(d > HEIGHT) break;
			var id = d%3==0?"tree0":"tree1";
			var tree = Parkour.Preload.getModel(id);
			tree.position.set(TREE_X, 0, -d);
			_this.add(tree);
		}
		*/
	}
	function sinfun (x) {
		var y = Math.sin(x) * 50;
		return y;
	}
	_this.init();
};
Parkour.Track.prototype = Object.create( THREE.Object3D.prototype );
Parkour.Track.prototype.constructor = Parkour.Track;
/**
 *	栅栏
 */
Parkour.Barrier = function(){
	var _this = this;
	var BEAM_WIDTH = 1,
		BEAM_HEIGHT = 2000,
		BEAM_DEPTH = 3,
		BEAM_Y1 = 9.5,
		BEAM_Y2 = 16,
		STICK_WIDTH = 2,
		STICK_HEIGHT = 20,
		STICK_DEPTH = 5,
		STICK_SPACE = 20;
	_this.init = function(){
		THREE.Object3D.call(_this);
		var left1 = getBeam();
		left1.position.y = 9.5;
		var left2 = getBeam();
		left2.position.y = 16;
		_this.add(left1, left2);
		for(var i = 0; i< 100; i++){
			var stick = getStick();
			stick.position.set(0, STICK_HEIGHT/2, STICK_SPACE * i);
			_this.add(stick);
		}
	};
	function getBeam () {
		var g = new THREE.BoxGeometry(BEAM_WIDTH,BEAM_HEIGHT,BEAM_DEPTH);
		g.rotateX(-Math.PI/2);
		var m = new THREE.MeshPhongMaterial( { color: 0xf8aa79 } );
		var mesh = new THREE.Mesh(g, m);
		return mesh;
	}
	function getStick(){
		var g = new THREE.BoxGeometry(STICK_WIDTH, STICK_HEIGHT, STICK_DEPTH);
		var m = new THREE.MeshPhongMaterial( { color: 0xf8aa79 } );
		var mesh = new THREE.Mesh(g, m);
		return mesh;
	}
	_this.init();
};
Parkour.Barrier.prototype = Object.create( THREE.Object3D.prototype );
Parkour.Barrier.prototype.constructor = Parkour.Barrier;
/**
 *	人
 */
Parkour.Person = function(){
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
		__athlete = Parkour.Preload.getModel("athlete");
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
		var e = { type: Parkour.Event.PERSON_FAIL};
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
		var x = __athlete.position.x>0?0:-TURN_UNIT;
		_turn.to( {x:x}, 500 )
			.start();
	};
	/**
	 *	向右
	 */
	_this.right = function(){
		if(_isJumping || _isTurning) return;
		_isTurning = true;
		var x = __athlete.position.x<0?0:TURN_UNIT;
		_turn.to( {x:x}, 500 )
			.start();
	};
	_this.init();
};
Parkour.Person.prototype = Object.create( THREE.Object3D.prototype );
Parkour.Person.prototype.constructor = Parkour.Person;
/**
 *	准备动作
 */
Parkour.Prep = function(){
	var _this = this;
	var __entity = null,
		__bottle = null,
		__symbol = null;
	var _mixer = null,
		_action = null;
	_this.init = function(){
		THREE.Object3D.call(_this);
		var __entity = Parkour.Preload.getModel("prep");
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
Parkour.Prep.prototype = Object.create( THREE.Object3D.prototype );
Parkour.Prep.prototype.constructor = Parkour.Prep;
/**
 *	送水人
 */
Parkour.Service = function(){
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
		var __entity = Parkour.Preload.getModel("service");
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
Parkour.Service.prototype = Object.create( THREE.Object3D.prototype );
Parkour.Service.prototype.constructor = Parkour.Service;
/**
 *	 模型
 */
Parkour.FbxModel = function(url){
	var _this = this;
	var __object = null;
	_this.init = function(url){
		var manager = new THREE.LoadingManager();
		manager.onProgress = function( item, loaded, total ) {
			//console.log( item, loaded, total );
		};
		var loader = new THREE.FBXLoader( manager );
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
		var e = { type: Parkour.Event.MODEL_LOADED };
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
Parkour.FbxModel.prototype = Object.create( THREE.EventDispatcher.prototype );
Parkour.FbxModel.prototype.constructor = Parkour.FbxModel;


/**
 *	声音
 */
Parkour.Sounds = function() {
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
Parkour.Sounds.prototype = Object.create( THREE.EventDispatcher.prototype );
Parkour.Sounds.prototype.constructor = Parkour.Sounds;
