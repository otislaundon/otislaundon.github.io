let sketch_SO3LeftActDomcolInteractive = new p5((p) => {
    p.canvas_id = "vis:SO3LeftActDomcolInteractive";

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

uniform float uScale;

varying vec3 vVertexPos;

void main() {
  vVertexPos = aPosition*uScale;
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
}
`;

p.src_frag_anti = `
precision highp float;
uniform vec3 uRotVector;
uniform float uScale;
varying vec3 vVertexPos;

`+SO3_shader_funcs+`

vec3 dir_to_col(vec3 dir){
	dir = vec3(dir.x, dir.y, -dir.z);
	return vec3(dir * 0.5 + 0.5);
}

void main() {
	vec3 pos = mat3_to_angleaxis(angleaxis_to_mat3(uRotVector) * angleaxis_to_mat3(uScale*vVertexPos*3.14159))/3.14159*uScale;
	float r = length(pos);
	gl_FragColor = vec4(r*dir_to_col(pos)*0.85 + vec3(0.15), 1.0);
}
`;

p.src_vert_checkso3_world = `
precision highp float;
uniform mat3 uRotMat;
uniform mat4 uModelViewMatrix ;
uniform mat4 uProjectionMatrix;
attribute vec3 aPosition;
varying vec3 vVertexPos;
varying vec3 vWorldPos;

void main() {
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
  vVertexPos =  uRotMat * (aPosition.xyz - vec3(0.5,0.5,0.0))*2.0;
  vWorldPos = aPosition.xyz;
}
`;

p.src_frag_checkso3_world = `
precision highp float;
uniform float uCheckSize;
uniform vec3 uRotVector;
varying vec3 vVertexPos;
varying vec3 vWorldPos;

`+SO3_shader_funcs+`

vec3 dir_to_col(vec3 dir){
	dir = vec3(dir.x, dir.y, -dir.z);
	return vec3(dir * 0.5 + 0.5);
}

void main() {
	vec3 pos = mat3_to_angleaxis(angleaxis_to_mat3(uRotVector) * angleaxis_to_mat3(vVertexPos*3.14159))/3.14159;
	vec3 col1 = dir_to_col(pos);
	float r = length(pos);
	vec3 col2 = mix(col1, dir_to_col(-pos), r);

	float total = floor(vWorldPos.x * uCheckSize) + floor(vWorldPos.y*uCheckSize) + floor(vWorldPos.z*uCheckSize);
	float blend = (mod(total, 2.0) == 0.0) ? 0.0 : 1.0;

	vec3 col = r*mix(col1, col2, blend);

	gl_FragColor = vec4(col*1.0 + vec3(0.0), 1.0);
}
`;

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.rot = angleaxis_to_matrix([0.5,1,0]);

		p.antipode_shader = p.createShader(p.src_vert_anti, p.src_frag_anti);
		p.check_shader = p.createShader(p.src_vert_checkso3_world, p.src_frag_checkso3_world);
		p.check_shader.setUniform("uCheckSize", 20);

		p.normal_shader = p.createShader(src_vert_normal, src_frag_normal);
		p.rot_yz_90 = rot3_yz(HALF_PI);
		p.rot_xz_90 = rot3_xz(HALF_PI);
	
		p.sphere_geom_partialA = p.buildGeometry(() => p.createCheckerSpherePartial(24,100,0));
		p.sphere_geom_partialB = p.buildGeometry(() => p.createCheckerSpherePartial(24,100,1));

		p.noStroke();
		p.setWorldRot(-0.5,0.45);

		p.left = p.createFramebuffer({width: p.width/2, height: p.height});	
		p.right = p.createFramebuffer({width: p.width/2, height: p.height});	

		// create labels
		p.lab_left_title = p.createAnnotation(10,10, "Double domain colouring for \\(L_b \\)");
		p.lab_left_x = p.createAnnotation(0, 0, "\\(x\\)");
		p.lab_left_y = p.createAnnotation(0, 0, "\\(y\\)");
		p.lab_left_z = p.createAnnotation(0, 0, "\\(z\\)");
		p.lab_left_b = p.createAnnotation(0, 0,"\\(b\\)", true);
		p.lab_left_binv = p.createAnnotation(0, 0,"\\(b^{-1}\\)", true);

		p.lab_right_title = p.createAnnotation(p.width/2+10, 10, "\\(b = \\theta \\mathbf{u} \\in \\text{SO}(3) \\) acting on \\( \\mathbb{R}^3 \\)");
		p.lab_right_x = p.createAnnotation(0, 0, "\\(x\\)");
		p.lab_right_y = p.createAnnotation(0, 0, "\\(y\\)");
		p.lab_right_z = p.createAnnotation(0, 0, "\\(z\\)");
		p.lab_right_u = p.createAnnotation(0, 0, "\\(\\mathbf{u}\\)");
		p.lab_right_theta = p.createAnnotation(0, 0, "\\(\\theta\\)");

		// create controls panel
		p.animate = false;
		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createButton("Reset b to identity", ()=> {p.rot = mat3_id}, p.margin);
		p.createBr(p.margin);
		p.createButton("Start/Stop Animation", () => {p.animate = !p.animate}, p.margin);
		p.createP("Drag with mouse on left hand side to rotate the view. Drag with mouse on the right hand side to change \\(b\\).", p.margin);
	}

	p.Animate = function(){
		p.rot = mm_prod(angleaxis_to_matrix([p.deltaTime / 2000,p.deltaTime / 2000,p.deltaTime / 2000]), p.rot, 3);
	}

	p.createCheckerSpherePartial = function(resx, resy, flip){
		p.beginShape(p.QUADS);
		for(let i = 0; i < resx; i++)
		for(let k = 0; k < resy/2; k++)
		{
			let j = 2*k + (i+k+flip)%2;
			if(i < resx/2 && j >= resy*3/4)
				continue;
			let a = spherical_coords(PI*i/resx,     TWOPI*j/resy);
			let b = spherical_coords(PI*(i+1)/resx, TWOPI*j/resy);
			let c = spherical_coords(PI*i/resx,     TWOPI*(j+1)/resy);
			let d = spherical_coords(PI*(i+1)/resx, TWOPI*(j+1)/resy);
			p.vertex(a[0],a[1],a[2]);
			p.vertex(b[0],b[1],b[2]);
			p.vertex(d[0],d[1],d[2]);
			p.vertex(c[0],c[1],c[2]);
		}
		p.endShape();
	}

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		if(p.animate)
			p.Animate();

		p.clear();
		let rotVector = matrix_to_angleaxis(p.rot);
		let theta = v_len(rotVector);
		let rotAxis = v_normalise(rotVector);

		p.strokeWeight(2);
		p.stroke(50);
		p.line(0, -p.height/2,0,p.height/2); // Vertical centerline
		p.noStroke();

		p.antipode_shader.setUniform("uRotVector", rotVector);
		p.check_shader.setUniform("uRotVector", rotVector);

		// begin left framebuffer
		p.left.begin();
			p.clear();
			p.applyMatrix(p.world_transform.mat);
			p.scale(50);

			p.handleRotationSelectionInput();

			// draw checkered sphere
			p.push();
				p.shader(p.antipode_shader);
				p.scale(PI);
				p.antipode_shader.setUniform("uScale", 1);
				p.model(p.sphere_geom_partialA);
				p.antipode_shader.setUniform("uScale", -1);
				p.model(p.sphere_geom_partialB);

				p.shader(p.check_shader);
				p.check_shader.setUniform("uRotMat", mat3_id);
				p.ellipse(0,0,2,2,50);
				p.push();
				p.rotateX(-HALF_PI);
				p.check_shader.setUniform("uRotMat", p.rot_yz_90);
				p.ellipse(0,0,2,2,50);
				p.pop();
				p.rotateY(HALF_PI);
				p.check_shader.setUniform("uRotMat", p.rot_xz_90);
				p.ellipse(0,0,2,2,50);
			p.pop();

			// set annotation positions
			p.setAnnotationPos3left(p.lab_left_x, [3.4,0,0]);
			p.setAnnotationPos3left(p.lab_left_y, [0,-3.8,0]);
			p.setAnnotationPos3left(p.lab_left_z, [0,0,PI]);
			p.setAnnotationPos3left(p.lab_left_b, rotVector);
			p.setAnnotationPos3left(p.lab_left_binv, vs_prod(rotVector,-1));

			// draw axes
			p.clearDepth();
			p.draw_axes(PI,2);
			// draw line through theta u
			p.strokeWeight(2);
			p.stroke(0);
			p.line(-rotAxis[0]*PI, -rotAxis[1]*PI, -rotAxis[2]*PI, rotAxis[0]*PI, rotAxis[1]*PI, rotAxis[2]*PI);
			// draw theta u
			p.stroke(0);
			p.strokeWeight(16);
			p.beginShape(p.POINTS);
				p.vertex(rotVector[0], rotVector[1], rotVector[2]);
				p.vertex(-rotVector[0], -rotVector[1], -rotVector[2]);
			p.endShape();
			// draw box with corners at theta u and 0
			p.noFill();
			p.strokeWeight(2);
			p.stroke(0,0,0,100);
			
			p.translate(rotVector[0]/2, rotVector[1]/2, rotVector[2]/2);
			p.box(rotVector[0], rotVector[1], rotVector[2]);
			p.translate(-rotVector[0], -rotVector[1], -rotVector[2]);
			p.box(rotVector[0], rotVector[1], rotVector[2]);

		p.left.end();

		// begin right framebuffer
		p.right.begin();
			p.clear();
			p.applyMatrix(p.world_transform.mat);
			p.scale(50);

			p.strokeWeight(4);
			p.draw_axes(PI);

			// set axis annotation positions
			p.setAnnotationPos3right(p.lab_right_x, [PI,0,0]);
			p.setAnnotationPos3right(p.lab_right_y, [0,-PI,0]);
			p.setAnnotationPos3right(p.lab_right_z, [0,0,PI]);

			p.handleRotationSelectionInput();
			
			p.draw_angle_axis_markers(rotAxis, theta, p.lab_right_u, p.lab_right_theta);
			
			p.applyMatrix(mat3_to_mat4(p.rot));

			// draw cube with rotation theta u
			p.lights();
			p.noStroke();
			p.fill(255);
			p.shader(p.normal_shader);
			p.box(2);
		p.right.end();
		
		// draw frame buffers to screen
		p.image(p.left, -p.width/2, -p.height/2);
		p.image(p.right, 0, -p.height/2);
    }

	p.mousePressed = function(){
        if(p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height){
			p.clickStartedInCanvas = true;
			p.clickStartedOnRight = (p.mouseX > p.width/2);
		}
		else{
			p.clickStartedOnRight = false; 
			p.clickStartedInCanvas = false;
		}

		p.interactOnPressed();
	}
	p.mouseDragged = function(){
		if(!p.clickStartedOnRight)
			p.interactOnDragged();
	}
})

