/* global $ */
import Otobe from './otobe.js';
import MovieLoader from './movieLoader.js';

let configs = null;
const jsonString = localStorage.getItem('viewer_config');
try {
    configs = JSON.parse(jsonString);
} catch (e) {
    configs = {};
}

const otobe = new Otobe(configs);
if (configs.sourceType === 'movie' && !configs.useSample) {
    // 動画読み込みを挟むかどうか
    new MovieLoader(
        $(document.body),
        $('#myVideo'),
        window.innerWidth,
        window.innerHeight,
        () => {
            otobe.init();
        }
    );
} else {
    otobe.init();
}
