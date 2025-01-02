import { vec3 } from 'gl-matrix';
import { Mesh } from './mesh';
import { Program } from './program';

import vertexShaderSource from './shaders/triangle-vertex-shader.glsl?raw';
import fragmentShaderSource from './shaders/triangle-fragment-shader.glsl?raw';
import { Camera } from './camera';

export class TriangleObject {
  private mesh: Mesh;
  private program: Program;

  private viewProjectionMatrixUniform: WebGLUniformLocation | null;
  private colourUniform: WebGLUniformLocation | null;

  constructor(private gl: WebGL2RenderingContext) {
    //        (0.0, 0.5, 0.0)
    //              /\
    //             /  \
    //            /    \
    //           /      \
    //          /________\
    // (-0.5,-0.5,0.0)  (0.5,-0.5,0.0)
    this.mesh = new Mesh(this.gl, [
      // Top of the triangle
      vec3.fromValues(0, 0.5, 0),
      // Bottom left of the triangle
      vec3.fromValues(-0.5, -0.5, 0),
      // Bottom right of the triangle
      vec3.fromValues(0.5, -0.5, 0),
    ]);

    this.program = new Program(
      this.gl,
      vertexShaderSource,
      fragmentShaderSource
    );
    this.viewProjectionMatrixUniform = this.program.getUniformLocation(
      'uViewProjectionMatrix'
    );
    this.colourUniform = this.program.getUniformLocation('uColour');
  }

  public render(camera: Camera) {
    this.program.setUniformMat4(
      this.viewProjectionMatrixUniform,
      camera.getViewProjectionMatrix()
    );

    const pulseR = Math.sin(performance.now() / 500) + 1;
    const pulseG = Math.sin(performance.now() / 800) + 1;
    const pulseB = Math.sin(performance.now() / 300) + 1;
    this.program.setUniform3fv(
      this.colourUniform,
      vec3.fromValues(pulseR, pulseG, pulseB)
    );

    this.mesh.render(this.program, 'aPosition');
  }
}
