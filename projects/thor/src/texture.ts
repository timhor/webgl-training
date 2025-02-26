export class Texture {
  private texture: WebGLTexture;

  constructor(
    private gl: WebGL2RenderingContext,
    image: TexImageSource
  ) {
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create texture');
    }

    this.texture = texture;

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    this.gl.texImage2D(
      this.gl.TEXTURE_2D,
      0,
      this.gl.RGBA,
      this.gl.RGBA,
      this.gl.UNSIGNED_BYTE,
      image
    );

    this.gl.generateMipmap(this.gl.TEXTURE_2D);

    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  public static fromURL(
    gl: WebGL2RenderingContext,
    url: string
  ): Promise<Texture> {
    const image = new Image();
    image.src = url;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        resolve(new Texture(gl, image));
      };

      image.onerror = (error) => {
        reject(error);
      };
    });
  }

  public bind(unit: number): void {
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }
}
