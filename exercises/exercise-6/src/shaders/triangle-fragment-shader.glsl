#version 300 es

precision highp float;

#define PI 3.14159265

// Input variables that define the two colours of the gradient
uniform vec3 uColour1;
uniform vec3 uColour2;

// An input variable that holds the current time in seconds
uniform float uTime;

// The position of the fragment being processed, passed from the vertex shader.
// The GPU will interpolate this value across the surface of the triangle
// automatically for us.
in vec3 vPosition;

// The output colour of the fragment shader that will be rendered to the screen
out vec4 fragColour;

void main() {
  // Calculate a value between 0.0 and 1.0 based on the x position, which we'll
  // use to blend our colours
  float gradient = vPosition.x + 0.5;

  // Add a time value to the gradient value to make it move over time
  gradient += uTime;

  // Make the gradient value oscillate from 1.0 at the left, to 0.0 in the middle, and
  // back to 1.0 at the right. This will make the gradient smoothly transition
  // back and forth between the two colours, instead of abruptly repeating.
  gradient = 0.5 + 0.5 * cos(2.0 * PI * gradient);

  // Calculate the final colour of the fragment by interpolating between
  // uColour1 and uColour2 based on the gradient value
  vec3 colour = mix(uColour1, uColour2, gradient);

  fragColour = vec4(colour, 1.0);
}
