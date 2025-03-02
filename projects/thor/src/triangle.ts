import { vec2, vec3 } from 'gl-matrix';
import { Mesh } from './mesh';
import { Program } from './program';

import vertexShaderSource from './shaders/triangle-vertex-shader.glsl?raw';
import fragmentShaderSource from './shaders/triangle-fragment-shader.glsl?raw';
import { Camera } from './camera';

import textureUrl from './assets/test-texture.png?url';
import noiseTextureUrl from './assets/noise-texture.png?url';
import { Texture } from './texture';

export class TriangleObject {
  private mesh: Mesh;
  private program: Program;

  private texture: Texture | null = null;
  private noiseTexture: Texture | null = null;

  private viewProjectionMatrixUniform: WebGLUniformLocation | null;
  private colour1Uniform: WebGLUniformLocation | null;
  private colour2Uniform: WebGLUniformLocation | null;
  private timeUniform: WebGLUniformLocation | null;
  private textureUniform: WebGLUniformLocation | null;
  private noiseTextureUniform: WebGLUniformLocation | null;

  constructor(private gl: WebGL2RenderingContext) {
    //        (0.0, 0.5, 0.0)
    //              /\
    //             /  \
    //            /    \
    //           /      \
    //          /________\
    // (-0.5,-0.5,0.0)  (0.5,-0.5,0.0)
    this.mesh = new Mesh(
      this.gl,
      [
        // Top of the triangle
        { position: vec3.fromValues(0, 0.5, 0), uv: vec2.fromValues(0.5, 1) },
        // Bottom left of the triangle
        { position: vec3.fromValues(-0.5, -0.5, 0), uv: vec2.fromValues(0, 0) },
        // Bottom right of the triangle
        { position: vec3.fromValues(0.5, -0.5, 0), uv: vec2.fromValues(1, 0) },
      ],
      [
        {
          name: 'iOffset',
          size: 2,
        },
        {
          name: 'iColor',
          size: 3,
        },
      ]
    );
    this.mesh.setInstanceCount(3);
    this.mesh.setInstanceProperty(
      0,
      'iOffset',
      vec2.fromValues(0, -0.5) as Float32Array
    );
    this.mesh.setInstanceProperty(
      0,
      'iColor',
      vec3.fromValues(1.0, 0.5, 0.5) as Float32Array
    );
    this.mesh.setInstanceProperty(
      1,
      'iOffset',
      vec2.fromValues(0.6, 0.6) as Float32Array
    );
    this.mesh.setInstanceProperty(
      1,
      'iColor',
      vec3.fromValues(0.5, 1.0, 0.5) as Float32Array
    );
    this.mesh.setInstanceProperty(
      2,
      'iOffset',
      vec2.fromValues(-0.6, 0.6) as Float32Array
    );
    this.mesh.setInstanceProperty(
      2,
      'iColor',
      vec3.fromValues(0.5, 0.5, 1.0) as Float32Array
    );

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
    this.textureUniform = this.program.getUniformLocation('uTexture');
    this.noiseTextureUniform = this.program.getUniformLocation('uNoiseTexture');

    Texture.fromURL(gl, textureUrl).then((texture) => {
      this.texture = texture;
    });
    Texture.fromURL(gl, noiseTextureUrl).then((noiseTexture) => {
      this.noiseTexture = noiseTexture;
    });
  }

  public render(camera: Camera) {
    this.program.setUniformMat4(
      this.viewProjectionMatrixUniform,
      camera.getViewProjectionMatrix()
    );

    this.program.setUniform1f(this.timeUniform, performance.now() / 1000);

    // this.program.setUniform3fv(
    //   this.colour1Uniform,
    //   vec3.fromValues(1, 0.18, 0.569)
    // );
    // this.program.setUniform3fv(
    //   this.colour2Uniform,
    //   vec3.fromValues(1, 0.753, 0.18)
    // );

    let textureUnit = 0;
    if (this.texture) {
      this.texture.bind(textureUnit);
    }
    this.program.setUniform1i(this.textureUniform, textureUnit++);

    if (this.noiseTexture) {
      this.noiseTexture.bind(textureUnit);
    }
    this.program.setUniform1i(this.noiseTextureUniform, textureUnit++);

    this.mesh.render(this.program, 'aPosition', 'aUv');

    Texture.unbindAll(this.gl, textureUnit - 1);
  }
}
