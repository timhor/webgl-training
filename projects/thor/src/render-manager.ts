export class RenderManager {
  public gl: WebGL2RenderingContext;
  public canvas: HTMLCanvasElement;

  private onRenderCallbacks: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      throw new Error('WebGL2 not supported');
    }

    this.gl = gl;
    this.canvas = canvas;
  }

  public startRendering() {
    requestAnimationFrame(this.render);
  }

  public addRenderCallback(callback: () => void) {
    this.onRenderCallbacks.push(callback);
  }

  public render = () => {
    // Calculate physical pixel dimensions based on canvas size and device pixel ratio
    const width = this.canvas.clientWidth * window.devicePixelRatio;
    const height = this.canvas.clientHeight * window.devicePixelRatio;

    // Resize the HTML canvas element to match the display size
    this.canvas.width = width;
    this.canvas.height = height;

    // Set the WebGL viewport to match the canvas size
    this.gl.viewport(0, 0, width, height);

    // Clear the canvas with a solid color
    this.drawColor(0, 0.5, 0.8, 1.0);

    // Execute all render callbacks
    for (const callback of this.onRenderCallbacks) {
      callback();
    }

    // Render another frame
    requestAnimationFrame(this.render);
  };

  public drawColor(r: number, g: number, b: number, a: number) {
    this.gl.clearColor(r, g, b, a);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }
}
