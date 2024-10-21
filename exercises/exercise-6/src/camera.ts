import { vec2, mat4, vec3 } from 'gl-matrix';

/**
 * Represents a 2D camera for WebGL rendering.
 */
export class Camera {
  /**
   * The position of the camera in 2D world space.
   */
  public position: vec2;

  /**
   * The zoom level of the camera.
   *
   * Values greater than 1 zoom in (make things appear larger), while values
   * less than 1 zoom out (make things appear smaller).
   */
  public zoom: number;

  /**
   * The HTML canvas element associated with this camera.
   */
  private canvas: HTMLCanvasElement;

  /**
   * Creates a new Camera instance.
   *
   * @param canvas The HTML canvas element associated with this camera.
   */
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.position = vec2.fromValues(0, 0);
    this.zoom = 1;
  }

  /**
   * Calculates and returns the view-projection matrix for this camera.
   *
   * This matrix transforms world coordinates to clip space coordinates, taking
   * into account the camera's position, zoom, and the canvas's aspect ratio.
   *
   * @remarks It's worth understanding what these different coordinate systems
   * are:
   * 1. World Space: This is the coordinate system we use internally in our
   *    application. Objects have positions, rotations, and scales (sizes)
   *    defined in this space.
   *
   *    We can define this however we like, but here we've defined it such that
   *    2 world units = 100% of the screen height at 100% zoom.
   *
   * 2. Clip Space: This is the coordinate system that WebGL uses internally. In
   *    clip space, x, y, and z coordinates range from -1 to 1. Anything outside
   *    this range is "clipped" and not rendered.
   *
   * 3. Screen Space: This is the final coordinate system, where positions
   *    correspond to actual pixels on the screen. The top-left corner is (0,0),
   *    and the bottom-right corner is (width, height) of the canvas.
   *
   * Our view-projection matrix transforms coordinates from World Space to Clip
   * Space. WebGL then automatically handles the transformation from Clip Space
   * to Screen Space.
   *
   * @remarks It's also worth briefly covering what a matrix is, if you don't
   * know any linear algebra.
   *
   * A matrix is a rectangular array of numbers. In 3D graphics, we commonly use
   * 4x4 matrices to represent transformations. These matrices can encode
   * operations like translation (moving), rotation, scaling, and projection all
   * at once.
   *
   * The cool thing about matrices is that we can multiply them together to
   * combine transformations. For example, if we have a matrix that scales an
   * object and another matrix that rotates it, we can multiply these together
   * to get a single matrix that scales and rotates the object in one step.
   *
   * When we multiply a vector (representing a point) by a matrix, the result is
   * the vector with all these transformations applied.
   *
   * @returns A 4x4 matrix representing the combined view and projection
   * transformations.
   */
  getViewProjectionMatrix(): mat4 {
    // Calculate the aspect ratio of the screen
    const aspectRatio = this.canvas.width / this.canvas.height;

    // Define the size of the screen, in world units.
    // We arbitrarily decide that 2 world units = 100% of the screen height at
    // 100% zoom. You could change this though to any value you like.
    const screenHeight = 2;
    const screenWidth = screenHeight * aspectRatio;

    // Calculate the size of the screen in world units, with the zoom applied.
    // When we zoom in (zoom > 1), the viewport becomes smaller, showing less of
    // the world.
    // When we zoom out (zoom < 1), the viewport becomes larger, showing more of
    // the world.
    const zoomedScreenWidth = screenWidth / this.zoom;
    const zoomedScreenHeight = screenHeight / this.zoom;

    // Near and far planes define the front and back boundaries of our visible
    // 3D space.
    // In 2D, we typically use fixed values. Here, anything with a z-coordinate
    // below -1 or above 1 won't be visible as it will end up outside the clip
    // space.
    const near = -1;
    const far = 1;

    // The total depth of our visible space
    const totalDepth = far - near;

    // The range of WebGL's clip space in each dimension
    const clipSpaceRange = 2; // from -1 to 1, which is a range of 2

    // Step 1: Scaling
    //
    // We need to scale our world coordinates to fit into the [-1, 1] range of
    // WebGL's clip space.
    // Scales the width of our view to 2 units
    const scaleX = clipSpaceRange / zoomedScreenWidth;
    // Scales the height of our view to 2 units
    const scaleY = clipSpaceRange / zoomedScreenHeight;
    // Scales our depth range to 2 units
    const scaleZ = clipSpaceRange / totalDepth;

    // Create a matrix which scales our world coordinates by scaleX in the x
    // direction, scaleY in the y direction, and scaleZ in the z direction.
    const scalingMatrix = mat4.fromScaling(
      mat4.create(),
      vec3.fromValues(scaleX, scaleY, scaleZ)
    );

    // Step 2: Camera Position
    //
    // To create the illusion of camera movement, we move the world in the
    // opposite direction. If the camera moves right (positive x), we move the
    // world left (negative x). This is why we negate the camera's position in
    // the translation.
    const cameraMatrix = mat4.fromTranslation(
      mat4.create(),
      vec3.fromValues(-this.position[0], -this.position[1], 0)
    );

    // Now, let's combine these transformations
    //
    // In matrix multiplication, the order matters! (unlike when multiplying
    // numbers)
    //
    // It makes most intuitive sense to read matrix multiplication from right to
    // left:
    // 1. We first apply the camera movement (moving the world opposite to the
    //    camera)
    // 2. Then we apply the scaling to fit into clip space
    const viewProjectionMatrix = mat4.create();
    mat4.multiply(
      // Where to store the result
      viewProjectionMatrix,
      // Calculate `scalingMatrix` * `cameraMatrix`
      scalingMatrix,
      cameraMatrix
    );

    // The resulting matrix, when applied to a vertex (x, y, z), will:
    // 1. Move the world opposite to the camera's position, creating the
    //    illusion of camera movement
    // 2. Scale to fit the clip space
    return viewProjectionMatrix;
  }
}
