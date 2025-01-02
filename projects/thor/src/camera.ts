import { mat4, vec2, vec3 } from 'gl-matrix';

export class Camera {
  public position: vec2;
  public zoom: number;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.position = vec2.create();
    this.zoom = 1;
  }

  public getViewProjectionMatrix(): mat4 {
    const aspectRatio = this.canvas.width / this.canvas.height;

    // We define our custom coordinate system to match that of clip space here
    const screenHeight = 2;
    const screenWidth = screenHeight * aspectRatio;

    const zoomedScreenHeight = screenHeight / this.zoom;
    const zoomedScreenWidth = screenWidth / this.zoom;

    // WebGL clip space ranges from -1 to 1
    const clipSpaceRange = 2;

    const scaleX = clipSpaceRange / zoomedScreenWidth;
    const scaleY = clipSpaceRange / zoomedScreenHeight;

    const scalingMatrix = mat4.fromScaling(
      mat4.create(),
      vec3.fromValues(scaleX, scaleY, 1)
    );

    // Negate positions - e.g. if camera moves to left, world moves to the right
    const translationMatrix = mat4.fromTranslation(
      mat4.create(),
      vec3.fromValues(-this.position[0], -this.position[1], 0)
    );

    const viewProjectionMatrix = mat4.multiply(
      mat4.create(),
      scalingMatrix,
      translationMatrix
    );

    return viewProjectionMatrix;
  }
}
