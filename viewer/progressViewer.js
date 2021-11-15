/* global $ */

/**
 * プログレスバー用の処理を行うクラス
 */
export default class ProgressViewer {
    /**
     * コンストラタ
     * @param width {number} 幅
     * @param height {number} 高さ
     */
    constructor(width, height) {
        this.CONFIG = {
            bgColor: "#111111",
            textColor: "#DDDDDD",
            barColor: "#007AB7",
            status: {
                avatar: false,
                camera: false
            },
            size: {
                width,
                height,
                font: 17,
                bar: 10,
                margin: 30
            },
            logoPath: '../logo-small-dark.png'
        };
        this.callbacks = [() => this.loadingCanvas.remove()];
        this.cameraTextY = height - this.CONFIG.size.margin - 60;
        this.avaterTextY = height - this.CONFIG.size.margin - 90;
        this.tipsTextY = height - this.CONFIG.size.margin - 30;

        const $canvas = $('<canvas>').addClass('loading');
        this.loadingCanvas = $canvas.get(0);
        this.loadingCanvas.width = width;
        this.loadingCanvas.height = height;
        const ctx = this.loadingCanvas.getContext("2d");
        // 背景
        ctx.fillStyle = this.CONFIG.bgColor;
        ctx.fillRect(0, 0, width, height);

        // ロゴ
        this.drawLogo_();
        $(this.loadingCanvas).on('drawLogoComplete', () => {
            // テキスト
            this.setLoadingText_("カメラを初期化しています...", this.cameraTextY);
            this.setLoadingText_("アバターを初期化しています...", this.avaterTextY);
            this.setTipsText_([
                "Tips：モーションがうまく反映されない時は、",
                "カメラの角度/自分の姿勢/距離を調整してみてください"
            ]);
            this.setCameraLoadingPercent(0);
            this.setAvatarLoadingPercent(0);
        });
        $canvas.prependTo('body');// プログレス表示は上面に表示するためにprepend
    }
    /**
     * カメラのローディング状態の設定
     * @param percent {number} ローディング済みのパーセント。0～100を設定する。100で完了扱い。
     */
    setCameraLoadingPercent(percent) {
        this.setLoadingCommon_(percent, this.cameraTextY + 3);
        if (percent >= 100) {
            this.CONFIG.status.avatar = true;
            this.setLoadingText_("カメラを初期化しています...完了", this.cameraTextY);
            if (this.isCompleted()) {
                this.onLoaded();
            }
        }
    }
    /**
     * アバター画像のローディング状態の設定
     * @param percent {number} ローディング済みのパーセント。0～100を設定する。100で完了扱い。
     */
    setAvatarLoadingPercent(percent) {
        this.setLoadingCommon_(percent, this.avaterTextY + 3);
        if (percent >= 100) {
            this.CONFIG.status.camera = true;
            this.setLoadingText_("アバターを初期化しています...完了", this.avaterTextY);
            if (this.isCompleted()) {
                this.onLoaded();
            }
        }
    }
    /**
     * 完了状態かどうかの判定処理
     */
    isCompleted() {
        return this.CONFIG.status.avatar && this.CONFIG.status.camera;
    }
    /**
     * ローディングの完了後に実行するイベントを追加する。
     * @param callback {Function}  完了後に実行するコールバック
     */
    addOnLoaded(callback) {
        this.callbacks.push(callback);
    }
    /////////////////////////////////////////////////////
    // Private
    /////////////////////////////////////////////////////
    /**
     * ローディング状態のバーを画面に設定する。
     * @param percent {number} ローディング済みのパーセント。0～100を設定する。100で完了扱い。
     * @param yPosition {number} Y軸の位置
     */
    setLoadingCommon_(percent, yPosition) {
        const maxBarHeight = 2;
        const maxBarWidth = this.CONFIG.size.width - 60;
        const ctx = this.loadingCanvas.getContext("2d");
        ctx.clearRect(30, yPosition, maxBarWidth, maxBarHeight);
        ctx.fillStyle = this.CONFIG.textColor;
        ctx.fillRect(30, yPosition, maxBarWidth, maxBarHeight);
        ctx.fillStyle = this.CONFIG.barColor;
        ctx.fillRect(30, yPosition, maxBarWidth * percent / 100, maxBarHeight);
    }
    /**
     * ローディング用のロゴを表示する。
     * @param onImageLoad {Function} イメージ画像の読み込み終了時コールバック
     */
    drawLogo_() {
        const image = new Image();
        const canvas = this.loadingCanvas;
        const width = this.CONFIG.size.width;
        const height = this.CONFIG.size.height - 120;// ローディング領域を除外
        image.addEventListener("load", function () {
            const ctx = canvas.getContext("2d");
            const w = image.naturalWidth;
            const h = image.naturalHeight;
            ctx.drawImage(image, (width - w) / 2, (height - h) / 2);
            $(canvas).trigger('drawLogoComplete');
        });
        image.src = this.CONFIG.logoPath;
    }
    /**
     * ローディング用のテキストを表示する
     * @param text {String} ローディング用のテキスト
     * @param yPosition {number} Y軸の位置
     */
    setLoadingText_(text, yPosition) {
        const ctx = this.loadingCanvas.getContext("2d");
        ctx.fillStyle = this.CONFIG.bgColor;
        ctx.fillRect(30, yPosition - 30, this.CONFIG.size.width, 30);
        ctx.font = `bold ${this.CONFIG.size.font}px メイリオ`;
        ctx.fillStyle = this.CONFIG.textColor;
        ctx.fillText(text, 30, yPosition);
    }
    /**
     * Tips用のテキストを表示する
     * @param texts {String[]} Tips用のテキストの配列
     */
    setTipsText_(texts) {
        const ctx = this.loadingCanvas.getContext("2d");
        const fontSize = this.CONFIG.size.font / 1.5;
        ctx.font = `bold ${fontSize}px メイリオ`;
        ctx.fillStyle = this.CONFIG.bgColor;
        ctx.fillRect(30, this.tipsTextY - 30, this.CONFIG.size.width, 30);
        ctx.fillStyle = this.CONFIG.textColor;
        texts.forEach((text, i) => {
            ctx.fillText(text, 30, this.tipsTextY + (i * fontSize) + 1);
        })
    }
    /**
     * ローディングの完了後処理を順次実行する
     */
    onLoaded() {
        $(this.loadingCanvas).addClass('fadeOut');
        setTimeout(() => this.callbacks.reverse().forEach((callback) => { callback.call(this); }), 1500);
    }
}