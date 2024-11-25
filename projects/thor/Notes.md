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
