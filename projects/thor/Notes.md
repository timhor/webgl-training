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
