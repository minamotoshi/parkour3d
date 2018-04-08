import Track from './track';
/**
 *	场地
 */
var Field = function(){
	var _this = this;
	var DISTANCE = 2000;
	var TRACK_X = 31,
		TRACK_Y = 4;
	var __entity = null;
	_this.init = function(){
		THREE.Object3D.call(_this);
		var early = new Track();
		early.actual();
		var last = new Track();
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
			var o = new Track();
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
Field.prototype = Object.create( THREE.Object3D.prototype );
Field.prototype.constructor = Field;

export default Field;