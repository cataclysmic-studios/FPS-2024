import { Spring } from "shared/utilities/classes/spring";
import type GunData from "shared/structs/gun-data";

import type { FpsController } from "client/controllers/fps";
import type ProceduralAnimation from "../procedural-animation";

const RECOVER_TIME = 0.08;
const SPRING_DEFAULTS = {
  camera: [20, 60, 4, 6],
  model: [30, 90, 3, 3],
  cameraTorque: [15, 90, 4, 6.5],
  modelTorque: [25, 60, 4, 5.5]
};

export default class RecoilAnimation implements ProceduralAnimation {
  /**
   * How much the torque should be multiplied for rotational shaking (Z axis of rotation)
   */
  public readonly shakeMultiplier = 12;

  private readonly springs = {
    camera: new Spring(...SPRING_DEFAULTS.camera),
    model: new Spring(...SPRING_DEFAULTS.model),
    cameraTorque: new Spring(...SPRING_DEFAULTS.cameraTorque),
    modelTorque: new Spring(...SPRING_DEFAULTS.modelTorque)
  };

  public start(): void {}

  public update(dt: number, fps: FpsController, connectedToCamera: boolean): Vector3 {
    const data = fps.getData<GunData>();
    if (!data) return new Vector3;

    const springDamper = 10;
    const spring = connectedToCamera ? this.springs.camera : this.springs.model;
    const torqueSpring = connectedToCamera ? this.springs.cameraTorque : this.springs.modelTorque;
    const origin = spring.update(dt).div(springDamper);
    const torque = torqueSpring.update(dt).div(springDamper);
    return new Vector3(origin.X, torque.Y, origin.Z);
  }

  public kick(
    gunData: GunData,
    force: Vector3,
    stabilization: number,
    torqueDirection: number,
    connectedToCamera: boolean
  ): void {

    if (connectedToCamera)
      this.kickCamera(gunData, force, stabilization, torqueDirection);
    else
      this.kickModel(gunData, force, stabilization, torqueDirection);
  }

  private kickCamera(
    { recoilSpringModifiers: modifiers }: GunData,
    force: Vector3,
    stabilization: number,
    torqueDirection: number
  ): void {

    const [mainDefaultMass, mainDefaultForce, mainDefaultDamper, mainDefaultSpeed] = SPRING_DEFAULTS.camera;
    this.springs.camera.mass = mainDefaultMass / modifiers.cameraRecoverSpeed;
    this.springs.camera.force = mainDefaultForce / modifiers.cameraKickForceDamper;
    this.springs.camera.damping = mainDefaultDamper * modifiers.cameraKickDamper;
    this.springs.camera.speed = mainDefaultSpeed * modifiers.cameraKickSpeed;

    const positional = force.div(stabilization);
    this.springs.camera.shove(positional);
    task.delay(RECOVER_TIME / modifiers.cameraRecoverSpeed, () => this.springs.camera.shove(positional.mul(-1)));

    const [torqueDefaultMass, torqueDefaultForce, torqueDefaultDamper, torqueDefaultSpeed] = SPRING_DEFAULTS.cameraTorque;
    this.springs.cameraTorque.mass = torqueDefaultMass / modifiers.cameraRecoverSpeed;
    this.springs.cameraTorque.force = torqueDefaultForce / modifiers.cameraKickForceDamper;
    this.springs.cameraTorque.damping = torqueDefaultDamper * modifiers.cameraKickDamper;
    this.springs.cameraTorque.speed = torqueDefaultSpeed * modifiers.cameraKickSpeed;

    const torque = force.div(stabilization);
    this.springs.cameraTorque.shove(torque.mul(torqueDirection));
    task.delay(RECOVER_TIME / modifiers.cameraRecoverSpeed, () => this.springs.cameraTorque.shove(torque.mul(-torqueDirection)));
  }

  private kickModel(
    { recoilSpringModifiers: modifiers }: GunData,
    force: Vector3,
    stabilization: number,
    torqueDirection: number
  ): void {

    const [mainDefaultMass, mainDefaultForce, mainDefaultDamper, mainDefaultSpeed] = SPRING_DEFAULTS.model;
    this.springs.model.mass = mainDefaultMass / modifiers.modelRecoverSpeed;
    this.springs.model.force = mainDefaultForce / modifiers.modelKickForceDamper;
    this.springs.model.damping = mainDefaultDamper * modifiers.modelKickDamper;
    this.springs.model.speed = mainDefaultSpeed * modifiers.modelKickSpeed;

    const positional = force.div(stabilization);
    this.springs.model.shove(positional);
    task.delay(RECOVER_TIME / modifiers.modelRecoverSpeed, () => this.springs.model.shove(positional.mul(-1)));

    const [torqueDefaultMass, torqueDefaultForce, torqueDefaultDamper, torqueDefaultSpeed] = SPRING_DEFAULTS.modelTorque;
    this.springs.modelTorque.mass = torqueDefaultMass / modifiers.modelRecoverSpeed;
    this.springs.modelTorque.force = torqueDefaultForce / modifiers.modelKickForceDamper;
    this.springs.modelTorque.damping = torqueDefaultDamper * modifiers.modelKickDamper;
    this.springs.modelTorque.speed = torqueDefaultSpeed * modifiers.modelKickSpeed;

    const torque = force.div(stabilization);
    this.springs.modelTorque.shove(torque.mul(torqueDirection));
    task.delay(RECOVER_TIME / modifiers.modelRecoverSpeed, () => this.springs.modelTorque.shove(torque.mul(-torqueDirection)));
  }
}