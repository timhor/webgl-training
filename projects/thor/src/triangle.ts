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
  private colour1Uniform: WebGLUniformLocation | null;
  private colour2Uniform: WebGLUniformLocation | null;
  private timeUniform: WebGLUniformLocation | null;

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
    this.colour1Uniform = this.program.getUniformLocation('uColour1');
    this.colour2Uniform = this.program.getUniformLocation('uColour2');
    this.timeUniform = this.program.getUniformLocation('uTime');
  }

  public render(camera: Camera) {
    this.program.setUniformMat4(
      this.viewProjectionMatrixUniform,
      camera.getViewProjectionMatrix()
    );

    this.program.setUniform1f(this.timeUniform, performance.now() / 1000);

    this.program.setUniform3fv(
      this.colour1Uniform,
      vec3.fromValues(1, 0.18, 0.569)
    );
    this.program.setUniform3fv(
      this.colour2Uniform,
      vec3.fromValues(1, 0.753, 0.18)
    );

    this.mesh.render(this.program, 'aPosition');
  }
}
