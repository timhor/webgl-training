import { vec2, mat4, vec3 } from 'gl-matrix';
import { context } from './webgl-context';

export class Player {
  public position: vec2 = vec2.create();

  constructor() {
    // Set up event listeners
    document.body.addEventListener('pointermove', (event) => {
      this.position = context.screenToWorld(
        vec2.fromValues(event.clientX, event.clientY)
      );
    });
  }

  /**
   * Returns the current model matrix for the player, which is used to position and
   * scale the player in the world.
   */
  getModelMatrix() {
    const size = 1;
    const translation = this.position;

    const modelMatrix = mat4.create();
    mat4.translate(
      modelMatrix,
      modelMatrix,
      vec3.fromValues(translation[0], translation[1], 0)
    );
    mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(size, size, 1));

    return modelMatrix;
  }
}
