/**
 *	跑道
 */
var Track = function(){
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
		var obj = Preload.getModel("field");
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
						var hurdle = Preload.getModel("hurdle");
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
		var t = new THREE.Texture(Preload.getResult("pool"));
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
				var gold = Preload.getModel("gold");
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
			var left = Preload.getModel(id);
			left.position.set(-TREE_X + x, 0, -i);
			left.scale.set(scale, scale, scale);
			var right = Preload.getModel(id);
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
			var tree = Preload.getModel(id);
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
Track.prototype = Object.create( THREE.Object3D.prototype );
Track.prototype.constructor = Track;
export default Track;