let sketch_domain_col = new p5((p) => {
    p.canvas_id = "vis:domain-col";

	p5_lib_world_orientation_interaction(p);
	p5_lib_rotation_selection(p);
	p5_lib_controls(p);
	p5_lib_annotations(p);

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

varying vec3 vPos;
uniform mat3 uRot;

vec2 f(vec2 z){
	return z;
}

void main() {
	float x = vComplexPos.x;
	float y = vComplexPos.y;
	float den = 1. + x*x + y*y;
	vec3 posRiem = vec3(2.*x/den, -(den-2.)/den, 2.*y/den);
	posRiem = uRot * -posRiem;
	vec2 pos_complex = posRiem.xz/(1.-posRiem.y);

    vec2 image = f(pos_complex);
    gl_FragColor = vec4(complexToColor(image).xyz, 1.0);
}
`;

p.vertRiemSrc = `
precision highp float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uRot;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vComplexPos;
varying vec3 vPos;

void main() {
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
  vPos = uRot * aPosition;
}
`

p.fragDomColRiem = src_complex_base +
`
uniform float uT;

varying vec3 vPos;

vec2 f(vec2 z){
	return z;
}

void main() {
	vec3 vPosN = normalize(vPos);
	//vPosN = -vPosN;
    vec2 complex_pos = vPosN.xz / (1. - vPosN.y);
    vec2 image = f(complex_pos);
    gl_FragColor = vec4(complexToColor(image).xyz, 1.0);
}
`;

	p.complex_func_to_shader_src = function(func_str){
		//TODO: Implement complex function parser, maybe using BNF
		return "";
	}

	p.preload = function(){
		p.dom_col_shader = p.createShader(p.vertSrc, p.fragDomCol);
		p.dom_col_riem_shader = p.createShader(p.vertRiemSrc, p.fragDomColRiem);
		p.dom_col_shader.setUniform("uBounds", [-2,-2, 2,2]);
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.noStroke();

		p.setWorldRot(0.3,0.5);

		p.rot = mat3_id;

		p.lab_Re = p.createAnnotation(0,0,"Re");
		p.lab_Im = p.createAnnotation(0,0,"Im");

		p.preload();

		p.animate = false;
		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createButton("Reset to identity", ()=> {p.rot = mat3_id}, p.margin);
		p.createBr(p.margin);
		p.createButton("Start/Stop Animation", () => {p.animate = !p.animate}, p.margin);
		p.createP("Drag with mouse to rotate the sphere.", p.margin);
	}

	p.Animate = function(){
		p.rot = mm_prod(angleaxis_to_matrix([0,p.deltaTime / 2000,0]), p.rot, 3);
	}

	p.handleRotationSelectionInput = function(){
			p.v1_vec = p.screenToWorld(p.mouseX, p.mouseY, 0.8).sub(p.screenToWorld(p.mouseX, p.mouseY, 0.2));
			p.v1 = v_normalise([p.v1_vec.x, p.v1_vec.y, p.v1_vec.z]);
			if(p.v0 != undefined && p.mouseIsPressed && p.clickStartedInCanvas){
				p.v0xv1 = vv_cross(p.v0, p.v1);
				let rot_change = angleaxis_to_matrix(vs_prod(p.v0xv1,12));
				p.rot = mm_prod(p.rot, rot_change,3);
				p.points_updated = false;
			}
			p.v0 = [p.v1[0], p.v1[1], p.v1[2]];
	}


    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;
		if(p.animate)
			p.Animate();

		p.scale(1,-1,-1); // reorient into standard coordinates

		p.scale(0.48);
		p.scale(p.height/2);

		p.background(255,255,255,0);

		p.applyMatrix(p.world_transform.mat);

		p.handleRotationSelectionInput();

		p.dom_col_shader.setUniform("uRot",p.rot);
		p.dom_col_riem_shader.setUniform("uRot",p.rot);
		p.push();
		p.shader(p.dom_col_shader);

		p.quad(-2,0,-2,
				2,0,-2,
				2,0, 2,
			   -2,0, 2);
		p.pop();

		p.stroke(0);
		p.strokeWeight(1);
		p.line(-2,0,0,2,0,0);
		p.line(0,0,-2,0,0,2);
		p.noStroke();

		p.setAnnotationPos3(p.lab_Re, [2.1,0,0]);
		p.setAnnotationPos3(p.lab_Im, [0,0,2.8]);

		p.push();
			p.shader(p.dom_col_riem_shader);
			p.translate(0,0.5,0);
			p.sphere(0.5);
		p.pop();

		p.push();
			p.translate(0,0.5,0);
			p.applyMatrix(mat3_to_mat4(p.rot));
			p.stroke(0,0,0,70);
			p.strokeWeight(1);
			p.noFill();
			p.scale(1.05);
			p.sphere(0.5,24,12);
		p.pop();
    }

	p.mousePressed = function(){
        if(p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height)
			p.clickStartedInCanvas = true;
	}
})

