#version 300 es

// The view-projection matrix, which maps world coordinates to clip-space
// coordinates
uniform mat4 uViewProjectionMatrix;

// The position of the vertex being processed
in vec3 aPosition;

// The texture coordinates of the vertex being processed
in vec2 aUv;

// The texture coordinates of the vertex, output to the fragment shader
out vec2 vUv;

void main() {
  // Pass the texture coordinates to the fragment shader
  vUv = aUv;

  // Output the vertex position multiplied by uViewProjectionMatrix
  // gl_Position is a built-in variable that holds the final output position
  gl_Position = uViewProjectionMatrix * vec4(aPosition, 1.0);
}
