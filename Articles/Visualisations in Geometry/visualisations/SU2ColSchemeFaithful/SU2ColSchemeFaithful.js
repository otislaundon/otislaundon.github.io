let sketch_SU2ColSchemeFaithful = new p5((p) => {
    p.canvas_id = "vis:SU2ColSchemeFaithful";

	p5_lib_world_orientation_interaction(p);
	p5_lib_rotation_selection(p);
	p5_lib_annotations(p);
	p5_lib_axes(p);
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

vec3 xyz_to_spherical(vec3 a){
	float r = length(a);
	return vec3(
		r,
		acos(a.z/r),
		sign(a.y) * acos(a.x/length(a.xy))
	);
}

vec3 hsv2rgb( vec3 c ){
	vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
	rgb = c.z * mix(vec3(1.0), rgb, c.y);
	return rgb;
}

void main() {

	vec3 pos = vVertexPos;
	pos.y=-pos.y;


	vec3 pos_spherical = xyz_to_spherical(pos);	
	float r = pos_spherical.x;

	float total = floor(pos_spherical.x * uCheckSize+0.0) + 
                  floor(pos_spherical.y * uCheckSize+0.5) + 
                  floor(pos_spherical.z * uCheckSize+0.5);
	float blend = (mod(total, 2.0) == 0.0) ? 0.0 : 1.0;

	vec4 pos4 = vec3_to_Q(pos * 3.141593);

	float h = (pos4.y + 1.)*0.25;
	float s = (pos4.z + 1.)*0.5*(1.-pow((1.-pos4.x)/2., 4.));
	float v = (1.-pos4.x)*0.5;
	vec3 hsv = vec3(h,s,v);
	vec3 dhsv = vec3((pos4.w+1.)/9., 0., 0.);

	vec3 col1 = hsv2rgb(fract(hsv + dhsv));
	vec3 col2 = hsv2rgb(fract(hsv - dhsv));

	vec3 col = mix(col1, col2, blend);

	gl_FragColor = vec4(col, 1.0);
}
`;

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.rot = angleaxis_to_matrix([0.5,1,0]);

		p.inner_shader = p.createShader(p.src_vert_checkso3_world, p.src_frag_checkso3_world);
		p.inner_shader.setUniform("uCheckSize", 15);
		p.inner_shader.setUniform("uBrightnessExtra", 0);

		p.rot_yz_90 = rot3_yz(HALF_PI);
		p.rot_xz_90 = rot3_xz(HALF_PI);
	
		p.noStroke();
		p.setWorldRot(-0.5,0.45);

		// create labels
		p.lab_left_x = p.createAnnotation(0, 0, "\\(x\\)");
		p.lab_left_y = p.createAnnotation(0, 0, "\\(y\\)");
		p.lab_left_z = p.createAnnotation(0, 0, "\\(z\\)");

		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createP("Drag with mouse to rotate the view.", p.margin);
	}

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.clear();
		//p.rot = angleaxis_to_matrix(v_normalise([0.5,1,-0.1]), p.millis()/1000);
		let rotVector = matrix_to_angleaxis(p.rot);
		let theta = v_len(rotVector);
		let rotAxis = v_normalise(rotVector);

		p.strokeWeight(2);
		p.stroke(50);
		p.line(0, -p.height/2,0,p.height/2); // Vertical centerline
		p.noStroke();

		p.inner_shader.setUniform("uBVec", rotVector);

		p.clear();
		p.applyMatrix(p.world_transform.mat);
		p.scale(50);

		// draw checkered sphere
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
		p.setAnnotationPos3(p.lab_left_z, [0,0,PI]);

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

