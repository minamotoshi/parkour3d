/**
 *	栅栏
 */
var Barrier = function(){
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
Barrier.prototype = Object.create( THREE.Object3D.prototype );
Barrier.prototype.constructor = Barrier;

export default Barrier;