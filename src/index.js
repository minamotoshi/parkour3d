import * as LoadingBar from './components/loading/main';

let loadingBar = new LoadingBar.main();
loadingBar.setPercent(0.5);

document.body.appendChild(loadingBar.getEntity());