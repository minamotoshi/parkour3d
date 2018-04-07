import './main.css';
import imgBG from './bg.jpg';
import imgGif from './gif.gif';
import imgHead from './head.png';

const VER = 1.0;
const EVENT = {
	INIT: 'init'
}

var main = function(){
	var _this = this;
	var __loadingText = null;//百分比
	var __entity = null;//主体
	_this.init = function(){
		__entity = document.createElement("div");//基本component
		__entity.classList.add("loading");
		let bg = new Image();//背景
		bg.src = imgBG;
		__entity.appendChild(bg);
		__entity.appendChild(getGif());
		__loadingText = getText();
		__entity.appendChild(__loadingText);
		__entity.appendChild(getHead());	
	};
	/**
	 * 获取实体
	 */
	_this.getEntity = function(){
		return __entity;
	};
	/**
	 * 获取gif动画
	 */
	function getGif(){
		let div = document.createElement('div');
		div.className = "loading_gif";
		let gif = new Image();
		gif.src = imgGif;
		div.appendChild(gif);
		return div;
	}
	/**
	 * 获取百分比文字
	 */
	function getText(){
		let div = document.createElement('div');
		div.className = "loading_text";
		return div;
	}
	/**
	 * 获取头像
	 */
	function getHead(){
		let div = document.createElement('div');
		div.className = "loading_head";
		let img = new Image();
		img.src = imgHead;
		div.appendChild(img);
		return div;
	}
	/**
	 * 设置百分比
	 * @param	float 小数[0,1]
	 */
	_this.setPercent = function(num){
		let per = Math.floor(num * 10000) /100;
		__loadingText.innerHTML = `${per}%`;
	}
	_this.init();
};


export {main, VER, EVENT}