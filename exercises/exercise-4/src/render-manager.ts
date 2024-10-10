/**
 * A class responsible for managing the rendering of the canvas. It sets up the WebGL
 * context, and orchestrates rendering to the canvas every frame.
 */
export class RenderManager {
  public canvas: HTMLCanvasElement;
  public gl: WebGL2RenderingContext;

  private onRenderCallbacks: (() => void)[] = [];

  /**
   * Sets up the WebGL context, which we need to execute any WebGL commands and
   * draw to the canvas.
   *
   * @param canvas The canvas element that we want to render to. The canvas is a
   * drawing surface in HTML where we can render graphics.
   */
  constructor(canvas: HTMLElement | null) {
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error('Canvas element not found');
    }

    const gl = canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL 2 not supported');
    }

    this.canvas = canvas;
    this.gl = gl;
  }

  /**
   * Adds a callback to be called every frame when rendering. You can use this
   * to render your scene.
   */
  public onRender(callback: () => void) {
    this.onRenderCallbacks.push(callback);
  }

  /**
   * Starts the render loop, which will render to the canvas every frame.
   */
  public startRendering() {
    requestAnimationFrame(this.render);
  }

  /**
   * A function that is called each frame to render everything to the canvas.
   *
   * In WebGL, any time we want to change what is displayed on the screen, we
   * have to render everything again. This function is where we put the code to
   * render the current frame.
   */
  private render = () => {
    // Update canvas size, taking into account the device pixel ratio for sharp
    // rendering on high DPI displays
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.canvas.clientWidth * dpr;
    this.canvas.height = this.canvas.clientHeight * dpr;

    // Update WebGL viewport to match canvas size
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    // Set the clear color to black
    this.gl.clearColor(0, 0, 0, 1);

    // Clear the screen
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    // Call all the render callbacks
    for (const callback of this.onRenderCallbacks) {
      callback();
    }

    // Render another frame, effectively creating a loop
    requestAnimationFrame(this.render);
  };
}
