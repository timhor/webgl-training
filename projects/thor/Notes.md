## Admin

- Wednesday block of time is optional, zoom meeting is also optional - treat it as office hours
- Find reference implementations in `exercises`
- Do the actual exercise under your own folder in `projects`

## Docs

- OpenGL docs are more detailed than MDN. Prefix the term you want to search for with `gl`, e.g. `enableVertexAttribArray` -> `gl enableVertexAttribArray`.

## Lesson 1 - WebGL fundamentals and boilerplate - 2024-10-21

- If you want to change something, you need to re-render everything in a frame. There's no partial re-rendering of certain components like in React.
  - It's generally a good idea to optimise to not render if nothing has changed, otherwise the GPU is doing work on every frame
- The WebGL API is very stateful. For example, to paint the background, you have to first set a colour and then call a separate function to paint using the most recently saved colour.
  - Good practice is to set the state immediately before you need it, and reset it after you're done. This way, the state won't leak out.
  - Example:
    ```ts
    // Set the colour
    this.gl.clearColor(1, 0, 0, 1);
    // Paint the background with the most recently set colour
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    ```
- WebGL deals with physical pixels, not CSS pixels, so we need to account for that by multiplying the canvas width and height by `window.devicePixelRatio`

Exercise: paint a solid background onto the screen using WebGL

## Lesson 2 - GPU data - 2024-10-28

- The entire screen WebGL renders lives inside a 2x2x2 cube (coords go from -1 to 1 in each axis)
- Buffer is a way of storing data (usually vertex data) on the GPU
  - Data goes into the GPU once, then if you need to change the scene, the data is already there
- WebGL expects a flat array of vertices, so not `vec3` data structures for instance
- If you intend to change the data on the GPU frequently, use `gl.DYNAMIC_DRAW` instead of `gl.STATIC_DRAW`
- Vertex shaders can be used to modify data on the GPU itself rather than reuploading it

Exercise: create a mesh abstraction, upload some vertices to the buffer (since this won't be visible, the 'pass criteria' is lack of console errors)

## Lesson 3 - Shaders - 2024-11-18

- Shader = a program that runs on your GPU to execute rendering logic
  - Vertex shader outputs the position of vertices
  - Fragment shader determines the final colour of each pixel, linearly interpolated going from vertex to vertex
- You can further subdivide to increase the number of vertices
- Shaders can operate with different levels of precisions, more often on mobile GPUs for performance reasons. For floating point numbers (which is what you use most of the time in vertex shaders), we want to specify high precision via `precision highp float`. Without this, it won't look correct.
  - This is only necessary for the fragment shader, where there is no default precision value. Vertex shaders are set to `highp` by default ([source](https://stackoverflow.com/a/28557554)).
- `in` lets the shader receive the data stored in the buffer
  - Example:
    ```glsl
    in vec3 aPosition
    ```
  - `in` also implies that the specified variable will have a different value for every vertex
- This is in contrast to `uniform` where it's the same for every vertex
  - Example:
    ```glsl
    uniform vec3 uColor
    ```
  - If you just want a flat colour, using `uniform` means you don't need to store the same colour for every vertex and only have to store it once
- `out` is used to pass data from the vertex shader to the fragment shader
  - Example:
    ```glsl
    out vec4 fragColor
    ```
- Positions:
  - Example:
    ```glsl
    gl_Position = vec4(0.0, 0.0, 0.0, 5.0);
    ```
  - Why `vec4` instead of `vec3`: the 4th parameter acts like a divisor, where each of the other 3 values is divided by that number. This is used in perspective cameras where things further away appear smaller.
- Good practice to prefix each variable name with something that represents where the data is coming from:
  - Uniform - prefix `u` to indicate it's coming from a uniform
  - Attribute - prefix `a` to indicate it's coming from a vertex attribute
- Spreading is automatic, so we can do

  ```glsl
  in vec3 aPosition;

  void main() {
    gl_Position = vec4(aPosition, 1.0);
  }
  ```

- Vertex shaders and fragment shaders are always linked together as a single unit - they're run together as a _program_.
- When drawing a mesh, it will use whatever program is currently bound, and you bind a program by doing `this.gl.useProgram()`
- `getAttribLocation` and `getUniformLocation` allow you to get a reference to variables defined in GLSL. They return an integer which is like an alias for the variable (more efficient than referencing it as a string).

Exercise: write a vertex and fragment shader, then implement a program abstraction that can compile and link the two shaders (since this won't be visible, the 'pass criteria' is lack of console errors)

## Lesson 4 - Drawing - 2024-11-25

- Input variables in a vertex shader are disabled by default. Use `enableVertexAttribArray` to enable them.
- `vertexAttribPointer` is used to tell WebGL how to read the data from the buffer. It's like a mapping from the buffer to the shader.
- `vertexAttribPointer` parameters:
  - Say we define position coordinates as `(x, y, z)` and texture coordinates as `(u, v)`. It's common for this data to be stored sequentially so the numbers are adjacent in memory, meaning the GPU can access them quickly:
    ```
    x1, y1, z1, u1, v2 | x2, y2, z2, u2, v2 | x3, y3, z3, u3, v3
    ```
  - `offset` controls where in this array to read the first attribute from
  - `stride` controls how many elements to read before reaching the next attribute
  - In this example:
    - Position: `offset` = `0`, `stride` = `5`
    - Texture: `offset` = `3`, `stride` = `5`
  - `stride` of `0` is a special case where the attributes are tightly packed, meaning they're adjacent in memory and WebGL will automatically calculate it for you
  - Multiply `stride` (and `offset`, if it's not `0`), by the number of bytes per element
- `drawArrays`:
  - First param is the type of primitive to draw
  - Second and third params control how much of the buffer to render
- For better performance, we can encapsulate all the `gl.bind` calls in a vertex array object (VAO) - this is a way to store all the state needed to render a mesh in a single object

Exercise: get triangle displaying on screen using the mesh and program abstractions

## Lesson 5 - Coordinate systems - 2024-12-02

- <https://www.3blue1brown.com/lessons/linear-transformations>
- Clip space ranges from -1 to 1 in all axes
- Anything outside of a 'clip space' will not be visible
- A camera allows you to change how you the scene
- View matrix defines the operations of the camera
- Projection matrix refers to something that projects a scene onto clip space (e.g. making everything smaller so it fits into clip space)
- These are combined into a view projection matrix which allows us to move the camera and scale the scene accordingly
  - It effectively maps world coordinates to clip space coordinates
- We use a 4x4 matrix to be able to customise the origin (we use the additional column to specify translation in 3D space)
  - The same concept applies if we use a 3x3 matrix in 2D space, but generally everything on the GPU is done in 3D space

Exercise: implement your own camera class and wire it up with the vertex shader, and play around with animating the camera

## Lesson 6 - Shader animations - 2024-12-09

- There's no 'differential rendering' - if anything on the screen has changed, everything has to be re-rendered
- The vertex and fragment shaders must be linked because the vertex shader can pass values to the fragment shader
  - Vertex shader is per vertex, fragment shader is per pixel
- Use a graphing calculator to compute the formula for a repeating animation, e.g. <https://www.desmos.com/calculator>
  - Depends on what you're building, e.g. `mix()` expects between 0 and 1, so the formula should produce a value between 0 and 1
- If you've defined a uniform but don't use it, it'll be `null`
- Use `performance.now()` for time-based animations as you'll get higher precision and pacing; using `Date.now()` will look much more choppy

Exercise: implement some cool animation effects in the shader

## Lesson 7 - Exercise shareback - 2025-01-06

- Uniforms are for the entire program, so you can use the same uniforms in the vertex shader and fragment shader
- Where possible, opt for multiplication in mathematical operations as it's a tiny bit faster than dividing
  - E.g. multiply by 0.001 instead of dividing by 1000
  - Exception is in cases like doing `/3` which is preferable over vs. `*0.333333`
- Doing calculations in the vertex shader is more performant as they are only done once per vertex rather than once per pixel
  - You can pass along the output in an `out` variable
  - Caveat: value will be linearly interpolated between vertices, so this may not always work for your purposes
- Backface culling:
  - n 3D apps, the 'inside' of a 3D object or the 'back' of a 2D object in 3D space is not visible, because it would be a waste of compute
  - The order you specify the vertices is what determines the front and back of an object (clockwise by default). this means if you accidentally set vertices in a counterclockwise order, the object will not be visible.
  - This is NOT enabled by default

## Lesson 8 - Textures - 2025-02-03

- A texture is like a line/grid/cube of pixels (depending on how many dimensions you're working with)
- If the texture coordinates exceed the range of the texture, WebGL will repeat the texture in an infinite grid
- Texture coordinates map to the pixel that gets rendered
- WebGL calls can sometimes fail if the context is lost. This can happen, for example, if the user is on a laptop with low battery and it switches from a dedicated GPU to an integrated GPU. If this happens, it's on the application developer to handle this gracefully and recreate everything.
- `texImage2D` takes in data and uploads it to the GPU.
- Mipmaps contain the base image, the image at 50% size, 25% size, etc. This is used to improve performance when rendering textures at different sizes.
- If not using mipmaps, set the `level` parameter to `0`
- To use a texture in a shader, you need to define a `uniform` with a `sampler2D` type. A sampler is a way to look up pixels from given texture coordinates.
- Need to bind a texture to a sampler
- Texture coordinates are often defined in terms of `u` and `v` (corresponding to `x` and `y`)
- In the fragment shader, use the `texture` function to sample the texture
- When loading images from a URL: the browser loads images top down, but WebGL loads them bottom up. This means you need to flip the image vertically before uploading it to the GPU:
  ```ts
  this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
  ```

Exercise: get a texture displayed in WebGL correctly

Stretch exercise:

- Make the image appear in greyscale without modifying the image itself
- Make the image appear twice as big as it actually is (i.e. zoomed in)
