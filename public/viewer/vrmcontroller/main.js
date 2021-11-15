/* global THREE */

import VrmController from './vrmController.js';

// 概説
// init後の主処理で並列で走っているのは下記の二つ
// 1. 画面のフレーム描画処理：animate()
// 2. 顔認識の検出/モデルへの適用処理：handleJeelizTrack()メソッド
//
// 現状では、1と2の両方が非同期に動いてて、特にフレームレートをそろえる処理もしていない
// もし可能であれば、下記の二つをやるともう少し負荷が軽くなるかもしれない
// ・1と2のフレームレートをそろえる（完全同期はしなくてもいい。っていうか無理。無駄にやっちゃうのを避けるだけ）
// ・2で検出した結果を即時で3Dモデルへ適用するのではなく、一回検出結果をどこぞに保存しておき、1のタイミングでモデルに適用する

export default class Main {

    constructor() {
        // 各種設定系
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // メインで使うオブジェクト系（レンダラとか）
        this.renderer = null;
        this.camera = null;
        this.scene = null;
        this.currentVRM = null;
        this.clock = null;
        this.vrmController = undefined;
    }

    init() {
        this.initThreeJS();
        this.initVRM();

        this.clock = new THREE.Clock();
        this.clock.start();
        this.animate();
    }

    createRenderer(allow_alpha) {
        // レンダラーを作成
        const renderer = new THREE.WebGLRenderer({
            alpha: allow_alpha,
            canvas: document.querySelector('#three'),
            antialias: false
        });
        if (allow_alpha) {
            renderer.setClearAlpha(0);
        }
        renderer.setPixelRatio(1);
        renderer.setSize(this.width, this.height);

        return renderer;
    }


    initThreeJS() {
        // Three.js本体の初期化
        this.renderer = this.createRenderer(false);
        this.renderer.setPixelRatio(0.1);
        document.getElementById('left').appendChild(this.renderer.domElement);

        // カメラの初期化
        this.camera = new THREE.PerspectiveCamera(30.0, this.width / this.height, 0.01, 20.0);
        this.camera.position.set(0.0, 0.0, 5.0);

        // this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 1, 10000);
        // this.camera = new THREE.PerspectiveCamera(30, this.width / this.height, 1, 10000.0);
        // this.camera.position.set(0, 400, -900);

        // カメラぐりぐりのやつ
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableKeys = false;
        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.RIGHT,
            RIGHT: THREE.MOUSE.MIDDLE
        }

        // シーンの初期化
        this.scene = new THREE.Scene();

        let size = 10;
        let divisions = 50;

        const gridHelper = new THREE.GridHelper(size, divisions, new THREE.Color(0, 0, 1), new THREE.Color(1, 1, 1));
        this.scene.add(gridHelper);

        // レンダラーのサイズを調整する
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);

        // カメラのアスペクト比を正す
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        // 背景の初期化
        // this.scene.background = new THREE.TextureLoader().load(this.configs.currentBackground.src);

        // 光源の初期化
        const light = new THREE.DirectionalLight(0xffffff);
        light.position.set(1.0, 1.0, 1.0).normalize();
        this.scene.add(light);
    }

    initVRM() {
        const loader = new THREE.GLTFLoader();
        loader.load(
            // `../../models/shino/shino.vrm`,
            `../../models/three-vrm-girl/three-vrm-girl.vrm`,
            // `../../models/alicia-solid/alicia-solid.vrm`,
            // `../../models/genba/genba.vrm`,
            gltf => {
                this.initVRMPose(gltf);
            },
            progress => {
                const currentPer = ((100.0 * progress.loaded) / progress.total).toFixed(2);
                // this.progressViewer.setAvatarLoadingPercent(currentPer);
                console.info(currentPer + '% loaded');
            },
            error => {
                console.error(error);
            }
        );
    }

    initVRMPose(gltf) {
        THREE.VRM.from(gltf).then(vrm => {
            this.scene.add(vrm.scene);
            this.currentVRM = vrm;
            this.vrmController = new VrmController(vrm, this.scene, this.camera, this.renderer);

            this.vrmController.selectTargetIKChain('RIGHT_HAND');

            // どんなサイズのVRMが来てもバストアップになるようにカメラ位置を調整する。
            // this.alignCenter(vrm);
            // this.alignRight(vrm) ;
            const head = vrm.humanoid.getBoneNode(
                THREE.VRMSchema.HumanoidBoneName.Head
            );
            this.camera.position.set(0.0, head.getWorldPosition(new THREE.Vector3()).y, 2.0);

            this.ar(vrm);
        });
    }

    ar(vrm) {

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
        const hip = vrm.humanoid.getBoneNode(
            THREE.VRMSchema.HumanoidBoneName.Hips
        );
        hip.position.x = pos.x;

        // 移動だけすると、モデルがカメラと関係ない方向向いちゃうので、カメラを向いてもらう
        var tmpV = new THREE.Vector3();
        tmpV.copy(this.camera.position);
        tmpV.sub(hip.position); //1.向かうベクトルの用意
        tmpV.normalize();       //2.単位ベクトル化

        var angle = Math.atan2(-tmpV.x, -tmpV.z);    //3.魔法の呪文
        hip.rotation.y = angle;               //4.向きに適用
    }

    alignRight(vrm) {
        const hip = vrm.humanoid.getBoneNode(
            THREE.VRMSchema.HumanoidBoneName.Hips
        );
        const head = vrm.humanoid.getBoneNode(
            THREE.VRMSchema.HumanoidBoneName.Head
        );

        const rightHand = vrm.humanoid.getBoneNode(
            THREE.VRMSchema.HumanoidBoneName.LeftHand
        );
        let asRatio = this.width / this.height;
        let rhPos = rightHand.getWorldPosition(new THREE.Vector3());
        let hPos = head.getWorldPosition(new THREE.Vector3());

        this.camera.position.set(-this.width * asRatio / 10 + rhPos.x * asRatio / 10, hPos.y, 1000.0);
        this.camera.lookAt(new THREE.Vector3(-this.width * asRatio / 10 + rhPos.x * asRatio / 10, hPos.y, 0));

        var tmpV = new THREE.Vector3();
        tmpV.copy(this.camera.position);
        tmpV.sub(hip.position);     //1.向かうベクトルの用意
        tmpV.normalize();                 //2.単位ベクトル化

        var angle = Math.atan2(-tmpV.x, -tmpV.z);    //3.魔法の呪文
        hip.rotation.y = angle;               //4.向きに適用

    }

    alignCenter(vrm) {
        const head = vrm.humanoid.getBoneNode(
            THREE.VRMSchema.HumanoidBoneName.Head
        );

        this.camera.position.set(0, head.getWorldPosition(new THREE.Vector3()).y * 1.5, 1000.0);
        this.camera.lookAt(new THREE.Vector3(0, head.getWorldPosition().y, 0));
    }

    // 【重要】フレームごとの描画処理
    frameCount = 0;
    animate() {
        // 次フレームの時もanimateを呼んでもらうようにお願いする。
        requestAnimationFrame(this.animate.bind(this));


        // フレームレートがhalfの時は半分のフレームをスキップする
        this.frameCount++;

        if (this.frameCount % 2 == 0) {
            return;
        }


        // 実はいまいちこの処理がよくわかってない。後でちゃんと調べる
        const delta = this.clock.getDelta();

        if (this.vrmController) {
            // なんか顔の検出のタイミングを描画に合わせられそうなんだけど、ちょっと調べる時間ないので保留
            // let delta = clock.getDelta();
            // JEEFACETRANSFERAPI.set_animateDelay(delta);

            // 最新の情報で3Dモデルを更新する（モーションとかローテートの情報で更新）
            this.vrmController.update(delta);

        }

        // レンダリングを実行する
        this.renderer.render(this.scene, this.camera);

    }
}

const main = new Main();
main.init();