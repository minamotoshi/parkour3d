import * as LoadingBar from './components/loading/main';
import * as Preload from './components/game/preload';
import * as Parkour from './components/game/main';

window.Preload = Preload;
Preload.load(onProgress, onComplete);

let __loadingBar = new LoadingBar.main();
document.body.appendChild(__loadingBar.getEntity());
function onProgress(e){
	__loadingBar.setPercent(e.loaded);
}
let __game = null;
function onComplete(e){
	__game = new Parkour.main();
	__loadingBar.getEntity().style.display = 'none';
	document.body.appendChild(__game.getEntity());
	__game.launch();
	__game.ready();
}

