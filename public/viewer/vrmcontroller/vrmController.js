/* global THREE */
import * as IK from './ikModoki.js';

export default class VrmController {
    constructor(vrm, scene, camera, renderer) {
        this.vrm = vrm;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.canvas = renderer.domElement;
        this.enableIK = false;
        this.debug = false;

        // IKのチェーンリスト
        this.ikChains = {};
        this.selectedIKChain = null;
        this.CONSTRAINTS = new IK.CONSTRAINTS();

        this.initVRM();

        this.initIKChain(this.vrm, this.scene, this.ikChains);
        this.initIKEventHandlers();

    }

    // 毎フレームやる処理
    update(delta, headScale, face) {
        this.resolveIK();
        this.applyFaceExpressions(headScale, face);
        this.vrm.update(delta);
    }

    resolveIK() {
        if (this.enableIK) {
            this.scene.updateMatrixWorld(true);
            IK.resolve(this.selectedIKChain);
        }
    }

    selectTargetIKChain(target) {
        this.selectedIKChain = this.ikChains[target];
    }

    toggleIK() {
        this.enableIK = this.enableIK ^ true;
    }

    // 顔の表情を変更する
    applyFaceExpressions(headScale, face) {
        if (headScale === undefined || face === undefined) {
            return;
        }

        // 頭サイズを変更する
        this.vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Head).scale.x = headScale;
        this.vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Head).scale.y = headScale;
        this.vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Head).scale.z = headScale;

        // 頭を動かす
        this.rotateBone(THREE.VRMSchema.HumanoidBoneName.Head, face.rotate, 0.5);
        this.rotateBone(THREE.VRMSchema.HumanoidBoneName.Neck, face.rotate, 0.3);
        this.rotateBone(THREE.VRMSchema.HumanoidBoneName.Spine, face.rotate, 0.2);

        // 口を動かす
        // 使えるブレンドシェイプ名：A, I, U, E, O
        this.setBlendShape(THREE.VRMSchema.BlendShapePresetName.A, face.expression.mouthOpen);
        this.setBlendShape(THREE.VRMSchema.BlendShapePresetName.I, 1 - face.expression.mouthRound);

        // 目の部分だれか何とかしてくれえええ；ｗ；
        this.setBlendShape(THREE.VRMSchema.BlendShapePresetName.BlinkL, this.continuousFilter(face.expression.eyeRClose, "right"));
        this.setBlendShape(THREE.VRMSchema.BlendShapePresetName.BlinkR, this.continuousFilter(face.expression.eyeLClose, "left"));

        // 使えるブレンドシェイプ(表情)Fun, Angry, Sorrow, Joy

        // 表情(喜び)
        this.setBlendShape(THREE.VRMSchema.BlendShapePresetName.Joy, this.logFilter(face.expression.smileR));

        // 表情(怒り)
        this.setBlendShape(THREE.VRMSchema.BlendShapePresetName.Angry, face.expression.eyeBrowLD);

        // 表情(悲しみ)
        this.setBlendShape(THREE.VRMSchema.BlendShapePresetName.Sorrow, face.expression.eyeBrowLD * face.expression.eyeRClose);
    }


    // 指定されたボーンを回転する。なお3個目の引数は倍率
    rotateBone(boneName, rotation, ampli) {
        const boneNode = this.vrm.humanoid.getBoneNode(
            boneName
        ); // VRMのHeadを取得
        boneNode.rotation.set(-rotation.x * ampli * 1.3, rotation.y * ampli, -rotation.z * ampli, 'ZXY');
    }

    // 指定されたブレンドシェイプを実行する。
    setBlendShape(name, value) {
        this.vrm.blendShapeProxy.setValue(
            name,
            value
        );
    }

    // 同じ値が何フレームか続いたら、そいつを値としてとるようにしたいんだけどうまく動かないだれか助けて
    frameCounts = {};
    frameCountThreshold = 10;
    continuousFilter(cur, name) {
        let frameCount = this.frameCounts[name];
        if (frameCount === undefined) {
            frameCount = {
                value: 0,
                nextValue: 1,
                count: 0
            };
            this.frameCounts[name] = frameCount;
        } else if (frameCount.nextValue === cur) {
            if (frameCount > this.frameCountThreshold) {
                frameCount.count = 0;
                frameCount.value = cur;
            } else {
                frameCount.count++;
            }
        } else {
            frameCount.count = 0;
            frameCount.nextValue = cur;
        }

        return frameCount.value;
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

    // 値を最初急激に上がる感じに調整するフィルター（モデル側の動きを派手にするために使用）
    logFilter(expressionValue) {
        return Math.log10(expressionValue * 50) - expressionValue + 0.5;
    }

    //================ こっから↓は初期化メソッド ================ 

    initVRM() {
        this.initVRMRotation();
        this.resetPose();
        this.lookAt(this.camera);
    }

    initVRMRotation() {
        const hips = this.vrm.humanoid.getBoneNode(
            THREE.VRMSchema.HumanoidBoneName.Hips
        );
        hips.rotation.y = Math.PI; // Hipsボーンを180度回転、正面を向かせる
    }

    resetPose() {
        this.vrm.humanoid.setPose({
            [THREE.VRMSchema.HumanoidBoneName.LeftShoulder]: {
                rotation: new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(0.0, 0.0, 0.2))
                    .toArray()
            },
            [THREE.VRMSchema.HumanoidBoneName.RightShoulder]: {
                rotation: new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(0.0, 0.0, -0.2))
                    .toArray()
            },
            [THREE.VRMSchema.HumanoidBoneName.LeftUpperArm]: {
                rotation: new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(0.0, 0.0, 1.1))
                    .toArray()
            },
            [THREE.VRMSchema.HumanoidBoneName.RightUpperArm]: {
                rotation: new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(0.0, 0.0, -1.1))
                    .toArray()
            },
            [THREE.VRMSchema.HumanoidBoneName.LeftLowerArm]: {
                rotation: new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(0.0, 0.0, 0.1))
                    .toArray()
            },
            [THREE.VRMSchema.HumanoidBoneName.RightLowerArm]: {
                rotation: new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(0.0, 0.0, -0.1))
                    .toArray()
            }
        });
    }

    lookAt(obj) {
        this.vrm.lookAt.target = obj;
    }

    /**
     * IKでモデルの操作をするためのチェーンを複数作る
     * ・右手ベース
     * ・左手ベース
     * ・右足ベース
     * ・左足ベース
     *
     * @param {*} model
     * @param {*} scene
     */
    initIKChain(vrm, scene, ikChains) {
        vrm.scene.updateMatrixWorld(true);

        // ターゲットオブジェクトを全部格納しておく為のScene
        const ikScene = new THREE.Scene();
        ikScene.name = 'IK_SCENE';

        let res;

        // 左手のIKチェーンを作る
        res = this.createLeftHandIKChain(vrm);
        ikChains['LEFT_HAND'] = res.chain;
        ikScene.add(res.tgt);

        // 右手のIKチェーンを作る
        res = this.createRightHandIKChain(vrm);
        ikChains['RIGHT_HAND'] = res.chain;
        ikScene.add(res.tgt);

        // 左足のIKチェーンを作る
        res = this.createLeftFootIKChain(vrm);
        ikChains['LEFT_FOOT'] = res.chain;
        ikScene.add(res.tgt);

        // 右足のIKチェーンを作る
        res = this.createRightFootIKChain(vrm);
        ikChains['RIGHT_FOOT'] = res.chain;
        ikScene.add(res.tgt);

        // 生成したモデル操作用のメッシュ一式を、VRMモデルのsceneに追加する
        vrm.scene.add(ikScene);
    }

    createHipIKChain(vrm) {
        let chain = new IK.IKChain();

        // このtgtを動かすと、それに連動して末端のボーンから順番に角度計算がされていく感じ
        let tgt = this.createEndpointTargetMesh('Hip_IK',
            vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips)
        )

        chain.setTarget(tgt);
        chain.addJoint(
            vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips), null
        );

        return { chain, tgt };
    }

    createLeftHandIKChain(vrm) {
        let chain = new IK.IKChain();
        let tgt = this.createEndpointTargetMesh('L_Hand_IK',
            vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftHand)
        )

        chain.setTarget(tgt);
        chain.addJoints([
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftHand), null],
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerArm), this.CONSTRAINTS.LEFT_LOWER_ARM],
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperArm), this.CONSTRAINTS.LEFT_UPPER_ARM],
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftShoulder), this.CONSTRAINTS.LEFT_SHOULDER],
            // [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Chest), null]
        ]);

        return { chain, tgt };
    }

    createRightHandIKChain(vrm) {
        let chain = new IK.IKChain();

        let tgt = this.createEndpointTargetMesh('R_Hand_IK',
            vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightHand)
        )
        chain.setTarget(tgt);
        chain.addJoints([
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightHand), null],
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightLowerArm), this.CONSTRAINTS.RIGHT_LOWER_ARM],
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightUpperArm), this.CONSTRAINTS.RIGHT_UPPER_ARM],
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightShoulder), this.CONSTRAINTS.RIGHT_SHOULDER]
        ]);

        return { chain, tgt };
    }

    createLeftFootIKChain(vrm) {
        let chain = new IK.IKChain();
        let tgt = this.createEndpointTargetMesh('L_Foot_IK',
            vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftFoot)
        )
        chain.setTarget(tgt);
        chain.addJoints([
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftFoot), null],
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg), this.CONSTRAINTS.LOWER_LEG],
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperLeg), this.CONSTRAINTS.UPPER_LEG],
        ]);

        return { chain, tgt };
    }

    createRightFootIKChain(vrm) {
        let chain = new IK.IKChain();
        let tgt = this.createEndpointTargetMesh('R_Foot_IK',
            vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightFoot)
        )
        chain.setTarget(tgt);
        chain.addJoints([
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightFoot), null],
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightLowerLeg), this.CONSTRAINTS.LOWER_LEG],
            [vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightUpperLeg), this.CONSTRAINTS.UPPER_LEG],
        ]);

        return { chain, tgt };
    }

    createEndpointTargetMesh(name, bone) {
        let ik = this.createMesh(new THREE.OctahedronBufferGeometry(0.05, 0));

        ik.name = name;
        ik.position.copy(bone.position);
        ik.position.applyMatrix4(bone.parent.matrixWorld);
        ik.selected = false;

        return ik;
    }

    createMesh(octahedron_geometry) {
        const octahedron_material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(0, 0, 1),
            depthTest: false,
            depthWrite: false,
            transparent: true,
            visible: this.debug
        });
        //octahedron_material.wireframe = true;

        const mesh = new THREE.Mesh(octahedron_geometry, octahedron_material);

        return mesh;
    }

    initIKEventHandlers() {
        document.addEventListener('keydown', (e) => {
            var keyName = e.key;

            if (keyName === 'p') {
                this.toggleIK();
                this.resetPose();
            }
        }, false);

        this.canvas.addEventListener('mousemove', (e) => {
            var rect = e.target.getBoundingClientRect();

            // スクリーン上のマウス位置を取得する
            var mouseX = e.clientX - rect.left;
            var mouseY = e.clientY - rect.top;

            // 取得したスクリーン座標を-1〜1に正規化する（WebGLは-1〜1で座標が表現される）
            mouseX = (mouseX / window.innerWidth) * 2 - 1;
            mouseY = -(mouseY / window.innerHeight) * 2 + 1;

            // マウスの位置ベクトル
            var pos = new THREE.Vector3(mouseX * 100, mouseY * 100, 0);

            pos.unproject(this.camera);

            // unprojectしちゃうとz座標もカメラと同じになっちゃうので0に戻す
            pos.z = 0;

            this.selectedIKChain.target.position.copy(pos);
        }, false);
    }

    initIKEventHandlers2() {
        this.prevent_coodinate = new THREE.Vector3(null, null, null);
        this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000000, 1000000), new THREE.MeshBasicMaterial());

        let _this = this;

        this.canvas.addEventListener('mousemove', (event) => {
            event.preventDefault();

            const mouse = new THREE.Vector2();
            // mouse.x = (event.clientX / _this.canvas.width) * 2 - 1;
            // mouse.y = - (event.clientY / _this.canvas.height) * 2 + 1;

            mouse.x = (event.clientX / _this.canvas.width) * 2 - 0.8;
            mouse.y = - (event.clientY / _this.canvas.height) * 2 - 0.4;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, _this.camera);

            _this.plane.lookAt(_this.camera.position);
            _this.plane.updateMatrixWorld();
            const intersects = raycaster.intersectObject(_this.plane);

            if (intersects.length > 0) {

                // _this.select_ik(intersects[0].object);

                // IKコントローラーの座標計算
                let now_coodinate = intersects[0].point;

                //移動ベクトル計算
                let vec = intersects[0].point.clone();
                vec.sub(_this.prevent_coodinate);

                _this.selectedIKChain.target.position.add(vec);

                _this.prevent_coodinate.copy(now_coodinate);

            } else {
                // _this.deselect_ik();
            }
        }, false);
    }
}