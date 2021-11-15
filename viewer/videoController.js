/* global $ */

/**
 * 動画を表示するなら早送りとかもしたいよね、という気持ちを実現するクラス
 */
export default class VideoController {
    /**
     * コンストラクタ
     * 引数に設定したmovieタグを操作するためのコントロールを画面に埋め込む
     * appendToに設定した要素の子要素として追加する
     * @param target {JQuery} 操作対象とするmoiveタグ
     */
    constructor($target) {
        this.$target = $target;
        this.target = $target.get(0);
    }
    /**
     * 初期化用の関数。指定した動画をコントロールするためのコントロールを
     * 指定した要素の子要素として追加する
     * @param target {JQuery} 操作対象とするmoiveタグ
     * @returns {JQuery} コントローラ用の要素
     */
    static create(target) {
        return new VideoController(target).createBar_();
    }
    /**
     * 埋め込み対象のHTML要素
     * @returns {JQuery} コントローラ用の要素
     */
    createBar_() {
        const $bar = $('<div>').addClass(['movie-controller', 'movie-controller-hide']);
        $bar
            .on("mouseover", () => {
                $bar.removeClass("movie-controller-hide");
                $bar.addClass("movie-controller-show");
            })
            .on("mouseout", () => {
                $bar.removeClass("movie-controller-show");
                $bar.addClass("movie-controller-hide");
            });
        const $pauseButton = this.createButton_("icon-pause", "停止/再生", () => {
            $pauseButton.addClass(this.target.paused ? "icon-pause" : "icon-play");
            $pauseButton.removeClass(this.target.paused ? "icon-play" : "icon-pause");
            this.target.paused ? this.target.play() : this.target.pause();
        });
        const $plus5sec = this.createButton_("icon-forward-5", "早送り(5秒)", () => this.target.currentTime += 5);
        const $minus5sec = this.createButton_("icon-replay-5", "巻き戻し(5秒)", () => this.target.currentTime -= 5);
        const $volumePlus = this.createButton_("icon-volume-up", "音声+", () => {
            this.target.muted = false;
            if (this.target.volume <= 0.75) { this.target.volume += 0.25; }
        });
        const $volumeMinus = this.createButton_("icon-volume-down", "音声-", () => {
            if (this.target.volume >= 0.25) { this.target.volume -= 0.25; }
        });
        const volumeClass = this.target.muted ? "icon-volume-off" : "icon-volume-mute";
        const $volumeMuteToggle = this.createButton_(volumeClass, "ミュート切り替え", () => {
            this.target.muted = !this.target.muted;
            $volumeMuteToggle.addClass(this.target.muted ? "icon-volume-mute" : "icon-volume-off");
            $volumeMuteToggle.removeClass(this.target.muted ? "icon-volume-off" : "icon-volume-mute");
        });
        const $speedToggle = this.createButton_('icon-speed', "速度切り替え", () => {
            const isSlowNow = !$speedToggle.is('.icon-speed');
            this.target.playbackRate = isSlowNow ? 1 : 0.5;
            $speedToggle.addClass(isSlowNow ? "icon-speed" : "icon-slow");
            $speedToggle.removeClass(isSlowNow ? "icon-slow" : "icon-speed");
        });
        $bar.append([$pauseButton, $minus5sec, $plus5sec, $speedToggle, $volumeMinus, $volumePlus, $volumeMuteToggle]);
        return $bar;
    }
    /**
     * button type=button要素を生成する
     * @param iconClass {string} アイコン用のクラス
     * @param text {string} ボタンの標題
     * @param onClick {Function} クリックイベント用のリスナー
     * @returns {JQuery} button要素
     */
    createButton_(iconClass, title, onClick) {
        return $('<button>', { title, type: 'button' }).addClass(['icon-button', iconClass]).on('click', onClick);
    }
}
