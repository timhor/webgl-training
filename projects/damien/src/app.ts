import { Renderer } from './renderer/renderer';
import { World } from './world/world';
import { UI } from './ui/ui';

type AppConfig = {
  canvas: HTMLCanvasElement;
};

export class App {
  private renderer = new Renderer();
  private world = new World();
  private ui = new UI();
  private time = 0;

  init(config: AppConfig) {
    this.renderer.init({
      canvas: config.canvas,
    });
    this.startTick();
  }

  startTick() {
    const startTime = Date.now();
    const loop = () => {
      let time = Date.now() - startTime;
      this.tick(time);
      requestAnimationFrame(loop);
    };
    loop();
  }

  tick(time: number) {
    this.renderer.tick(time);
  }

  destroy() {
    this.renderer.destroy();
  }
}
