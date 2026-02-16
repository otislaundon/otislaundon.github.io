let sketch_domain_col = new p5((p) => {
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
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.noStroke();
    }

    p.draw = function(){
		p.background(255,0,0);
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.background(255,255,255,0);
		p.orbitControl();
		p.scale(p.height/2);

		p.push()
			p.dom_col_shader.setUniform("uBounds", [-3,-2, 3,2]);
			p.dom_col_shader.setUniform("uT", p.millis()/1000);
			p.shader(p.dom_col_shader);

			p.quad(-1,0,-1,
					1,0,-1,
					1,0, 1,
				   -1,0, 1);
		p.pop();

		p.push();
			p.translate(0,-0.2,0);
			p.sphere(0.2);
		p.pop();
    }
})

