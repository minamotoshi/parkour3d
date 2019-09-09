import * as LoadingBar from './components/loading/main';
import * as Preload from './components/game/preload';
import * as Parkour from './components/game/main';
import Panel from './components/panel';

window.Preload = Preload;
Preload.load(onProgress, onComplete);

let __loadingBar = new LoadingBar.main();
let __panel = new Panel.main();
let __game = new Parkour.main();
let _canStart = false;
document.body.appendChild(__loadingBar.getEntity());
document.body.appendChild(__panel.getEntity());
function onProgress(e){
	__loadingBar.setPercent(e.loaded);
}

function onComplete(e){
	__loadingBar.getEntity().style.display = 'none';
	document.body.appendChild(__game.getEntity());
	__game.addEventListener(Parkour.EVENT.RUNNING, onGameRunning);
	__game.addEventListener(Parkour.EVENT.GAME_OVER, onGameOver);
	__game.launch();
	_canStart = true;
	__panel.getEntity().addEventListener('click', onGameStartClick);
	__panel.show();
	__panel.showPlay();
}

function onGameStartClick(e) {
	if(_canStart){
		__panel.hide();
		__game.start();
	}
}
/**
 * 游戏运行中
 * @param {event} e 
 */
function onGameRunning(e) {
	_canStart = false;
}
/**
 * 游戏结束
 * @param {event} e 
 */
function onGameOver(e) {
	_canStart = true;
	__panel.show();
	__panel.showAgain();
}