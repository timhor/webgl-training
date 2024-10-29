## Admin

- Wednesday block of time is optional, zoom meeting is also optional - treat it as office hours
- Find reference implementations in `exercises`
- Do the actual exercise under your own folder in `projects`

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
