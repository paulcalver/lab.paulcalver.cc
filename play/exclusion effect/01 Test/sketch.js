// Exclusion by overlap count in plain p5.js (global mode)

let pg;           // offscreen 2D buffer where we accumulate tiny alpha
let sh;           // fragment shader
let uDrawAlpha = 0.02; // alpha per draw in pg (0..1). Must match the shader uniform.

const vertSrc = `
precision mediump float;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vUv;
void main(){
  vUv = aTexCoord;
  gl_Position = vec4(aPosition, 1.0);
}
`;

const fragSrc = `
precision mediump float;
uniform sampler2D u_tex;
uniform float u_drawAlpha;
uniform vec3  u_color;
uniform vec3  u_inner_color;
uniform bool  u_inner_transparent;
uniform float u_minThreshold;
uniform float u_maxThreshold;
varying vec2 vUv;

void main(){
  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);
  vec4 tex = texture2D(u_tex, uv);

  if (tex.a <= 0.0){
    gl_FragColor = vec4(0.0);
    return;
  }

  float a = clamp(tex.a, u_minThreshold, u_maxThreshold);
  float numOverlaps = floor(a / max(u_drawAlpha, 1e-6));
  bool isEven = mod(numOverlaps, 2.0) == 0.0;

  if (!isEven){
    gl_FragColor = vec4(u_color, 1.0);
  } else {
    if (u_inner_transparent){
      gl_FragColor = vec4(0.0);
    } else {
      gl_FragColor = vec4(u_inner_color, 1.0);
    }
  }
}
`;

function setup(){
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
  textureMode(NORMAL);

  pg = createGraphics(width, height); // 2D buffer, we only care about alpha accumulation
  pg.pixelDensity(1);
  pg.clear();

  sh = createShader(vertSrc, fragSrc);
}

function draw(){
  // 1) draw overlapping geometry to pg with tiny alpha
  pg.push();
  pg.clear();
  pg.noStroke();
  const a255 = uDrawAlpha * 255;

  let t = millis() * 0.001;
  let cx = pg.width * 0.5;
  let cy = pg.height * 0.5;

  // concentric circles
  for (let r = 60; r < min(pg.width, pg.height) * 0.9; r += 28){
    pg.fill(255, 255, 255, a255);
    pg.circle(cx, cy, r * (1 + 0.08 * sin(t + r * 0.04)));
  }

  // orbiting ring of circles
  let n = 28;
  let R = min(pg.width, pg.height) * 0.36;
  for (let i = 0; i < n; i++){
    let ang = i / n * TWO_PI + t * 0.55;
    let x = cx + R * cos(ang);
    let y = cy + R * sin(ang);
    let d = 120 + 70 * sin(t * 1.6 + i * 0.7);
    pg.fill(255, 255, 255, a255);
    pg.circle(x, y, d);
  }

  // optional text contributes to overlaps
  pg.textAlign(CENTER, CENTER);
  pg.textSize(min(pg.width, pg.height) * 0.12);
  pg.fill(255, 255, 255, a255);
  pg.text('CALVER', cx + 200 * sin(t*0.9), cy + 160 * cos(t*0.7));
  pg.pop();

  // 2) shade: convert overlap parity to colour or hole
  shader(sh);

  // colours to taste
  let outer = color('#ff4fd8');   // outer colour
  let inner = color('#4fa7ff');   // inner colour if not transparent

  sh.setUniform('u_tex', pg);
  sh.setUniform('u_drawAlpha', uDrawAlpha);
  sh.setUniform('u_color', [red(outer)/255, green(outer)/255, blue(outer)/255]);
  sh.setUniform('u_inner_color', [red(inner)/255, green(inner)/255, blue(inner)/255]);
  sh.setUniform('u_inner_transparent', true); // set false to use inner colour
  sh.setUniform('u_minThreshold', 0.0);
  sh.setUniform('u_maxThreshold', 1.0);

  rectMode(CENTER);
  rect(0, 0, width, height); // full screen quad
  resetShader();
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
  pg = createGraphics(width, height);
  pg.pixelDensity(1);
  pg.clear();
}

// Quick controls
function keyPressed(){
  if (key === 't'){ // toggle holes vs inner colour
    sh.setUniform('u_inner_transparent', false);
  }
  if (key === 'h'){ // back to holes
    sh.setUniform('u_inner_transparent', true);
  }
  if (key === '-' || key === '_'){
    uDrawAlpha = max(0.002, uDrawAlpha * 0.8);
  }
  if (key === '=' || key === '+'){
    uDrawAlpha = min(0.2, uDrawAlpha * 1.25);
  }
}