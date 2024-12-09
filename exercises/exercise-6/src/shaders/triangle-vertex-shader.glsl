#version 300 es

// The view-projection matrix, which maps world coordinates to clip-space
// coordinates
uniform mat4 uViewProjectionMatrix;

// The position of the vertex being processed
in vec3 aPosition;

// The position of the vertex, output to the fragment shader
out vec3 vPosition;

void main() {
  // Pass the vertex position to the fragment shader
  vPosition = aPosition;

  // Output the vertex position multiplied by uViewProjectionMatrix
  // gl_Position is a built-in variable that holds the final output position
  gl_Position = uViewProjectionMatrix * vec4(aPosition, 1.0);
}
