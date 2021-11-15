/* global pdfjsLib $ */
pdfjsLib.workerSrc = '/viewer/presentation/pdf.worker.js';

export default class presentationViewer {
    constructor() {
        // 固定値
        this.CONTROLPANEL_WIDTH = 400;
        this.CONTROLPANEL_HEIGHT = 100;

        // こっから↓はinit時にのみ初期化
        this.standAloneMode = true;

        this.rootElement = null;
        this.canvasElement = null;
        this.controlPanelElement = null;

        // ロード処理関係の各種オブジェクト
        this.loading = false;

        this.loadProgressCallback = null;
        this.startLoadingCallback = null;
        this.finishedLoadingCallback = null;

        // こっから↓はプレゼンをロードする度に初期化が必要
        this.allPageNum = 0;
        this.allPageCanvas = null;

        this.currentPageNum = 1;
        this.currentCanvas = null;
    }

    /**
     * 初期化処理
     *
     * @param {*} rootElement
     * @param {*} width
     * @param {*} height
     * @param {*} standAloneMode ：単独モードで動かすかどうか。単独モードの場合は進むとか戻るボタンを付けない
     * @param {*} loadProgressCallback
     * @param {*} startLoadingCallback
     * @param {*} finishedLoadingCallback
     */
    init(rootElement, width, height, standAloneMode, loadProgressCallback, startLoadingCallback, finishedLoadingCallback) {
        this.standAloneMode = (standAloneMode === true);

        this.CONFIG = {
            bgColor: '#000000',
            textColor: '#FFFFFF',
            size: {
                controlPanel: {
                    width: this.standAloneMode ? (this.CONTROLPANEL_WIDTH) : 0,
                    height,
                },
                canvas: {
                    width: this.standAloneMode ? (width - this.CONTROLPANEL_WIDTH) : width,
                    height,
                },
                width,
                height,
            }
        };

        this.loadProgressCallback = this.suppl_(loadProgressCallback, this.nop_);
        this.startLoadingCallback = this.suppl_(startLoadingCallback, this.nop_);
        this.finishedLoadingCallback = this.suppl_(finishedLoadingCallback, this.nop_);

        this.rootElement = rootElement
            .css('background-color', this.CONFIG.bgColor)
            .css('display', 'flex');

        this.canvasElement = this.createCanvasArea_();
        this.rootElement.append(this.canvasElement);

        this.controlPanelElement = this.createControlPanel_();
        this.rootElement.append(this.controlPanelElement);

        $(document).on({
            dragover: this.handleDragOver_.bind(this),
            drop: this.handleFileDrop_.bind(this),
        });
    }

    suppl_(value, defaultValue) {
        if (value === null || value === undefined || value === "") {
            return defaultValue;
        } else {
            return value;
        }
    }

    nop_() {
        //NOP
    }

    createControlPanel_() {
        let ctrlPanel = $('<div></div>', {
            id: 'pdfViewerControlPanel',
            'class': 'panel-ctrl',
            css: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                width: this.CONFIG.size.controlPanel.width + 'px',
                height: this.CONFIG.size.controlPanel.height + 'px',
            }
        });

        if (this.standAloneMode) {
            ctrlPanel.append(this.createButton_('btnPrev', 'fa fa-caret-left', this.showPreviousPage.bind(this)));
            ctrlPanel.append(this.createButton_('btnNext', 'fa fa-caret-right', this.showNextPage.bind(this)));
        }

        return ctrlPanel;
    }

    createButton_(id, iconClass, onclickCallback) {
        let btnContainer = $('<div></div>', {
            'class': 'btn-container',
            css: {
                display: 'flex',
                fontFamily: '"Yu Gothic", YuGothic, Verdana, "Hiragino Kaku Gothic ProN", "Hiragino Kaku Gothic Pro", "ヒラギノ角ゴ Pro W3", "メイリオ", Meiryo, sans-serif',
                textAlign: 'center',
                paddingTop: '10px',
                paddingBottom: '10px',
            }
        });

        let btn = $('<i/>', {
            'class': iconClass,
            'id': id,
            css: {
                margin: '0px auto',
                display: 'inline-block',
                width: '80px',
                height: '80px',
                lineHeight: '80px',
                color: '#fff',
                textAlign: 'center',
                fontSize: '6em'
            },
            on: {
                click: onclickCallback
            }
        });

        btnContainer.append(btn);

        return btnContainer;
    }

    createCanvasArea_() {
        return $('<div></div>', {
            'id': 'pdfViewerCanvasPanel',
            'class': 'panel',
            css: {
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: this.CONFIG.size.canvas.width + 'px',
                height: this.CONFIG.size.canvas.height + 'px',
                color: '#FFFFFF'
            },
            on: {
                // なんかdropイベントだけじゃなくて、こっちも無効化しておかないとデフォルトの動きをしちゃうので無効化しとく
                dragover: this.handleDragOver_.bind(this),
                drop: this.handleFileDrop_.bind(this),
            }
        }).text('ここにプレゼンテーションファイル(PDF形式)をドラッグ＆ドロップしてください。');
    }

    handleDragOver_(event) {
        // デフォルトのイベントを止めとく
        event.stopPropagation();
        event.preventDefault();

        return false;
    }

    async handleFileDrop_(event) {
        // デフォルトのイベントを止めとく
        event.stopPropagation();
        event.preventDefault();

        let file = event.originalEvent.dataTransfer.files[0];

        if (file.type !== 'application/pdf') {
            alert('PDF以外のファイルを読み込むことはできません');

        } else {
            this.canvasElement.text('');
            this.cleanUp_();
            this.loadPDF(await (this.readFileAsync_(file)));

        }
    }

    cleanUp_() {
        if (this.allPageCanvas !== null) {
            // フロント弱者マンワイ、こうすればきっとgcされると信じて、既に表示済みのDOM要素を削除する。
            this.allPageCanvas.each((i, canvas) => {
                $(canvas).remove();
            });
        }

        this.allPageNum = 0;
        this.allPageCanvas = null;

        this.currentPageNum = 1;
        this.currentCanvas = null;

    }

    async readFileAsync_(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * PDFを読み込む
     *
     * 入力：PDF
     * 出力：
     *     <div id='pdfViewerCanvasPanel'>の配下に、ページ毎に分割されたcanvas要素を出力する
     *     上記の全てのcanvas要素オブジェクトを、this.allPageCanvasに格納する
     *
     * PDF以外でも、出力だけ併せればパワポとかを直読みできるようにしたらかっこいいなーって思ったり
     *
     * @param {*} pdfData
     */
    async loadPDF(pdfData) {
        if (!this.loading) {
            this.loading = true;

            this.startLoadingCallback();
            this.loadProgressCallback(0);

            // この処理はPDFの基本的な情報を取得するだけ（描画はされない）
            let pdf = await pdfjsLib.getDocument({
                data: pdfData,
            }).promise;

            this.allPageNum = await pdf.numPages;

            // PDFのレンダリング処理はゲロ重なので、この時点ではまだレンダリングは実行せず、↓だけやっとく
            // ・各ページ毎のキャンバスを空の状態で生成（レンダリングのターゲットになる）
            // ・PDFの各ページの定義体の取得
            let pdfPages = [];
            for (let i = 1; i < this.allPageNum + 1; i++) {
                pdfPages.push(await pdf.getPage(i));
                this.canvasElement.append(this.createPageCanvas_());
            }

            this.allPageCanvas = $('.pdfPageCanvas');

            // ここが各ページをそれぞれのキャンバスにレンダリングする処理
            // ゲロ重なので主処理とは非同期にやる。
            // レンダリングの順番は1ページ目から順繰りに。
            this.renderPagesAsync_(pdfPages).then(() => {
                this.finishedLoadingCallback();
                this.loading = false;
            });

            this.showPage(1);
        } else {
            alert('直前にアップしたプレゼンのロードが終わるまで待ってね');
        }
    }

    createPageCanvas_() {
        let c = $('<canvas/>', {
            'class': 'pdfPageCanvas',
            css: {
                display: 'none',
                backgroundColor: this.CONFIG.bgColor,
                color: '#FFFFFF'
            }
        });

        const ctx = c.get(0).getContext("2d");
        ctx.font = `bold 12px メイリオ`;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('現在読み込み中です', 30, 30);

        return c;
    }

    async renderPagesAsync_(pdfPages) {
        for (let i = 0; i < this.allPageNum; i++) {
            let page = pdfPages[i];

            // ページ毎のレンダリングは非同期にやると大惨事になるのでawaitする＝1ページずつ順繰りにレンダリングする
            //
            // 理由1：ページのレンダリングの順番がぐちゃぐちゃになる
            //         （普通発表者は1ページ目から順番に表示するはずなので、その順番でレンダリングしときたい）
            // 理由2：なんか物凄いCPUの負荷が上がる（どうも並列に走りまくって重くなってるくさい。シングルスレッドじゃないのか…？）
            await this.renderPage_(this.allPageCanvas.eq(i), page);

            this.loadProgressCallback((i / this.allPageNum) * 100);
        }

        this.loadProgressCallback(100);
    }

    async renderPage_(canvas, page) {
        var viewport = page.getViewport({ scale: 1 });

        var scale = Math.min(this.CONFIG.size.canvas.width / viewport.width, this.CONFIG.size.canvas.height / viewport.height);
        var scaledViewport = page.getViewport({ scale: scale, });

        var context = canvas.get(0).getContext('2d');

        canvas.attr('width', page.view[2] * scale);
        canvas.attr('height', page.view[3] * scale);
        var renderContext = {
            canvasContext: context,
            background: 'rgba(0,0,0,0)',
            viewport: scaledViewport
        };

        await page.render(renderContext).promise;
    }

    /**
     * numで指定されたページを表示する
     *
     * @param {*} num
     */
    showPage(num) {
        // レンダリングが終わってなくても、キャンバス要素の生成だけ終わってれば表示しちゃってよいのでこの条件
        if (this.allPageCanvas !== null) {
            this.currentPageNum = this.justifyPageNumber_(num);

            if (this.currentCanvas !== null) {
                this.currentCanvas.css('display', 'none');
            }

            this.currentCanvas = this.allPageCanvas.eq(this.currentPageNum - 1);

            this.currentCanvas.css('display', 'inline');
        }
    }

    /**
     * 前のページを表示する
     */
    showPreviousPage() {
        this.showPage(this.currentPageNum - 1);
    }

    /**
     * 次のページを表示する
     */
    showNextPage() {
        this.showPage(this.currentPageNum + 1);
    }

    justifyPageNumber_(num) {
        if (num <= 0) {
            return this.allPageNum;
        } else if (num > this.allPageNum) {
            return 1;
        } else {
            return num;
        }
    }
}