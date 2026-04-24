"use client";

import { useEffect, useRef } from "react";

const PALETTES = {
  nature: ["#f0f4f0", "#1a2744", "#3b6fa0", "#6b7c3a", "#87a878", "#f0f4f0"],
  deep: ["#e8f0f7", "#0d1f3c", "#1a4a6e", "#0a3d2e", "#1a5c45", "#e8f0f7"],
  forest: ["#f2f5ee", "#2c3e1f", "#4a6741", "#8fa66a", "#c5d9a0", "#f2f5ee"],
  dawn: ["#f5f5f0", "#1a2a3a", "#4a7a8a", "#5a7a5a", "#9ab89a", "#f5f5f0"],
} as const;

export type PaletteKey = keyof typeof PALETTES;

interface Props {
  palette?: PaletteKey;
  speed?: number;
  amplitude?: number;
}

function normalizeColor(hex: number): [number, number, number] {
  return [
    ((hex >> 16) & 255) / 255,
    ((hex >> 8) & 255) / 255,
    (255 & hex) / 255,
  ];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
class MiniGl {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  meshes: any[];
  width = 1;
  height = 1;
  Uniform: any;
  Material: any;
  PlaneGeometry: any;
  Mesh: any;
  Attribute: any;
  commonUniforms: any;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.meshes = [];
    const gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) throw new Error("WebGL not supported");
    this.gl = gl;
    const ctx = gl;
    const self = this;

    this.Uniform = class {
      type = "float";
      value: any = undefined;
      typeFn = "1f";
      transpose?: boolean;
      excludeFrom?: string;

      constructor(e: any) {
        Object.assign(this, e);
        const m: Record<string, string> = {
          float: "1f",
          int: "1i",
          vec2: "2fv",
          vec3: "3fv",
          vec4: "4fv",
          mat4: "Matrix4fv",
        };
        this.typeFn = m[this.type] || "1f";
      }

      update(loc: WebGLUniformLocation | null) {
        if (this.value === undefined || loc === null) return;
        const isMat = this.typeFn.indexOf("Matrix") === 0;
        if (isMat) {
          (ctx as any)[`uniform${this.typeFn}`](
            loc,
            this.transpose || false,
            this.value,
          );
        } else {
          (ctx as any)[`uniform${this.typeFn}`](loc, this.value);
        }
      }

      getDeclaration(name: string, type: string, length?: number): string {
        const u = this as any;
        if (u.excludeFrom === type) return "";
        if (u.type === "array") {
          return (
            u.value[0].getDeclaration(name, type, u.value.length) +
            `\nconst int ${name}_length = ${u.value.length};`
          );
        }
        if (u.type === "struct") {
          let nn = name.replace("u_", "");
          nn = nn[0].toUpperCase() + nn.slice(1);
          const fields = Object.entries(u.value)
            .map(([n, uu]: [string, any]) =>
              uu.getDeclaration(n, type).replace(/^uniform/, ""),
            )
            .join("");
          return `uniform struct ${nn}\n{\n${fields}\n} ${name}${length ? `[${length}]` : ""};`;
        }
        return `uniform ${u.type} ${name}${length ? `[${length}]` : ""};`;
      }
    };

    this.Material = class {
      vertexSource: string;
      fragmentSource: string;
      uniforms: any;
      vertexShader: WebGLShader;
      fragmentShader: WebGLShader;
      program: WebGLProgram;
      uniformInstances: any[] = [];

      constructor(vertexShaders: string, fragments: string, uniforms: any = {}) {
        this.uniforms = uniforms;
        let prefix = "";
        Object.entries(self.commonUniforms).forEach(([n, u]: [string, any]) => {
          prefix += u.getDeclaration(n, "vertex") + "\n";
        });
        Object.entries(uniforms).forEach(([n, u]: [string, any]) => {
          prefix += u.getDeclaration(n, "vertex") + "\n";
        });
        this.vertexSource = `
precision highp float;
attribute vec4 position;
attribute vec2 uv;
attribute vec2 uvNorm;
${prefix}
${vertexShaders}`;
        let fprefix = "";
        Object.entries(self.commonUniforms).forEach(([n, u]: [string, any]) => {
          fprefix += u.getDeclaration(n, "fragment") + "\n";
        });
        Object.entries(uniforms).forEach(([n, u]: [string, any]) => {
          fprefix += u.getDeclaration(n, "fragment") + "\n";
        });
        this.fragmentSource = `
precision highp float;
${fprefix}
${fragments}`;
        this.vertexShader = self.getShaderByType(
          ctx.VERTEX_SHADER,
          this.vertexSource,
        );
        this.fragmentShader = self.getShaderByType(
          ctx.FRAGMENT_SHADER,
          this.fragmentSource,
        );
        const prog = ctx.createProgram()!;
        ctx.attachShader(prog, this.vertexShader);
        ctx.attachShader(prog, this.fragmentShader);
        ctx.linkProgram(prog);
        if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) {
          console.error(ctx.getProgramInfoLog(prog));
        }
        ctx.useProgram(prog);
        this.program = prog;
        this.attachUniforms(undefined, self.commonUniforms);
        this.attachUniforms(undefined, this.uniforms);
      }

      attachUniforms(name: string | undefined, uniforms: any) {
        if (!name) {
          Object.entries(uniforms).forEach(([n, u]) => this.attachUniforms(n, u));
          return;
        }
        if ((uniforms as any).type === "array") {
          (uniforms as any).value.forEach((v: any, i: number) =>
            this.attachUniforms(`${name}[${i}]`, v),
          );
        } else if ((uniforms as any).type === "struct") {
          Object.entries((uniforms as any).value).forEach(([n, u]) =>
            this.attachUniforms(`${name}.${n}`, u),
          );
        } else {
          this.uniformInstances.push({
            uniform: uniforms,
            location: ctx.getUniformLocation(this.program, name),
          });
        }
      }
    };

    this.Attribute = class {
      type: number;
      normalized: boolean;
      buffer: WebGLBuffer;
      target: number;
      values: any;
      size: number;

      constructor(e: any) {
        this.type = ctx.FLOAT;
        this.normalized = false;
        this.buffer = ctx.createBuffer()!;
        this.target = e.target || ctx.ARRAY_BUFFER;
        this.values = e.values;
        this.size = e.size;
        Object.assign(this, e);
        this.update();
      }

      update() {
        if (this.values !== undefined) {
          ctx.bindBuffer(this.target, this.buffer);
          ctx.bufferData(this.target, this.values, ctx.STATIC_DRAW);
        }
      }

      attach(name: string, program: WebGLProgram) {
        const loc = ctx.getAttribLocation(program, name);
        if (loc < 0) return loc;
        if (this.target === ctx.ARRAY_BUFFER) {
          ctx.enableVertexAttribArray(loc);
          ctx.vertexAttribPointer(loc, this.size, this.type, this.normalized, 0, 0);
        }
        return loc;
      }

      use(loc: number) {
        if (loc < 0) return;
        ctx.bindBuffer(this.target, this.buffer);
        if (this.target === ctx.ARRAY_BUFFER) {
          ctx.enableVertexAttribArray(loc);
          ctx.vertexAttribPointer(loc, this.size, this.type, this.normalized, 0, 0);
        }
      }
    };

    this.PlaneGeometry = class {
      attributes: any;
      xSegCount = 1;
      ySegCount = 1;
      vertexCount = 0;
      quadCount = 0;
      width = 1;
      height = 1;

      constructor() {
        this.attributes = {
          position: new self.Attribute({ target: ctx.ARRAY_BUFFER, size: 3 }),
          uv: new self.Attribute({ target: ctx.ARRAY_BUFFER, size: 2 }),
          uvNorm: new self.Attribute({ target: ctx.ARRAY_BUFFER, size: 2 }),
          index: new self.Attribute({
            target: ctx.ELEMENT_ARRAY_BUFFER,
            size: 3,
            type: ctx.UNSIGNED_SHORT,
          }),
        };
        this.setTopology();
        this.setSize();
      }

      setTopology(x = 1, y = 1) {
        this.xSegCount = x;
        this.ySegCount = y;
        this.vertexCount = (this.xSegCount + 1) * (this.ySegCount + 1);
        this.quadCount = this.xSegCount * this.ySegCount * 2;
        this.attributes.uv.values = new Float32Array(2 * this.vertexCount);
        this.attributes.uvNorm.values = new Float32Array(2 * this.vertexCount);
        this.attributes.index.values = new Uint16Array(3 * this.quadCount);
        for (let y0 = 0; y0 <= this.ySegCount; y0++) {
          for (let x0 = 0; x0 <= this.xSegCount; x0++) {
            const i = y0 * (this.xSegCount + 1) + x0;
            this.attributes.uv.values[2 * i] = x0 / this.xSegCount;
            this.attributes.uv.values[2 * i + 1] = 1 - y0 / this.ySegCount;
            this.attributes.uvNorm.values[2 * i] =
              (x0 / this.xSegCount) * 2 - 1;
            this.attributes.uvNorm.values[2 * i + 1] =
              1 - (y0 / this.ySegCount) * 2;
            if (x0 < this.xSegCount && y0 < this.ySegCount) {
              const s = y0 * this.xSegCount + x0;
              this.attributes.index.values[6 * s] = i;
              this.attributes.index.values[6 * s + 1] = i + 1 + this.xSegCount;
              this.attributes.index.values[6 * s + 2] = i + 1;
              this.attributes.index.values[6 * s + 3] = i + 1;
              this.attributes.index.values[6 * s + 4] = i + 1 + this.xSegCount;
              this.attributes.index.values[6 * s + 5] =
                i + 2 + this.xSegCount;
            }
          }
        }
        this.attributes.uv.update();
        this.attributes.uvNorm.update();
        this.attributes.index.update();
      }

      setSize(w = 1, h = 1) {
        this.width = w;
        this.height = h;
        this.attributes.position.values =
          this.attributes.position.values &&
          this.attributes.position.values.length === 3 * this.vertexCount
            ? this.attributes.position.values
            : new Float32Array(3 * this.vertexCount);
        for (let y0 = 0; y0 <= this.ySegCount; y0++) {
          for (let x0 = 0; x0 <= this.xSegCount; x0++) {
            const i = y0 * (this.xSegCount + 1) + x0;
            this.attributes.position.values[3 * i] =
              (x0 * w) / this.xSegCount - w / 2;
            this.attributes.position.values[3 * i + 1] =
              -(y0 * h) / this.ySegCount + h / 2;
          }
        }
        this.attributes.position.update();
      }
    };

    this.Mesh = class {
      geometry: any;
      material: any;
      attributeInstances: any[];

      constructor(geometry: any, material: any) {
        this.geometry = geometry;
        this.material = material;
        this.attributeInstances = [];
        Object.entries(geometry.attributes).forEach(([n, a]: [string, any]) => {
          this.attributeInstances.push({
            attribute: a,
            location: a.attach(n, material.program),
          });
        });
        self.meshes.push(this);
      }

      draw() {
        ctx.useProgram(this.material.program);
        this.material.uniformInstances.forEach(({ uniform, location }: any) =>
          uniform.update(location),
        );
        this.attributeInstances.forEach(({ attribute, location }: any) =>
          attribute.use(location),
        );
        ctx.drawElements(
          ctx.TRIANGLES,
          this.geometry.attributes.index.values.length,
          ctx.UNSIGNED_SHORT,
          0,
        );
      }
    };

    const id = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    this.commonUniforms = {
      projectionMatrix: new this.Uniform({ type: "mat4", value: id }),
      modelViewMatrix: new this.Uniform({ type: "mat4", value: id }),
      resolution: new this.Uniform({ type: "vec2", value: [1, 1] }),
      aspectRatio: new this.Uniform({ type: "float", value: 1 }),
    };
  }

  getShaderByType(type: number, src: string): WebGLShader {
    const s = this.gl.createShader(type)!;
    this.gl.shaderSource(s, src);
    this.gl.compileShader(s);
    if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
      console.error(this.gl.getShaderInfoLog(s));
    }
    return s;
  }

  setSize(w = 640, h = 480) {
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.gl.viewport(0, 0, w, h);
    this.commonUniforms.resolution.value = [w, h];
    this.commonUniforms.aspectRatio.value = w / h;
  }

  setOrthographicCamera() {
    this.commonUniforms.projectionMatrix.value = [
      2 / this.width,
      0,
      0,
      0,
      0,
      2 / this.height,
      0,
      0,
      0,
      0,
      -0.001,
      0,
      0,
      0,
      0,
      1,
    ];
  }

  render() {
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clearDepth(1);
    this.meshes.forEach((m) => m.draw());
  }
}

class Gradient {
  canvas: HTMLCanvasElement;
  colors: readonly string[];
  minigl: MiniGl;
  time = 0;
  last = 0;
  isPlaying = false;
  animId?: number;
  mesh: any;

  constructor(canvas: HTMLCanvasElement, colors: readonly string[]) {
    this.canvas = canvas;
    this.colors = colors;
    this.minigl = new MiniGl(canvas);
    this.init();
  }

  init() {
    const sc = this.colors.map((h) =>
      normalizeColor(parseInt(h.replace("#", "0x"), 16)),
    );
    const U = this.minigl.Uniform;
    const uniforms: any = {
      u_time: new U({ value: 0 }),
      u_shadow_power: new U({ value: 5 }),
      u_darken_top: new U({ value: 0 }),
      u_active_colors: new U({ value: [1, 1, 1, 1], type: "vec4" }),
      u_global: new U({
        value: {
          noiseFreq: new U({ value: [0.0001, 0.0002], type: "vec2" }),
          noiseSpeed: new U({ value: 0.000008 }),
        },
        type: "struct",
      }),
      u_vertDeform: new U({
        value: {
          incline: new U({ value: 0.18 }),
          offsetTop: new U({ value: -0.5 }),
          offsetBottom: new U({ value: -0.5 }),
          noiseFreq: new U({ value: [3, 4], type: "vec2" }),
          noiseAmp: new U({ value: 180 }),
          noiseSpeed: new U({ value: 10 }),
          noiseFlow: new U({ value: 2.5 }),
          noiseSeed: new U({ value: 5 }),
        },
        type: "struct",
        excludeFrom: "fragment",
      }),
      u_baseColor: new U({
        value: sc[0],
        type: "vec3",
        excludeFrom: "fragment",
      }),
      u_waveLayers: new U({ value: [], excludeFrom: "fragment", type: "array" }),
    };
    for (let i = 1; i < sc.length; i++) {
      uniforms.u_waveLayers.value.push(
        new U({
          value: {
            color: new U({ value: sc[i], type: "vec3" }),
            noiseFreq: new U({
              value: [2 + i / sc.length, 3 + i / sc.length],
              type: "vec2",
            }),
            noiseSpeed: new U({ value: 11 + 0.3 * i }),
            noiseFlow: new U({ value: 6.5 + 0.3 * i }),
            noiseSeed: new U({ value: 5 + 10 * i }),
            noiseFloor: new U({ value: 0.1 }),
            noiseCeil: new U({ value: 0.63 + 0.07 * i }),
          },
          type: "struct",
        }),
      );
    }

    const vert = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
vec3 blendNormal(vec3 base,vec3 blend){return blend;}
vec3 blendNormal(vec3 base,vec3 blend,float opacity){return blend*opacity+base*(1.-opacity);}
varying vec3 v_color;
void main(){
  float time=u_time*u_global.noiseSpeed;
  vec2 noiseCoord=resolution*uvNorm*u_global.noiseFreq;
  float tilt=resolution.y/2.*uvNorm.y;
  float incline=resolution.x*uvNorm.x/2.*u_vertDeform.incline;
  float offset=resolution.x/2.*u_vertDeform.incline*mix(u_vertDeform.offsetBottom,u_vertDeform.offsetTop,uv.y);
  float noise=snoise(vec3(
    noiseCoord.x*u_vertDeform.noiseFreq.x+time*u_vertDeform.noiseFlow,
    noiseCoord.y*u_vertDeform.noiseFreq.y,
    time*u_vertDeform.noiseSpeed+u_vertDeform.noiseSeed
  ))*u_vertDeform.noiseAmp;
  noise*=1.-pow(abs(uvNorm.y),2.);
  noise=max(0.,noise);
  vec3 pos=vec3(position.x,position.y+tilt+incline+noise-offset,position.z);
  v_color=u_baseColor;
  for(int i=0;i<u_waveLayers_length;i++){
    if(u_active_colors[i+1]==1.){
      WaveLayers layer=u_waveLayers[i];
      float layerNoise=smoothstep(layer.noiseFloor,layer.noiseCeil,
        snoise(vec3(
          noiseCoord.x*layer.noiseFreq.x+time*layer.noiseFlow,
          noiseCoord.y*layer.noiseFreq.y,
          time*layer.noiseSpeed+layer.noiseSeed
        ))/2.+0.5
      );
      v_color=blendNormal(v_color,layer.color,pow(layerNoise,4.));
    }
  }
  gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);
}`;
    const frag = `varying vec3 v_color;
void main(){
  vec3 color=v_color;
  if(u_darken_top==1.){
    vec2 st=gl_FragCoord.xy/resolution.xy;
    color.g-=pow(st.y+sin(-12.)*st.x,u_shadow_power)*0.4;
  }
  gl_FragColor=vec4(color,1.);
}`;

    const material = new this.minigl.Material(vert, frag, uniforms);
    const geometry = new this.minigl.PlaneGeometry();
    this.mesh = new this.minigl.Mesh(geometry, material);
    this.resize();
  }

  /**
   * Resize based on the canvas's own bounding rect — NOT a shrinking parent.
   * The parent uses overflow:hidden + width animation to reveal/clip.
   * We use the window or a fixed root reference to decide the shader resolution.
   */
  resize = () => {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w === 0 || h === 0) return;
    this.minigl.setSize(w, h);
    this.minigl.setOrthographicCamera();
    this.mesh.geometry.setTopology(Math.ceil(w * 0.02), Math.ceil(h * 0.05));
    this.mesh.geometry.setSize(w, h);
  };

  animate = (ts: number) => {
    if (!this.isPlaying) return;
    this.time += Math.min(ts - this.last, 1000 / 15);
    this.last = ts;
    this.mesh.material.uniforms.u_time.value = this.time;
    this.minigl.render();
    this.animId = requestAnimationFrame(this.animate);
  };

  start() {
    this.isPlaying = true;
    this.animId = requestAnimationFrame(this.animate);
  }

  stop() {
    this.isPlaying = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

export function GradientCanvas({
  palette = "forest",
  speed = 0.000011,
  amplitude = 100,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gradientRef = useRef<Gradient | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const g = new Gradient(canvasRef.current, PALETTES[palette]);
    g.mesh.material.uniforms.u_global.value.noiseSpeed.value = speed;
    g.mesh.material.uniforms.u_vertDeform.value.noiseAmp.value = amplitude;
    g.start();
    gradientRef.current = g;

    const onResize = () => g.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      g.stop();
      gradientRef.current = null;
    };
  }, [palette, speed, amplitude]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 block h-full w-full"
      aria-hidden="true"
    />
  );
}
