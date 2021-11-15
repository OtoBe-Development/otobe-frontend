/* global THREE */

export class IKChain {
    constructor() {
        this.joints = [];
        this.target = null;
    }

    addJoints(joints) {
        for (let joint of joints) {
            this.addJoint(joint[0], joint[1]);
        }
    }

    addJoint(bone, constraintFunction) {
        let j = new IKJoint(bone, constraintFunction);

        if (this.joints.length > 0) {
            let par = this.joints[this.joints.length - 1];
            par.setParent(j);
            j.setChild(par);
        }
        this.joints.push(j);
    }

    setTarget(tgt) {
        this.target = tgt;
    }
}

export class IKJoint {
    constructor(bone, constraintFunction) {
        this.bone = bone;
        this.constraintFunction = constraintFunction;
        this.parent = null;
        this.child = null;
    }

    setParent(parent) {
        this.parent = parent;
    }

    setChild(child) {
        this.child = child;
    }
}

export function resolve(chain) {

    let targetObject = chain.target;

    let axis = new THREE.Vector3();
    let prevent_tip = new THREE.Vector3();
    //
    const angleRevise = [1, 0.2, 0.05, 0.01];
    let i = 0;

    for (let joint of chain.joints) {

        if (joint.parent === null || joint.parent === undefined) {
            // NOP
        } else {
            let destination = targetObject.position.clone();

            updateDestination(destination, joint, chain.joints);

            destination = joint.parent.bone.worldToLocal(destination);

            prevent_tip.setFromMatrixPosition(joint.bone.matrixWorld);
            prevent_tip = joint.parent.bone.worldToLocal(prevent_tip);

            axis.crossVectors(prevent_tip, destination).normalize();
            let angle = Math.acos(prevent_tip.dot(destination) / (prevent_tip.length() * destination.length()));

            if ((axis.x !== 0 || axis.y !== 0 || axis.z !== 0) &&
                (!isNaN(axis.x) && !isNaN(axis.y) && !isNaN(axis.z) && !isNaN(angle))) {

                let parent = joint.parent.bone;

                let quaternion = new THREE.Quaternion();
                quaternion.setFromAxisAngle(axis, angle * angleRevise[i]);
                parent.quaternion.multiply(quaternion);

                // setting rotation limit
                if (joint.parent.constraintFunction !== null && joint.parent.constraintFunction !== undefined) {
                    joint.parent.constraintFunction(joint.parent.bone);
                }
            }

            // 変更を適用
            if (joint.parent.parent === null || joint.parent.parent === undefined) {
                // NOP
            } else {
                joint.bone.updateMatrixWorld();
                joint.parent.bone.updateMatrixWorld();
            }
        }

        i++;
    }
}

function updateDestination(destination, self, joints) {
    let direction = new THREE.Vector3();

    for (let joint of joints) {
        if (joint === self) {
            return;
        }

        direction.setFromMatrixPosition(joint.parent.bone.matrixWorld);
        direction.sub(new THREE.Vector3().setFromMatrixPosition(joint.bone.matrixWorld));
        destination.add(direction);
    }
}

export class CONSTRAINTS {
    LEFT_SHOULDER(bone) {
        let euler = new THREE.Euler();
        let quaternion = new THREE.Quaternion();

        euler.setFromQuaternion(bone.quaternion, 'XZY', true);
        euler_canonical_set(euler);
        if (euler.y > Math.PI / 6) {
            euler.y = Math.PI / 6;
        }
        else if (euler.y < -Math.PI / 6) {
            euler.y = -Math.PI / 6;
        }

        euler.x = 0;

        if (euler.z < -Math.PI * 45 / 180) {
            euler.z = -Math.PI * 45 / 180;
        }
        else if (euler.z > 0) {
            euler.z = 0;
        }
        //euler.z = 0;

        quaternion.setFromEuler(euler);
        bone.quaternion.copy(quaternion);
    }

    RIGHT_SHOULDER(bone) {
        let euler = new THREE.Euler();
        let quaternion = new THREE.Quaternion();

        euler.setFromQuaternion(bone.quaternion, 'XZY', true);
        euler_canonical_set(euler);
        if (euler.y < -Math.PI / 6) {
            euler.y = -Math.PI / 6;
        }
        else if (euler.y > Math.PI / 6) {
            euler.y = Math.PI / 6;
        }

        euler.x = 0;

        if (euler.z > Math.PI * 45 / 180) {
            euler.z = Math.PI * 45 / 180;
        }
        else if (euler.z < 0) {
            euler.z = 0;
        }
        //euler.z = 0;

        quaternion.setFromEuler(euler);
        bone.quaternion.copy(quaternion);

    }

    LEFT_UPPER_ARM(bone) {
        let euler = new THREE.Euler();
        let quaternion = new THREE.Quaternion();

        euler.setFromQuaternion(bone.quaternion, 'YXZ', true);
        euler_canonical_set(euler);
        if (euler.y < -Math.PI * 160 / 180) {
            euler.y = -Math.PI * 160 / 180;
        }
        else if (euler.y > 0) {
            euler.y = 0;
        }

        if (euler.x > Math.PI / 2) {
            euler.x = Math.PI / 2;
        }
        else if (euler.x < -Math.PI / 2) {
            euler.x = -Math.PI / 2;
        }

        // プレゼン用に無理やり掌が相手を向いている状態を作る
        // ただ、IK的にはものっそい不自然な形になるので、もう少しかっこいいやり方を考えたい
        euler.x = - Math.PI / 3;

        if (euler.z > Math.PI * 170 / 180) {
            euler.z = Math.PI * 170 / 180;
        }
        else if (euler.z < -Math.PI * 50 / 180) {
            euler.z = -Math.PI * 50 / 180;
        }
        quaternion.setFromEuler(euler);
        bone.quaternion.copy(quaternion);
    }

    RIGHT_UPPER_ARM(bone) {
        let euler = new THREE.Euler();
        let quaternion = new THREE.Quaternion();

        euler.setFromQuaternion(bone.quaternion, 'YXZ', true);
        euler_canonical_set(euler);
        if (euler.y > Math.PI * 160 / 180) {
            euler.y = Math.PI * 160 / 180;
        }
        else if (euler.y < 0) {
            euler.y = 0;
        }

        if (euler.x < -Math.PI / 2) {
            euler.x = -Math.PI / 2;
        }
        else if (euler.x > Math.PI / 2) {
            euler.x = Math.PI / 2;
        }

        // プレゼン用に無理やり掌が相手を向いている状態を作る
        // ただ、IK的にはものっそい不自然な形になるので、もう少しかっこいいやり方を考えたい
        euler.x = Math.PI / 3;

        if (euler.z < -Math.PI * 170 / 180) {
            euler.z = -Math.PI * 170 / 180;
        }
        else if (euler.z > Math.PI * 50 / 180) {
            euler.z = Math.PI * 50 / 180;
        }

        quaternion.setFromEuler(euler);
        bone.quaternion.copy(quaternion);
    }

    LEFT_LOWER_ARM(bone) {
        let euler = new THREE.Euler();
        let quaternion = new THREE.Quaternion();

        euler.setFromQuaternion(bone.quaternion, 'YZX', true);
        euler_canonical_set(euler);
        if (euler.y < -Math.PI * 170 / 180) {
            euler.y = -Math.PI * 170 / 180;
        }
        else if (euler.y > 0) {
            euler.y = 0;
        }
        euler.z = 0;
        //euler.x = 0;
        if (euler.x < -Math.PI / 4) {
            euler.x = -Math.PI / 4;
        } else if (euler.x > Math.PI / 4) {
            euler.x = Math.PI / 4;
        }

        quaternion.setFromEuler(euler);
        bone.quaternion.copy(quaternion);

    }

    RIGHT_LOWER_ARM(bone) {
        let euler = new THREE.Euler();
        let quaternion = new THREE.Quaternion();

        euler.setFromQuaternion(bone.quaternion, 'YZX', true);
        euler_canonical_set(euler);
        if (euler.y > Math.PI * 170 / 180) {
            euler.y = Math.PI * 170 / 180;
        }
        else if (euler.y < 0) {
            euler.y = 0;
        }
        euler.z = 0;
        //euler.x = 0;
        if (euler.x > Math.PI / 4) {
            euler.x = Math.PI / 4;
        } else if (euler.x < -Math.PI / 4) {
            euler.x = -Math.PI / 4;
        }

        quaternion.setFromEuler(euler);
        bone.quaternion.copy(quaternion);
    }

    UPPER_LEG(bone) {
        let euler = new THREE.Euler();
        let quaternion = new THREE.Quaternion();

        euler.setFromQuaternion(bone.quaternion, 'XZY', true);
        euler_canonical_set(euler);

        if (euler.y < -Math.PI / 2) {
            euler.y = -Math.PI / 2;
        }
        else if (euler.y > Math.PI / 2) {
            euler.y = Math.PI / 2;
        }
        // left
        if (bone.name === 'J_Bip_L_UpperLeg') {
            if (euler.z > Math.PI / 6) {
                euler.z = Math.PI / 6;
            }
            else if (euler.z < -5 / 6 * Math.PI) {
                euler.z = -5 / 6 * Math.PI;
            }
        }

        quaternion.setFromEuler(euler);
        bone.quaternion.copy(quaternion);
    }

    LOWER_LEG(bone) {
        let euler = new THREE.Euler();
        let quaternion = new THREE.Quaternion();

        euler.setFromQuaternion(bone.quaternion, 'XYZ', true);
        euler_canonical_set(euler);
        euler.y = 0;
        euler.z = 0;
        /*if( euler.x > Math.PI/2 ){
            euler.x = -Math.PI;
        }
        else */if (euler.x > 0) {
            euler.x = 0;
        }

        quaternion.setFromEuler(euler);
        bone.quaternion.copy(quaternion);
    }

}

function euler_canonical_set(euler) {

    if (!euler.isEuler) {
        return;
    }

    // heading
    if (euler.order[0] === 'X') {
        if (euler.x < -Math.PI) {
            euler.x = -Math.PI;
        } else if (euler.x > Math.PI) {
            euler.x = Math.PI;
        }
    } else if (euler.order[0] === 'Y') {
        if (euler.y < -Math.PI) {
            euler.y = -Math.PI;
        } else if (euler.y > Math.PI) {
            euler.y = Math.PI;
        }
    } else if (euler.order[0] === 'Z') {
        if (euler.z < -Math.PI) {
            euler.z = -Math.PI;
        } else if (euler.z > Math.PI) {
            euler.z = Math.PI;
        }
    }

    // picchi
    if (euler.order[1] === 'X') {
        if (euler.x < -Math.PI / 2) {
            euler.x = -Math.PI / 2;
        } else if (euler.x > Math.PI / 2) {
            euler.x = Math.PI / 2;
        }
    } else if (euler.order[1] === 'Y') {
        if (euler.y < -Math.PI / 2) {
            euler.y = -Math.PI / 2;
        } else if (euler.y > Math.PI / 2) {
            euler.y = Math.PI / 2;
        }
    } else if (euler.order[1] === 'Z') {
        if (euler.z < -Math.PI / 2) {
            euler.z = -Math.PI / 2;
        } else if (euler.z > Math.PI / 2) {
            euler.z = Math.PI / 2;
        }
    }

    // bank
    if (euler.order[2] === 'X') {
        if (euler.x < -Math.PI) {
            euler.x = -Math.PI;
        } else if (euler.x > Math.PI) {
            euler.x = Math.PI;
        }
    } else if (euler.order[2] === 'Y') {
        if (euler.y < -Math.PI) {
            euler.y = -Math.PI;
        } else if (euler.y > Math.PI) {
            euler.y = Math.PI;
        }
    } else if (euler.order[2] === 'Z') {
        if (euler.z < -Math.PI) {
            euler.z = -Math.PI;
        } else if (euler.z > Math.PI) {
            euler.z = Math.PI;
        }
    }
}