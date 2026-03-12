let sketch_spinDoubleDomCol = new p5((p) => {
    p.canvas_id = "vis:spinDoubleDomCol";

	p5_lib_world_orientation_interaction(p);
	p5_lib_rotation_selection(p);
	p5_lib_annotations(p);
	p5_lib_axes(p);
	p5_lib_checker_sphere_mesh(p);
	p5_lib_so3_core(p);
	p5_lib_controls(p);

p.src_vert_anti = `
precision highp float;
uniform mat4 uModelViewMatrix ;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;

varying vec3 vVertexPos;

void main() {
  vVertexPos = aPosition;
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
}
`;

p.src_vert_checkso3_world = `
precision highp float;
uniform mat3 uRotMat;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
attribute vec3 aPosition;
varying vec3 vVertexPos;

void main() {
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
  vVertexPos = uRotMat * (aPosition.xyz - vec3(0.5,0.5,0.0))*2.0;
}
`;

p.src_frag_checkso3_world = `
precision highp float;
uniform float uBrightnessExtra;
uniform float uCheckSize;
uniform vec3 uBVec;
varying vec3 vVertexPos;

`+SO3_shader_funcs+SU2_shader_funcs+`

vec3 dir_to_col(vec3 dir){
	return vec3(dir * 0.5 + 0.5)*length(dir);
}

vec3 xyz_to_spherical(vec3 a){
	float r = length(a);
	return vec3(
		r,
		acos(a.z/r),
		sign(a.y) * acos(a.x/length(a.xy))
	);
}

void main() {
	//vec3 pos = mat3_to_angleaxis(QSpinor( mat4_to_Q(Q_to_mat4(vec3_to_Q(uBVec)) * Q_to_mat4(vec3_to_Q(vVertexPos*3.14159)))))/3.14159;
	
	vec4 moved_pos = mat4_to_Q(Q_to_mat4(vec3_to_Q(uBVec)) * Q_to_mat4(vec3_to_Q(vVertexPos * 3.141593)));
	vec3 pos = mat3_to_angleaxis(QSpinor(moved_pos))/3.14159;

	vec3 pos_spherical = xyz_to_spherical(pos)/3.141592;	
	//vec3 pos_spherical = vVertexPos;

	vec3 col1 = dir_to_col(pos);
	float r = length(pos);
	vec3 col2 = mix(col1, dir_to_col(-pos), r);

	float total = floor(pos_spherical.x * uCheckSize+0.0) + 
                  floor(pos_spherical.y * uCheckSize+0.5) + 
                  floor(pos_spherical.z * uCheckSize+0.5);

	float blend = (mod(total, 2.0) == 0.0) ? 0.0 : 1.0;

	vec3 col = mix(col1, col2, blend);

	gl_FragColor = vec4(col*(1.-uBrightnessExtra) + vec3(uBrightnessExtra), 1.0);
	//gl_FragColor = vec4(dir_to_col(pos/3.141593), 1.0);
}
`;

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.rot = angleaxis_to_matrix([0,0,0]);

		p.inner_shader = p.createShader(p.src_vert_checkso3_world, p.src_frag_checkso3_world);
		p.inner_shader.setUniform("uCheckSize", 21);
		p.inner_shader.setUniform("uBrightnessExtra", 0);

		p.rot_yz_90 = rot3_yz(HALF_PI);
		p.rot_xz_90 = rot3_xz(HALF_PI);
	
		p.noStroke();
		p.setWorldRot(-0.5,0.45);

		// create labels
		p.lab_left_x = p.createAnnotation(0, 0, "\\(x\\)", true);
		p.lab_left_y = p.createAnnotation(0, 0, "\\(y\\)", true);
		p.lab_left_z = p.createAnnotation(0, 0, "\\(z\\)", true);

		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createP("Drag with mouse to rotate the view.", p.margin);
	}

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.clear();

		let rotVector = matrix_to_angleaxis(p.rot);
		let theta = v_len(rotVector);
		let rotAxis = v_normalise(rotVector);

		p.strokeWeight(2);
		p.stroke(50);
		p.noStroke();

		p.inner_shader.setUniform("uBVec", rotVector);

		p.clear();
		p.applyMatrix(p.world_transform.mat);
		p.scale(50);

		p.push();
			p.scale(PI);
			p.shader(p.inner_shader);
			p.inner_shader.setUniform("uRotMat", mat3_id);
			p.ellipse(0,0,2,2,50);
			p.push();
			p.rotateX(-HALF_PI);
			p.inner_shader.setUniform("uRotMat", p.rot_yz_90);
			p.ellipse(0,0,2,2,50);
			p.pop();
			p.rotateY(HALF_PI);
			p.inner_shader.setUniform("uRotMat", p.rot_xz_90);
			p.ellipse(0,0,2,2,50);
		p.pop();

		// set annotation positions
		p.setAnnotationPos3(p.lab_left_x, [3.4,0,0]);
		p.setAnnotationPos3(p.lab_left_y, [0,-3.8,0]);
		p.setAnnotationPos3(p.lab_left_z, [0,0,3.8]);

		// draw axes
		p.clearDepth();
		p.draw_axes(PI,2);
    }

	p.mousePressed = function(){
		p.interactOnPressed();
	}
	p.mouseDragged = function(){
		if(!p.clickStartedOnRight)
			p.interactOnDragged();
	}

})

