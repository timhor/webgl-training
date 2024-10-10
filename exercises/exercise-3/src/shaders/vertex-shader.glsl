#version 300 es

// The position of the vertex being processed
in vec3 aPosition;

void main() {
  // Output the vertex position unchanged
  // gl_Position is a built-in variable that holds the final output position
  gl_Position = vec4(aPosition, 1.0);
}
