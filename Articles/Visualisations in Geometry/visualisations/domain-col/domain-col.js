let sketch_domain_col = new p5((p) => {
	p5_lib_annotations(p);
    p.canvas_id = "vis:domain-col";

p.vertSrc = `
precision highp float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uBounds;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vComplexPos;

void main() {
  vComplexPos = uBounds.xy * aTexCoord + uBounds.zw * (vec2(1.0,1.0) - aTexCoord);
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
}
`;

p.vertRiemSrc = `
precision highp float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vComplexPos;

void main() {
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
  vComplexPos = aPosition.xz / (aPosition.y - 1.0);
}
`

p.fragDomCol = src_complex_base +
`
uniform float uT;
vec2 f(vec2 z){
	vec2 u = cpow(e, vec2(0.0, -uT/3.0));
	vec2 v = cpow(e, vec2(0.0, uT/3.0));
	float l = length(u) + length(v);
	u /= l; v /= l;
	return cmobius(z, u, -cconj(v), v, cconj(u));
	//return cmult(z, u);
}

void main() {
    vec2 image = f(vComplexPos);
    gl_FragColor = vec4(complexToColor(image).xyz, 1.0);
}
`;

	p.complex_func_to_shader_src = function(func_str){
		//TODO: Implement complex function parser, maybe using BNF
		return "";
	}

	p.preload = function(){
		p.dom_col_shader = p.createShader(p.vertSrc, p.fragDomCol);
		p.dom_col_riem_shader = p.createShader(p.vertRiemSrc, p.fragDomCol);
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.noStroke();

		p.lab_Re = p.createAnnotation(0,0,"Re");
		p.lab_Im = p.createAnnotation(0,0,"Im");

		p.preload();
    }

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.scale(1,-1,-1); // reorient into standard coordinates

		p.orbitControl();

		p.background(255,255,255,0);
		p.scale(p.height/2);

		p.dom_col_shader.setUniform("uBounds", [-2,-2, 2,2]);
		p.dom_col_shader.setUniform("uT", p.millis()/1000);
		p.shader(p.dom_col_shader);

		p.quad(-2,0,-2,
				2,0,-2,
				2,0, 2,
			   -2,0, 2);

		p.stroke(0);
		p.strokeWeight(1);
		p.line(-2,0,0,2,0,0);
		p.line(0,0,-2,0,0,2);
		p.noStroke();

		p.setAnnotationPos3(p.lab_Re, [2.1,0,0]);
		p.setAnnotationPos3(p.lab_Im, [0,0,2.1]);

		p.push();
			p.dom_col_riem_shader.setUniform("uT", p.millis()/1000);
			p.shader(p.dom_col_riem_shader);

			p.translate(0,0.5,0);
			p.sphere(0.5);
		p.pop();
    }
})

