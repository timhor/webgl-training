import { vec2, vec3 } from 'gl-matrix';
import { Mesh } from './mesh';
import { Program } from './program';

import vertexShaderSource from './shaders/triangle-vertex-shader.glsl?raw';
import fragmentShaderSource from './shaders/triangle-fragment-shader.glsl?raw';
import { Camera } from './camera';

import textureUrl from './assets/test-texture.png?url';
import { Texture } from './texture';

export class TriangleObject {
  private mesh: Mesh;
  private program: Program;

  private texture: Texture | null = null;

  private viewProjectionMatrixUniform: WebGLUniformLocation | null;
  private colour1Uniform: WebGLUniformLocation | null;
  private colour2Uniform: WebGLUniformLocation | null;
  private timeUniform: WebGLUniformLocation | null;
  private samplerUniform: WebGLUniformLocation | null;

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
      { position: vec3.fromValues(0, 0.5, 0), uv: vec2.fromValues(0.5, 1) },
      // Bottom left of the triangle
      { position: vec3.fromValues(-0.5, -0.5, 0), uv: vec2.fromValues(0, 0) },
      // Bottom right of the triangle
      { position: vec3.fromValues(0.5, -0.5, 0), uv: vec2.fromValues(1, 0) },
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
    this.samplerUniform = this.program.getUniformLocation('uTexture');

    Texture.fromURL(gl, textureUrl).then((texture) => {
      this.texture = texture;
    });
  }

  public render(camera: Camera) {
    this.program.setUniformMat4(
      this.viewProjectionMatrixUniform,
      camera.getViewProjectionMatrix()
    );

    // this.program.setUniform1f(this.timeUniform, performance.now() / 1000);

    // this.program.setUniform3fv(
    //   this.colour1Uniform,
    //   vec3.fromValues(1, 0.18, 0.569)
    // );
    // this.program.setUniform3fv(
    //   this.colour2Uniform,
    //   vec3.fromValues(1, 0.753, 0.18)
    // );

    const textureSampler = 0;
    this.program.setUniform1i(this.samplerUniform, textureSampler);
    if (this.texture) {
      this.texture.bind(textureSampler);
    }

    this.mesh.render(this.program, 'aPosition', 'aUv');
  }
}
