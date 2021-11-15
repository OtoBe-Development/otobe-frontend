/* global $ */

export default class MovieLoader {
    constructor(root, video, width, height, loadedHandler) {
        this.CONFIG = {
            bgColor: '#000000',
            textColor: '#FFFFFF'
        };

        this._width = width;
        this._height = height;

        this._rootElement = root;
        this._rootElement
            .css('background-color', this.CONFIG.bgColor)
            .css('display', 'flex');
        this._video = video;

        this._inputDiv = this._createInputDiv();
        this._rootElement.append(this._inputDiv);
        this._rootElement.get(0).ondrop = this._handleFileDrop.bind(this);
        this._rootElement.get(0).ondragover = this._handleDragOver.bind(this);

        this._loadedHandler = loadedHandler;
    }

    _createInputDiv() {
        const div = $('<div></div>', {
            id: 'pdfViewerCanvasPanel',
            class: 'panel',
            css: {
                display: 'flex',
                'text-align': 'center',
                'flex-direction': 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: this._width + 'px',
                height: this._height + 'px',
                color: '#FFFFFF'
            }
        });

        const img = $('<img></img>', {
            src: '../image/face.png',
            css: {
                alignItems: 'center',
                height: this._height / 3 + 'px'
            }
        });
        const p = $('<p></p>', {}).text(
            'ここに動画ファイル(mp4形式)をドラッグ＆ドロップしてください。\n顔アップかつ、一人のみ写ってる動画のみ対応しています。'
        );
        div.append(img);
        div.append(p);
        return div;
    }

    _handleDragOver(event) {
        // デフォルトのイベントを止めとく
        event.stopPropagation();
        event.preventDefault();

        return false;
    }

    async _handleFileDrop(event) {
        // デフォルトのイベントを止めとく
        event.stopPropagation();
        event.preventDefault();

        let file = event.dataTransfer.files[0];

        if (file.type !== 'video/mp4') {
            alert('mp4以外のファイルを読み込むことはできません');
        } else {
            this._inputDiv.text('');

            const objectURL = URL.createObjectURL(file);
            this._video.get(0).src = objectURL;

            this._video.on('canplaythrough', () => {
                this._loadedHandler();
                this._video.off('canplaythrough');
            });
        }
    }
}
