let sketch_SU2RightActInteractive = new p5((p) => {
    p.canvas_id = "vis:SU2RightActInteractive";

	//FINAl -------------------------
	//FINAl -------------------------
	//FINAl -------------------------
	//FINAl -------------------------
	//FINAl -------------------------

	p5_lib_world_orientation_interaction(p);
	p5_lib_rotation_selection(p);
	p5_lib_so3_core(p);
	p5_lib_annotations(p);
	p5_lib_axes(p);
	p5_lib_checker_sphere_mesh(p);
	p5_lib_controls(p);

	p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.rot = angleaxis_to_matrix(v_normalise([0,1,0]), 0.001);
		p.tildeB = vec3_to_Q(matrix_to_angleaxis(p.rot));

		p.dotsShader = p.baseStrokeShader().modify(SO3_shader_hooks).modify(SU2_shader_hooks).modify({
			uniforms: {
				'float uCheckSize': 6,
				'vec4 elemB': () => p.tildeB,
			},
			varyingVariables: ['vec3 vVertexPos'],
			'void afterVertex': `(){
				vVertexPos = aPosition.xyz/3.1415927;
			} `,
			'StrokeVertex getObjectInputs': `(StrokeVertex inputs){
				inputs.position.xyz = Q_to_vec3(mat4_to_Q(Q_to_mat4(vec3_to_Q(inputs.position.xyz)) * Q_to_mat4(elemB)));
				//inputs.position.xyz = mat3_to_angleaxis(angleaxis_to_mat3(inputs.position.xyz) * angleaxis_to_mat3(rot_element));
				return inputs;
			}`,
			'vec3 dir_to_col': `(vec3 dir){
				return vec3(dir * 0.5 + 0.5)*length(dir);
			}`,
			'vec3 tau4_left':`(vec4 a){
				return vec3(a.x, a.y, 0.);
			}`,
			'vec3 tau4_right': `(vec4 a){
				return vec3(a.z, a.w, (a.z+a.w)*0.5);
			}`,
			'vec4 f': `(vec4 a){
			return (a + vec4(1.))*0.5;
			}`,
			'Inputs getPixelInputs': `(Inputs inputs) {

				vec4 pos4 = f(vec3_to_Q(vVertexPos*3.141593));
				vec3 col1 = tau4_left(pos4);
				vec3 col2 = tau4_right(pos4);

				vec2 screenPosRel = (inputs.position.xy - inputs.center.xy);
				float total = floor(screenPosRel.x / uCheckSize) + floor(screenPosRel.y / uCheckSize);
				float blend = (mod(total, 2.0) == 0.0) ? 0.0 : 1.0;

				inputs.color.xyz = mix(col1, col2, blend);
				inputs.color.a = 1.0;
				return inputs;
			}`
		});

		p.dotsShader.setUniform("uCheckSize", 6)
		p.normal_shader = p.createShader(src_vert_normal, src_frag_normal);

		//p.initialiseSO3PointsRandom(1000);
		p.points = [];
		let ppr = 40;
		for(let r = 0; r <= PI; r+= PI/4)
			for(let i = 0; i < ppr*r*r; i++)
				p.points.push(Q_to_vec3(random_point_on_sphere(4)));
		p.n_points = p.points.length;

		p.noStroke();
		p.setWorldRot(-0.5,0.45);

		p.left = p.createFramebuffer({width: p.width/2, height: p.height});	
		p.right = p.createFramebuffer({width: p.width/2, height: p.height});	

		// create labels
		p.lab_left_title = p.createAnnotation(10,10, "\\(R_\\tilde{b}: \\text{SO}(3) \\rightarrow \\text{SO}(3) \\)");
		p.lab_left_x = p.createAnnotation(0, 0, "\\(x\\)", true);
		p.lab_left_y = p.createAnnotation(0, 0, "\\(y\\)", true);
		p.lab_left_z = p.createAnnotation(0, 0, "\\(z\\)", true);
		p.lab_left_b = p.createAnnotation(0, 0,"\\(b\\)",true);
		p.lab_left_tb = p.createAnnotation(0, 0,"\\(\\tilde{b}\\)",true);

		p.lab_right_title = p.createAnnotation(p.width/2+10, 10, "\\( b = \\theta \\mathbf{u} \\in \\text{SO}(3) \\) acting on \\( \\mathbb{R}^3 \\)");
		p.lab_right_x = p.createAnnotation(0, 0, "\\(x\\)");
		p.lab_right_y = p.createAnnotation(0, 0, "\\(y\\)");
		p.lab_right_z = p.createAnnotation(0, 0, "\\(z\\)");
		p.lab_right_u = p.createAnnotation(0, 0, "\\(\\mathbf{u}\\)");
		p.lab_right_theta = p.createAnnotation(0, 0, "\\(\\theta\\)");

		// create controls panel
		p.animate = false;
		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createButton("Reset b to identity", ()=> {p.rot = mat3_id; p.tildeB = [1,0,0,0];}, p.margin);
		p.createBr(p.margin);
		p.createButton("Start/Stop Animation", () => {p.animate = !p.animate}, p.margin);
		p.createP("Drag with mouse on left hand side to rotate the view. Drag with mouse on the right hand side to change \\(b\\).", p.margin);
	}

	p.Animate = function(){
		p.multleftBLift([p.deltaTime/2000,0,0]);
		//p.rot = mm_prod(angleaxis_to_matrix([1,0,0],p.deltaTime / 2000), p.rot, 3);
	}

	p.multleftBLift = function(a){
		// turn small rotation into quaternion.
		let q = angleaxis_to_Q(a);
		// apply a to b
		p.rot = mm_prod(angleaxis_to_matrix(v_normalise(a), v_len(a)), p.rot, 3);
		// apply this quaternion to tildeB.
		p.tildeB = mat4_to_Q(mm_prod(Q_to_mat4(q),Q_to_mat4(p.tildeB),4));
	}

	p.multrightBLift = function(a){
		// turn small rotation into quaternion.
		let q = angleaxis_to_Q(a);
		// apply a to b
		p.rot = mm_prod(p.rot,angleaxis_to_matrix(v_normalise(a), v_len(a)), 3);
		// apply this quaternion to tildeB.
		p.tildeB = mat4_to_Q(mm_prod(Q_to_mat4(p.tildeB),Q_to_mat4(q),4));
	}


	p.handleRotationSelectionInput = function(){
			p.v1_vec = p.screenToWorld(p.mouseX, p.height-p.mouseY, 0.8).sub(p.screenToWorld(p.mouseX, p.height-p.mouseY, 0.2));
			p.v1 = v_normalise([p.v1_vec.x, p.v1_vec.y, p.v1_vec.z]);
			if(p.v0 != undefined && p.mouseIsPressed && p.clickStartedOnRight){
				p.v1xv0 = vv_cross(p.v1, p.v0);
				let rot_mag = v_len(p.v1xv0) * 12;
				let rot_change = angleaxis_to_matrix(v_normalise(p.v1xv0),rot_mag);
				//p.rot = mm_prod(p.rot, rot_change,3);
				p.multrightBLift(matrix_to_angleaxis(rot_change));
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

		p.clear();
		let rotVector = matrix_to_angleaxis(p.rot);
		let theta = v_len(rotVector);
		let rotAxis = v_normalise(rotVector);

		let tildeBVec = Q_to_vec3(p.tildeB);

		p.strokeWeight(2);
		p.stroke(50);
		p.line(0, -p.height/2,0,p.height/2); // Vertical centerline
		p.noStroke();

		// begin left framebuffer
		p.left.begin();
			p.clear();
			p.applyMatrix(p.world_transform.mat);
			p.scale(50);
			p.lights();

			// DRAW OUTLINE SPHERE HERE
			p.draw_outline_ball(PI);

			// we will draw things inside sphere, so just overwrite it's depth information.
			p.clearDepth();

			// draw points with action applied to them
			p.strokeWeight(12);
			p.stroke(0,0,0,100);
			p.push();
			p.strokeShader(p.dotsShader);
			p.draw_points(p.points);
			p.pop();

			// draw tildeB
			p.stroke(0);
			p.strokeWeight(16);
			p.beginShape(p.POINTS);
				p.vertex(tildeBVec[0], tildeBVec[1], rotVector[2]);
			p.endShape();

			// set annotation positions
			p.setAnnotationPos3left(p.lab_left_x, [PI,0,0]);
			p.setAnnotationPos3left(p.lab_left_y, [0,-PI,0]);
			p.setAnnotationPos3left(p.lab_left_z, [0,0,-PI]);
			p.setAnnotationPos3left(p.lab_left_tb, vv_add(tildeBVec, [0,-0.6,0]));

			// draw axes
			p.clearDepth();
			p.draw_axes(PI,2);

			p.scale(-0.5);
			p.setAnnotationPos3left(p.lab_left_b, vv_add(rotVector, [0,-0.6,0]));
			// draw theta u
			p.stroke(0);
			p.strokeWeight(16);
			p.beginShape(p.POINTS);
				p.vertex(rotVector[0], rotVector[1], rotVector[2]);
			p.endShape();
		p.left.end();

		// begin right framebuffer
		p.right.begin();
			p.clear();
			p.applyMatrix(p.world_transform.mat);
			p.scale(50);

			p.draw_axes(PI,2);

			// set axis annotation positions
			p.setAnnotationPos3right(p.lab_right_x, [PI,0,0]);
			p.setAnnotationPos3right(p.lab_right_y, [0,-PI,0]);
			p.setAnnotationPos3right(p.lab_right_z, [0,0,-PI]);

			//p.handleRotationSelectionInput();
			
			p.draw_angle_axis_markers(rotAxis, theta, p.lab_right_u, p.lab_right_theta);
			
			p.applyMatrix(mat3_to_mat4(p.rot));

			// draw cube with rotation theta u
			p.lights();
			p.noStroke();
			p.fill(255);
			p.shader(p.normal_shader);
			p.box(2);
			console.log(p.rot);
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


// SU(2) -------------------------------------------------------------------
// SU(2) -------------------------------------------------------------------
// SU(2) -------------------------------------------------------------------
// SU(2) -------------------------------------------------------------------
// SU(2) -------------------------------------------------------------------

	/*
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

vec4 hsv2rgb_smooth( vec4 c ){
	vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
	rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing	
	rgb = c.z * mix(vec3(1.0), rgb, c.y);
	return vec4(rgb, c.w);
}
vec3 hsl2rgb( vec3 c )
{
    vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0 );
    return c.z + c.y * (rgb-0.5)*(1.0-abs(2.0*c.z-1.0));
}

vec3 kappa(vec3 a){
	return vec3(a * 0.5 + 0.5);
}

vec3 rho(vec3 a){
	return hsl2rgb(vec3(
		atan(-a.y, a.x)/6.2832,
		length(a.xy),
		length(a)));
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
	
	//vec4 moved_pos = mat4_to_Q(Q_to_mat4(vec3_to_Q(uBVec)) * Q_to_mat4(vec3_to_Q(vVertexPos * 3.141593)));
	//vec3 pos = mat3_to_angleaxis(QSpinor(moved_pos))/3.14159;

	vec3 pos = vVertexPos;
	vec3 pos_spherical = xyz_to_spherical(pos);	
	float r = length(pos);

	float total = floor(pos_spherical.x * uCheckSize+0.0) + 
                  floor(pos_spherical.y * uCheckSize+0.5) + 
                  floor(pos_spherical.z * uCheckSize+0.5);

	float blend = (mod(total, 2.0) == 0.0) ? 0.0 : 1.0;

	vec3 col = mix(kappa(pos), r * kappa(-pos) + (1.-r)*kappa(pos), blend);

	float blend_edge = pow((2.*r - 1.),2.);

	col = mix(col, vec3(r), blend_edge);

	gl_FragColor = vec4(col, 1.0);
}
`;

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.rot = angleaxis_to_matrix(v_normalise([0.5,1,0]), PI/2);

		p.inner_shader = p.createShader(p.src_vert_checkso3_world, p.src_frag_checkso3_world);
		p.inner_shader.setUniform("uCheckSize", 15);
		p.inner_shader.setUniform("uBrightnessExtra", 0);

		p.normal_shader = p.createShader(src_vert_normal, src_frag_normal);
		p.rot_yz_90 = rot3_yz(HALF_PI);
		p.rot_xz_90 = rot3_xz(HALF_PI);
	
		p.sphere_geom = p.buildGeometry(() => p.createSpherePartial(24,100));

		p.noStroke();
		p.setWorldRot(-0.5,0.45);

		p.left = p.createFramebuffer({width: p.width/2, height: p.height});	
		p.right = p.createFramebuffer({width: p.width/2, height: p.height});	

		// create labels
		p.lab_left_title = p.createAnnotation(10,10, "Double domain colouring for \\(L_b \\)");
		p.lab_left_x = p.createAnnotation(0, 0, "\\(x\\)");
		p.lab_left_y = p.createAnnotation(0, 0, "\\(y\\)");
		p.lab_left_z = p.createAnnotation(0, 0, "\\(z\\)");

		p.lab_right_title = p.createAnnotation(p.width/2+10, 10, "\\(b = \\theta \\mathbf{u} \\in \\text{SO}(3) \\) acting on \\( \\mathbb{R}^3 \\)");
		p.lab_right_x = p.createAnnotation(0, 0, "\\(x\\)");
		p.lab_right_y = p.createAnnotation(0, 0, "\\(y\\)");
		p.lab_right_z = p.createAnnotation(0, 0, "\\(z\\)");

		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createButton("Reset b to identity", ()=> {p.rot = mat3_id}, p.margin);
		p.createBr(p.margin);
		p.createP("Drag with mouse on left hand side to rotate the view. Drag with mouse on the right hand side to change \\(b\\).", p.margin);
	}

	p.createSpherePartial = function(resx, resy){
		p.beginShape(p.QUADS);
		for(let i = 0; i < resx; i++)
		for(let j = 0; j < resy; j++)
		{
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

		// begin left framebuffer
		p.left.begin();
			p.clear();
			p.applyMatrix(p.world_transform.mat);
			p.scale(50);

			p.handleRotationSelectionInput();

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
			p.setAnnotationPos3left(p.lab_left_x, [3.4,0,0]);
			p.setAnnotationPos3left(p.lab_left_y, [0,-3.8,0]);
			p.setAnnotationPos3left(p.lab_left_z, [0,0,-PI]);

			// draw axes
			p.clearDepth();
			p.draw_axes(PI,2);
			
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
			p.setAnnotationPos3right(p.lab_right_z, [0,0,-PI]);

			p.handleRotationSelectionInput();
			
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
*/

})

