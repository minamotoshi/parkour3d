import * as LoadingBar from './components/loading/main';
import * as Preload from './components/game/preload';
import * as Parkour from './components/game/main';

window.Preload = Preload;
Preload.load(onProgress, onComplete);

let __loadingBar = new LoadingBar.main();
let __game = new Parkour.main();
document.body.appendChild(__loadingBar.getEntity());
function onProgress(e){
	__loadingBar.setPercent(e.loaded);
}

function onComplete(e){
	__loadingBar.getEntity().style.display = 'none';
	document.body.appendChild(__game.getEntity());
	__game.launch();
}

