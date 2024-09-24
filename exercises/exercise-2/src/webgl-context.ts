import { vec2 } from 'gl-matrix';

/**
 * How many units tall the screen is at 100% zoom.
 */
export const BASE_SCREEN_HEIGHT = 10;

class WebGLContext {
  public gl: WebGL2RenderingContext;
  public canvas: HTMLCanvasElement;

  /**
   * The position of the camera in world units.
   */
  public cameraPosition: vec2 = vec2.create();

  /**
   * The zoom level of the camera.
   */
  public cameraZoom = 1;

  /**
   * Sets up the WebGL context and canvas.
   *
   * The canvas is a drawing surface in HTML where we can render graphics. The
   * WebGL context provides us with the WebGL functions we need to draw on this
   * canvas.
   */
  constructor() {
    const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL 2 not supported');
    }

    this.gl = gl;
    this.canvas = canvas;
  }

  /**
   * Returns the size of the screen in world units.
   */
  getScreenSize() {
    const screenWidth =
      (BASE_SCREEN_HEIGHT * this.canvas.clientWidth) / this.canvas.clientHeight;

    return vec2.fromValues(
      screenWidth / this.cameraZoom,
      BASE_SCREEN_HEIGHT / this.cameraZoom
    );
  }

  /**
   * Converts a position in screen coordinates to world coordinates.
   */
  screenToWorld(screenPosition: vec2) {
    const screenSize = this.getScreenSize();

    return vec2.fromValues(
      (screenPosition[0] / this.canvas.clientWidth - 0.5) * screenSize[0] +
        this.cameraPosition[0],
      (screenPosition[1] / this.canvas.clientHeight - 0.5) * screenSize[1] +
        this.cameraPosition[1]
    );
  }

  /**
   * Converts a position in world coordinates to screen coordinates.
   */
  worldToScreen(worldPosition: vec2) {
    const screenSize = this.getScreenSize();

    return vec2.fromValues(
      ((worldPosition[0] - this.cameraPosition[0]) / screenSize[0] + 0.5) *
        this.canvas.clientWidth,
      ((worldPosition[1] - this.cameraPosition[1]) / screenSize[1] + 0.5) *
        this.canvas.clientHeight
    );
  }
}

export const context = new WebGLContext();
