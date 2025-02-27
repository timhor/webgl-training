import { mat4, vec3 } from 'gl-matrix';

export class Program {
  // The result of compiling and linking vertex and fragment shaders
  public program: WebGLProgram;

  constructor(
    private gl: WebGL2RenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string
  ) {
    const vertexShader = this.compileShader(
      gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.compileShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    this.program = this.createProgram(vertexShader, fragmentShader);
  }

  private compileShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type);
    if (!shader) {
      throw new Error(`Failed to create ${type} shader`);
    }

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const info = this.gl.getShaderInfoLog(shader);
      throw new Error(`Failed to compile ${type} shader: ${info}`);
    }

    return shader;
  }

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ): WebGLProgram {
    const program = this.gl.createProgram();
    if (!program) {
      throw new Error('Failed to create program');
    }

    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);

    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const info = this.gl.getProgramInfoLog(program);
      throw new Error(`Failed to link program: ${info}`);
    }

    return program;
  }

  use(): void {
    this.gl.useProgram(this.program);
  }

  getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.program, name);
  }

  getUniformLocation(name: string): WebGLUniformLocation | null {
    return this.gl.getUniformLocation(this.program, name);
  }

  setUniform1i(location: WebGLUniformLocation | null, value: number): void {
    if (location == null) {
      throw new Error('Uniform location is null');
    }

    this.use();
    this.gl.uniform1i(location, value);
    this.gl.useProgram(null);
  }

  setUniform1f(location: WebGLUniformLocation | null, value: number): void {
    if (location == null) {
      throw new Error('Uniform location is null');
    }

    this.use();
    this.gl.uniform1f(location, value);
    this.gl.useProgram(null);
  }

  setUniform3fv(location: WebGLUniformLocation | null, value: vec3): void {
    if (location == null) {
      throw new Error('Uniform location is null');
    }

    this.use();
    this.gl.uniform3fv(location, value);
    this.gl.useProgram(null);
  }

  setUniformMat4(location: WebGLUniformLocation | null, value: mat4): void {
    if (location == null) {
      throw new Error('Uniform location is null');
    }

    this.use();
    this.gl.uniformMatrix4fv(location, false, value);
    this.gl.useProgram(null);
  }
}
