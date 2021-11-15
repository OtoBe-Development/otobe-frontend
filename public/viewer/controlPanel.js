/* global $ Tweakpane */

/**
 * デバッグ系の諸々を表示するクラス。
 *
 * 内部的にTweakpaneを使っている
 *
 * メモ
 * Tweakpaneは表示したい値と、実際の表示領域の値のバインドをするために、
 * 引数で渡したオブジェクトに対して、変更を検知するなんがしかのしかけを後からいれてるっぽい。
 *
 * なので、addInputとかに単純な値だけ渡してもトレースしてくれない。
 * かならず、「値の親オブジェクト」と、親オブジェクトから値を引き当てるキーをセットで渡してやる必要がある。
 *
 * 例えば、xっていう整数を渡したい場合、
 * parent = {x: 実際の値};
 * ってしたうえで、addInputには
 * addInput(parent, 'x');
 * ってしてあげる必要がある
 *
 * また、親となるオブジェクトはaddInputとかした後も生き続けるやーつである必要がある。
 */
export default class ControlPanel {
    constructor(root, isDebug) {
        this.pane = new Tweakpane({ title: '面白機能' });

        this.paneNode = $(this.pane.element).parent();
        this.paneNode.css('top', 20 + this.paneNode.position().top);
        this.paneNode.css('--tp-base-background-color', 'hsla(0, 0%, 0%, 0.8)');

        root.append(
            this._createButton(
                'control-panel-toggle', 'fa fa-wrench',
                this.paneNode.position().top - 20, root.width() - 30,
                this._toggleDisplay.bind(this))
        );

        this.debugItems = {};
        this.isDebug = isDebug;


        this.folders = {};
        this.buttons = {};

        this.isVisible = true;
        this._toggleDisplay();

    }

    addFolder(title, expanded) {
        expanded = (expanded === true);

        let folder = this.pane.addFolder({ expanded, title });

        this.folders[title] = folder;
    }

    addButton(title, onClick) {
        let btn = this.pane.addButton({
            title: title,
        }).on('click', (value) => {
            onClick(value);
        });

        this.buttons[title] = btn;
    }

    addInput(folderTitle, objName, objParent, args) {
        this._getTargetPane(folderTitle).addInput(objParent, objName, args);
    }

    addInputLamp(folderTitle, objParent, args) {
        let tgt = this._getTargetPane(folderTitle)

        for (let key in objParent) {
            tgt.addInput(objParent, key, args);
        }
    }

    addMonitor(folderTitle, objName, objParent, args) {
        this._getTargetPane(folderTitle).addMonitor(objParent, objName, args);
    }

    addMonitorLamp(folderTitle, objParent, args) {
        let tgt = this._getTargetPane(folderTitle)

        for (let key in objParent) {
            tgt.addMonitor(objParent, key, args);
        }
    }

    _getTargetPane(folderTitle) {
        let tgt = null;

        if (folderTitle === null) {
            tgt = this.pane;
        } else {
            tgt = this.folders[folderTitle];
        }

        return tgt;
    }

    _toggleDisplay() {
        this.isVisible = this.isVisible ^ true;
        this.paneNode.css('visibility', this.isVisible ? 'visible' : 'hidden');
    }

    _createButton(id, iconClassName, top, left, onclickCallback) {
        let div = $("<div/>", {});

        let elem = $("<i/>", {
            'class': iconClassName,
            'id': id,
            css: {
                margin: '0px auto',
                display: 'inline-block',
                lineHeight: '10px',
                color: '#fff',
                textAlign: 'center',
                fontSize: '10px',
                position: 'absolute',
                top: top,
                left: left,
                width: '10px',
                height: '10px',
            },
            on: {
                click: onclickCallback
            }

        });

        div.append(elem);

        return div;
    }

    draw() {
        this.pane.refresh();
    }
}