import ProgressViewer from './progressViewer.js';
import ControlPanel from './controlPanel.js';
import VideoController from './videoController.js';

import PresentationViewer from './presentation/presentationViewer.js';
import VrmController from './vrmcontroller/vrmController.js';

/* global THREE, JEELIZFACEEXPRESSIONS, $ */

// 概説
// init後の主処理で並列で走っているのは下記の二つ
// 1. 画面のフレーム描画処理：animate()
// 2. 顔認識の検出/モデルへの適用処理：handleJeelizTrack()メソッド
//
// 現状では、1と2の両方が非同期に動いてて、特にフレームレートをそろえる処理もしていない
// もし可能であれば、下記の二つをやるともう少し負荷が軽くなるかもしれない
// ・1と2のフレームレートをそろえる（完全同期はしなくてもいい。っていうか無理。無駄にやっちゃうのを避けるだけ）
// ・2で検出した結果を即時で3Dモデルへ適用するのではなく、一回検出結果をどこぞに保存しておき、1のタイミングでモデルに適用する

export default class Otobe {
    constructor(config) {
        // 各種設定系
        this.configs = config;
        this.width = this.configs.debug ? window.innerWidth / 2 : window.innerWidth;
        this.height = window.innerHeight;

        const renderingOptions = {
            low: {
                resolution: 0.5,
                framerate: 'half'
            },
            middle: {
                resolution: 1.0,
                framerate: 'half'
            },
            high: {
                resolution: 1.0,
                framerate: 'full'
            }
        };
        this.renderingOption = renderingOptions[this.configs.pcspec.select.value];

        if (this.configs.sourceType === 'camera') {
            this.configs.showSource = this.configs.showSourceCamera;
        } else if (this.configs.sourceType === 'movie') {
            this.configs.showSource = this.configs.showSourceMovie;
            this.configs.presentationMode = false;
        }

        // 各種DOMオブジェクト系
        this.dom = {};
        this.dom.root = null;
        this.dom.presentation = null;
        this.dom.avatar = null;
        this.dom.control = null;
        this.dom.message = null;

        // 補助オブジェクト系（コントロールパネル）
        this.controlPanel = null;

        // 顔検出系の一時退避領域
        this.face = {};
        this.face.expression = {
            smileR: 0,
            smileL: 0,
            eyeBrowLD: 0,
            eyeBrowRD: 0,
            eyeBrowLU: 0,
            eyeBrowRU: 0,
            mouthOpen: 0,
            mouthRound: 0,
            mouthNasty: 0,
            eyeRClose: 0,
            eyeLClose: 0
        };

        this.face.rotate = {
            x: 0,
            y: 0,
            z: 0
        };

        this.progressViewer = null;
        this.presentationViewer = null;

        // メインで使うオブジェクト系（レンダラとか）
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.clock = null;
        this.controller = null;
        this.vrmController = undefined;

        // 面白機能
        this.modelScale = {
            head: 1.0
        };
        // カメラの有無フラグ
        this.hasWebcam = false;
    }

    init() {
        this.initDom();
        this.initControlPanel();
        this.initProgressViewer();

        this.initPresentationViewer();
        this.initThreeJS();
        this.initVRM();
        this.initJeeliz();

        this.clock = new THREE.Clock();
        this.clock.start();
        this.animate();
    }

    /**
     * このコードで生成されるDOMは以下の通りである
     *
     * <body>
     *   <div id="otobe" style="display:flex">
     *     <div id="otobe-avatar" style="position:absolute;top:0;left:0"/>幅も高さもMAX
     *     <div id="otobe-presentation"/>
     *     <div id="otobe-main" style="display:flex;flex-direction:column">
     *       <div id="otobe-control" style="display:flex;justify-content:center"/>
     *     </div>
     *   </div>
     * </body>
     */
    initDom() {
        // TODO：後でjQueryとSimple.cssで差し替える

        let root = this._createNode('<div/>', 'otobe', this.width, this.height);
        root.css({
            display: 'flex',
            backgroundColor: '#000000'
        });
        this.dom.root = root;

        let main;
        if (this.configs.presentationMode) {
            this.dom.presentation = this._createNode(
                '<div/>',
                'otobe-presentation',
                this.width - 400,
                this.height
            );

            this.dom.avatar = this._createNode(
                '<div/>',
                'otobe-avatar',
                this.width,
                this.height - 100
            );
            this.dom.avatar.css({
                position: 'absolute',
                top: 0,
                left: 0
            });

            this.dom.control = this._createNode('<div/>', 'otobe-control', 400, 100);
            this.dom.control.css('display', 'flex');
            this.dom.control.css('justifyContent', 'center');

            main = this._createNode('<div/>', 'otobe-main', 400, this.height);
            main.css({
                display: 'flex',
                alignItems: 'flex-end'
                // flexDirection: 'column'
            });
        } else {
            this.dom.presentation = this._createNode(
                '<div/>',
                'otobe-presentation',
                0,
                0
            );
            this.dom.avatar = this._createNode(
                '<div/>',
                'otobe-avatar',
                this.width,
                this.height
            );
            this.dom.control = this._createNode('<div/>', 'otobe-control', 0, 0);

            main = this._createNode('<div/>', 'otobe-main', 0, 0);
            main.css({
                display: 'flex',
                alignItems: 'flex-end'
                // flexDirection: 'column'
            });
        }

        root.append(this.dom.avatar);
        root.append(this.dom.presentation);
        root.append(main);
        main.append(this.dom.control);

        document.body.appendChild(root.get(0));
    }

    _createNode(tag, id, width, height) {
        let elem = $(tag, {
            id: id
        });

        if (width !== undefined && height !== undefined) {
            elem.css({
                width: width + 'px',
                height: height + 'px'
            });
        }

        return elem;
    }

    _createButton(id, iconClassName, onclickCallback) {
        let div = $('<div/>', { class: 'btn-container' });

        let elem = $('<i/>', {
            class: iconClassName,
            id: id,
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

        div.append(elem);

        return div;
    }

    _showMessage(msg) {
        if (this.dom.message !== null) {
            this.dom.message.remove();
        }
        this.dom.message = $(`<div style="color:#fff">${msg}</div>`);
        this.dom.message.css({
            visibility: 'visible',
            position: 'absolute',
            top: '10px',
            left: '10px'
        });
        this.dom.root.append(this.dom.message);
    }

    _hideMessage() {
        if (this.dom.message === null) {
            return;
        }
        this.dom.message.css({
            visibility: 'hidden'
        });
    }

    initControlPanel() {
        this.controlPanel = new ControlPanel(this.dom.root, this.configs.debug);
        this.controlPanel.addInput(null, 'head', this.modelScale, {
            label: '頭サイズ',
            min: 0.5,
            max: 5.0
        });
        this.controlPanel.addFolder('デバッグ', true);
        this.controlPanel.addMonitorLamp('デバッグ', this.face.expression);
        this.controlPanel.addMonitorLamp('デバッグ', this.face.rotate);
    }

    initProgressViewer() {
        this.progressViewer = new ProgressViewer(
            this.configs.debug ? this.width * 2 : this.width,
            this.height
        );

        this.progressViewer.addOnLoaded(() => {
            // ローディング完了後にビデオの再生を開始
            if (this.configs.sourceType === 'movie') {
                VideoController.create($('#myVideo'), this.controlPanel).appendTo(
                    '.jeefacetransferCanvasWrapper'
                );
                $('#myVideo')
                    .get(0)
                    .play();
            }
            // ローディング完了後にカメラ同期用のCanvasを表示する
            if (this.configs.showSource) {
                $('#jeefacetransferCanvas').show();
            }
        });
    }

    initPresentationViewer() {
        if (this.configs.presentationMode) {
            this.presentationViewer = new PresentationViewer();
            let hook = this.dom.presentation;
            this.presentationViewer.init(
                hook,
                parseInt(hook.css('width')),
                parseInt(hook.css('height')),
                false,
                num => {
                    console.log(`PDF-Loading:${num}`);
                }
            );

            this.dom.control.append(
                $('<div style="color:#fff">Zキー：前のスライドに戻る<br>Xキー：次のスライドに進む<br>Pキー：手とマウスの連動をする/しない</div>')

            );

            document.addEventListener('keydown', (e) => {
                var keyName = e.key;
                if (keyName === 'z') {
                    this.presentationViewer.showPreviousPage.bind(this.presentationViewer)()
                } else if (keyName === 'x') {
                    this.presentationViewer.showNextPage.bind(this.presentationViewer)()
                }
            }, false);
        }
    }

    initThreeJS() {
        // Three.js本体の初期化
        try {
            this.renderer = new THREE.WebGLRenderer({
                antialias: false,
                alpha: true
            });
        } catch (err) {
            alert('お使いのブラウザもしくはお使いのPCではWebGLに対応していないため、起動できません。');
            throw err;
        }
        this.renderer.setPixelRatio(this.renderingOption.resolution);

        let threejsWidth = parseInt(this.dom.avatar.css('width'));
        let threejsHeight = parseInt(this.dom.avatar.css('height'));

        this.renderer.setSize(threejsWidth, threejsHeight);
        this.dom.avatar.append($(this.renderer.domElement));

        // カメラの初期化
        this.camera = new THREE.PerspectiveCamera(
            30.0,
            threejsWidth / threejsHeight,
            0.01,
            20.0
        );
        this.camera.position.set(0.0, 0.0, 5.0);

        // シーンの初期化
        this.scene = new THREE.Scene();

        // 背景の初期化
        if (!this.configs.presentationMode) {
            this.scene.background = new THREE.TextureLoader().load(
                this.configs.currentBackground.src
            );
        }

        // 光源の初期化
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1.0, 1.0, 1.0).normalize();
        this.scene.add(light);
    }

    initVRM() {
        const loader = new THREE.GLTFLoader();
        loader.load(
            `${this.configs.currentAvatar.model}`,
            gltf => {
                this.initVRMController(gltf);
            },
            progress => {
                const currentPer = ((100.0 * progress.loaded) / progress.total).toFixed(
                    2
                );
                this.progressViewer.setAvatarLoadingPercent(currentPer);
                console.info(currentPer + '% loaded');
            },
            error => {
                console.error(error);
            }
        );
    }

    initVRMController(gltf) {
        THREE.VRM.from(gltf).then(vrm => {
            this.scene.add(vrm.scene);
            this.vrmController = new VrmController(
                vrm,
                this.scene,
                this.camera,
                this.renderer
            );

            this.vrmController.selectTargetIKChain('RIGHT_HAND');

            // カメラの位置をモードに合わせて調整
            // プレゼンモードの時は右端にアバターを寄せたい
            const head = vrm.humanoid.getBoneNode(
                THREE.VRMSchema.HumanoidBoneName.Head
            );
            this.camera.position.set(
                0.0,
                head.getWorldPosition(new THREE.Vector3()).y,
                2.0
            );

            if (this.configs.presentationMode) {
                this.arignModelToRightEnd(vrm);
                this.vrmController.toggleIK();
            }
        });
    }

    arignModelToRightEnd(vrm) {
        // 2次元座標上でモデルを配置したい位置
        let x = window.innerWidth - 200;
        let y = 0;

        // 取得したスクリーン座標を-1〜1に正規化する（WebGLは-1〜1で座標が表現される）
        x = (x / window.innerWidth) * 2 - 1;
        y = -(y / window.innerHeight) * 2 + 1;

        // マウスの位置ベクトル
        var pos = new THREE.Vector3(x * 100, y * 100, 0);

        // 上記の座標を、カメラの位置をベースに3次元座標に変換する
        pos.unproject(this.camera);

        // 取得したx座標をおけつのボーン（全てのボーンのルート）に適用する
        const hip = vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips);
        hip.position.x = pos.x;

        // 移動だけすると、モデルがカメラと関係ない方向向いちゃうので、カメラを向いてもらう
        var tmpV = new THREE.Vector3();
        tmpV.copy(this.camera.position);
        tmpV.sub(hip.position); //1.向かうベクトルの用意
        tmpV.normalize(); //2.単位ベクトル化

        var angle = Math.atan2(-tmpV.x, -tmpV.z); //3.魔法の呪文
        hip.rotation.y = angle; //4.向きに適用
    }

    // 【重要】フレームごとの描画処理
    isSkip = false;
    animate() {
        // 次フレームの時もanimateを呼んでもらうようにお願いする。
        requestAnimationFrame(this.animate.bind(this));

        // フレームレートがhalfの時は半分のフレームをスキップする
        if (this.renderingOption.framerate === 'half') {
            this.isSkip = !this.isSkip;

            if (this.isSkip) {
                return;
            }
        }

        const delta = this.clock.getDelta();
        if (this.vrmController) {
            // 今回の描画間隔時間分、次回の顔認識処理を遅らせる
            let delay = Math.floor(delta * 1000);
            if (this.hasWebcam) {
                JEELIZFACEEXPRESSIONS.set_animateDelay(delay);
            }

            // 最新の情報で3Dモデルを更新する
            this.vrmController.update(delta, this.modelScale.head, this.face);
        }

        // レンダリングを実行する
        this.renderer.render(this.scene, this.camera);

        // コントロールパネルに情報を描画する
        this.controlPanel.draw();
    }

    // -- 顔認識/認識結果を3Dモデルに反映する系の処理 ----------------------------------

    // 顔認識ライブラリ(Jeeliz)の初期化
    cameraCounter = 0;
    initJeeliz() {
        let videoElement = null;
        if (this.configs.sourceType === 'movie') {
            videoElement = document.getElementById('myVideo');
        }

        JEELIZFACEEXPRESSIONS.init({
            canvasId: 'jeefacetransferCanvas',
            NNCPath: '../',
            videoSettings: { videoElement },
            // [重要] 顔認識ライブラリの準備が整った後のコールバック先を指定する。
            callbackReady: this.handleJeelizReady.bind(this),
            
        });


        // カメラのロードを疑似的にパーセント表記するための処理
        this.cameraInterval = setInterval(() => {
            if (this.cameraCounter === 10) {
                clearInterval(this.cameraInterval);
                return;
            }
            this.progressViewer.setCameraLoadingPercent(this.cameraCounter * 10);
            this.cameraCounter++;
        }, 10);
    }

    // 顔認識ライブラリの初期化が完了した後の処理
    // eslint-disable-next-line no-unused-vars
    handleJeelizReady(error, spec) {
        // jeelizの初期化処理が終わった際の処理
        if (error) {
            // カメラがない場合などにエラーになる
            this.hasWebcam = false;
            console.error(error);
            this.progressViewer.setCameraLoadingPercent(100);
            return;
        }
        // エラーがなければカメラのロード成功扱い
        this.hasWebcam = true;

        // [重要] 顔認識ライブラリが顔を検出した時のコールバック先を指定する。↓が顔認識周りの主処理
        JEELIZFACEEXPRESSIONS.set_morphUpdateCallback(
            this.handleJeelizTrack.bind(this)
        );

        JEELIZFACEEXPRESSIONS.on_detect((detect) => {
            if (detect) {
                this._hideMessage();
            } else {
                this._showMessage('<i class="fa fa-sync-alt fa-spin"></i>&nbsp;顔を検出中です。数秒しても検出できない場合、<br>カメラ/自分の姿勢を調整してください。');
            }
        });

        // カメラのローディング完了
        this.progressViewer.setCameraLoadingPercent(100);
    }

    // 【重要】顔認識ライブラリが顔を検出した時の処理（何回も呼ばれる）
    // 基本的にはここで検出した値で3Dモデルの首の角度とか表情を変更する。
    // 3Dモデルを実際に描画するのは、animate()メソッドの中でやる
    // 本当は顔の検出と3Dモデルの更新は、同期をとってやった方が効率よさそうだが、その辺はまだ要調査
    // eslint-disable-next-line no-unused-vars
    handleJeelizTrack(quality, benchmarkCoeff) {
        if (this.vrmController) {
            // 検出結果の取得
            let expression = JEELIZFACEEXPRESSIONS.get_morphTargetInfluencesStabilized();
            let rotation = this.thresholdFilter(
                JEELIZFACEEXPRESSIONS.get_rotationStabilized(),
                this.prevRotation
            );

            this.saveJeelizParams(expression, rotation);
        }
    }
    // 前回の値と、今回取得した値で、その差分が閾値を超えない限りは変動なしとするフィルター
    // ※Jeelizで検出した値をそのまま使ってるとなんか凄いプルプルしちゃうので導入。
    prevRotation = [0, 0, 0];
    thresholdFilter(cur, prev) {
        const th = 0.005;
        cur.forEach((ele, i) => {
            if (Math.abs(ele - prev[i]) > th) {
                prev[i] = ele;
            }
        });

        return prev;
    }

    // Jeeliz系の値を一時格納領域に保存しておく（モデルの更新時に使う）
    saveJeelizParams(expression, rotation) {
        this.face.expression.smileR = expression[0];
        this.face.expression.smileL = expression[1];
        this.face.expression.eyeBrowLD = expression[2];
        this.face.expression.eyeBrowRD = expression[3];
        this.face.expression.eyeBrowLU = expression[4];
        this.face.expression.eyeBrowRU = expression[5];
        this.face.expression.mouthOpen = expression[6];
        this.face.expression.mouthRound = expression[7];
        this.face.expression.mouthNasty = expression[10];
        this.face.expression.eyeRClose = expression[8];
        this.face.expression.eyeLClose = expression[9];

        this.face.rotate.x = rotation[0];
        this.face.rotate.y = rotation[1];
        this.face.rotate.z = rotation[2];
    }
}
