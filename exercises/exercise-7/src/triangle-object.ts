import { vec2, vec3 } from 'gl-matrix';

import { Camera } from './camera';
import { Mesh } from './mesh';
import { Program } from './program';
import { Texture } from './texture';

import vertexShaderSource from './shaders/triangle-vertex-shader.glsl?raw';
import fragmentShaderSource from './shaders/triangle-fragment-shader.glsl?raw';
import textureUrl from './assets/test-texture.png?url';

/**
 * Represents our triangle object, containing all the logic needed to render it.
 */
export class TriangleObject {
  /**
   * The mesh that defines the triangle's geometry.
   */
  private mesh: Mesh;

  /**
   * The program that will be used to render the triangle.
   */
  private program: Program;

  /**
   * The texture that will be applied to the triangle, or `null` if it hasn't
   * loaded yet.
   */
  private texture: Texture | null = null;

  // Uniform variables that we'll use
  private viewProjectionMatrixUniform: WebGLUniformLocation | null;
  private textureUniform: WebGLUniformLocation | null;

  /**
   * Creates a new instance of our Triangle, which will render a simple triangle to the
   * screen.
   *
   * @param gl The WebGL rendering context.
   * @param camera The camera that will be used to view the scene.
   */
  constructor(
    private gl: WebGL2RenderingContext,
    private camera: Camera
  ) {
    // Create a simple triangle mesh that we want to render.
    //
    // In 3D graphics, shapes are made up of points called vertices.
    // Here's what our triangle looks like:
    //
    //        (0.0, 0.5, 0.0)
    //              /\
    //             /  \
    //            /    \
    //           /      \
    //          /________\
    // (-0.5,-0.5,0.0)  (0.5,-0.5,0.0)
    //
    // Each vertex is represented by three numbers: (x, y, z)
    // In this 2D example, z is always 0.
    this.mesh = new Mesh(this.gl, [
      // Top of the triangle
      { position: vec3.fromValues(0, 0.5, 0), uv: vec2.fromValues(0.5, 0.6) },
      // Bottom left of the triangle
      {
        position: vec3.fromValues(-0.5, -0.5, 0),
        uv: vec2.fromValues(0.4, 0.4),
      },
      // Bottom right of the triangle
      {
        position: vec3.fromValues(0.5, -0.5, 0),
        uv: vec2.fromValues(0.6, 0.4),
      },
    ]);

    // Create a program that we'll use to render the triangle
    this.program = new Program(gl, vertexShaderSource, fragmentShaderSource);
    this.viewProjectionMatrixUniform = this.program.getUniformLocation(
      'uViewProjectionMatrix'
    );
    this.textureUniform = this.program.getUniformLocation('uTexture');

    // Load the texture for the triangle
    Texture.fromURL(
      gl,
      textureUrl,
      // Options to control how the texture is sampled
      {
        // When we need to upscale the texture, use the nearest pixel value. This
        // creates a 'pixelated' effect.
        magFilter: gl.NEAREST,
        // When we sample outside the texture's bounds in the horizontal (U)
        // direction, wrap the texture around (repeat it)
        wrapU: gl.REPEAT,
        // When we sample outside the texture's bounds in the vertical (V)
        // direction, wrap the texture around (repeat it)
        wrapV: gl.REPEAT,
      }
    ).then((texture) => {
      this.texture = texture;
    });
  }

  /**
   * Renders the triangle to the screen. This method should be called every frame.
   */
  public render() {
    // Set the view-projection matrix
    this.program.setUniformMatrix4f(
      this.viewProjectionMatrixUniform,
      this.camera.getViewProjectionMatrix()
    );

    // Specify which texture unit to use
    const textureUnit = 0;
    this.program.setUniform1i(this.textureUniform, textureUnit);

    // If the texture has loaded, bind it to the texture unit
    if (this.texture) {
      this.texture.bind(textureUnit);
    }

    // Render the triangle, using 'aPosition' as the attribute that will receive
    // the vertex positions and 'aUv' as the attribute that will receive the UV
    // coordinates.
    this.mesh.render(this.program, 'aPosition', 'aUv');
  }
}
