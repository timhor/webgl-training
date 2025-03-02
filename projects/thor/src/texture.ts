interface TextureOptions {
  minFilter?: number;
  magFilter?: number;
  wrapU?: number;
  wrapV?: number;
}

export class Texture {
  private texture: WebGLTexture;

  constructor(
    private gl: WebGL2RenderingContext,
    image: TexImageSource,
    options: TextureOptions = {}
  ) {
    const texture = gl.createTexture();
    if (!texture) {
      throw new Error('Failed to create texture');
    }

    this.texture = texture;

    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      options.wrapU ?? this.gl.REPEAT
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      options.wrapV ?? this.gl.REPEAT
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      options.minFilter ?? this.gl.NEAREST_MIPMAP_LINEAR
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MAG_FILTER,
      options.magFilter ?? this.gl.LINEAR
    );

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
    url: string,
    options: TextureOptions = {}
  ): Promise<Texture> {
    const image = new Image();
    image.src = url;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        resolve(new Texture(gl, image, options));
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

  public static unbindAll(
    gl: WebGL2RenderingContext,
    maxTextureUnit: number
  ): void {
    for (let i = maxTextureUnit; i >= 0; i--) {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }
}
