import './index.css';
import imgPlay from './play.png';
import imgAgain from './again.png';

const main = function(){
	let _this = this;
	let __entity = null;//主体
	_this.init = function(){
		__entity = document.createElement("div");//基本component
		__entity.classList.add("panel", "hide");
		let play = new Image();
		play.src = imgPlay;
		let again = new Image();
		again.src = imgAgain;
		__entity.appendChild(play);
		__entity.appendChild(again);
	};
	/**
	 * 获取实体
	 */
	_this.getEntity = function(){
		return __entity;
	};
	/**
	 * 显示
	 */
	_this.show = function() {
		__entity.classList.add("show");
		__entity.classList.remove("hide");
	};
	/**
	 * 隐藏
	 */
	_this.hide = function() {
		__entity.classList.add("hide");
		__entity.classList.remove("show");
	};
	/**
	 * 显示播放
	 */
	_this.showPlay = function() {
		__entity.classList.add("play");
		__entity.classList.remove("again");
	}
	/**
	 * 显示再来一次
	 */
	_this.showAgain = function() {
		__entity.classList.remove("play");
		__entity.classList.add("again");
	}
	_this.init();
};

const Panel = {main};
export default Panel;
