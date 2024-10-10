#version 300 es

precision highp float;

// An input variable that defines what colour we want to render the triangle with
uniform vec3 uColour;

// The output colour of the fragment shader that will be rendered to the screen
out vec4 fragColour;

void main() {
  // Output the given `uColour`
  fragColour = vec4(uColour, 1.0);
}
