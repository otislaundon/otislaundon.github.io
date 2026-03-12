let sketch_SU2ConjActInteractive = new p5((p) => {
    p.canvas_id = "vis:SU2ConjActInteractive";

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

		p.rot = angleaxis_to_matrix([0,0,0]);
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
				inputs.position.xyz = Q_to_vec3(mat4_to_Q(Q_to_mat4(elemB) * Q_to_mat4(vec3_to_Q(inputs.position.xyz)) * inverse(Q_to_mat4(elemB))));
				return inputs;
			}`,
			'vec3 xyz_to_spherical': `(vec3 a){
				float r = length(a);
				return vec3(
					r,
					acos(a.z/r),
					sign(a.y) * acos(a.x/length(a.xy))
				);
			}`,
			'vec3 hsv2rgb': `( vec3 c ){
				vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
				rgb = c.z * mix(vec3(1.0), rgb, c.y);
				return rgb;
			}`,
			'Inputs getPixelInputs': `(Inputs inputs) {
				vec3 pos = vVertexPos;
				//pos.z=-pos.z;
				//pos.y=-pos.y;

				vec3 pos_spherical = xyz_to_spherical(pos);	
				float r = pos_spherical.x;

				vec2 screenPosRel = (inputs.position.xy - inputs.center.xy);
				float total = floor(screenPosRel.x / uCheckSize) + floor(screenPosRel.y / uCheckSize);
				float blend = (mod(total, 2.0) == 0.0) ? 0.0 : 1.0;

				float h = (1. + pos.x)*0.5;
				float s = 4. * r*(1.-r);
				float v = r;
				float dh = (1.+pos.z)/8.;
				float dv = r*(1.-r) * (pos.y+1.)/2.;
				vec3 col1 = hsv2rgb(vec3(fract(h + dh), s, v + dv));
				vec3 col2 = hsv2rgb(vec3(fract(h - dh), s, v - dv));

				vec3 col = mix(col1, col2, blend);

				inputs.color.xyz = col;
				inputs.color.a = 1.0;

				return inputs;
			}`
		});

		p.dotsShader.setUniform("uCheckSize", 6)
		p.normal_shader = p.createShader(src_vert_normal, src_frag_normal);

		p.points = [];
		let ppr = 200;
		let n_layers = 5
		for(let j = 0; j < n_layers; j+= 1){
			let psi = (j+0.5) * PI / (n_layers);
			for(let i = 0; i < ppr*Math.sin(psi)**2; i++){
				let Q_ijk = vs_prod(random_point_on_sphere(3),Math.sin(psi));
				p.points.push(Q_to_vec3([Math.cos(psi), Q_ijk[0], Q_ijk[1], Q_ijk[2]]));
			}
		}
			
		p.n_points = p.points.length;

		p.noStroke();
		p.setWorldRot(-0.5,0.45);

		p.left = p.createFramebuffer({width: p.width/2, height: p.height});	
		p.right = p.createFramebuffer({width: p.width/2, height: p.height});	

		// create labels
		p.lab_left_title = p.createAnnotation(10,10, "\\(C_\\tilde{b}: \\text{SU}(2) \\rightarrow \\text{SU}(2) \\)");
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
		p.multleftBLift([p.deltaTime/1000,0,0]);
		//p.rot = mm_prod(angleaxis_to_matrix([1,0,0],p.deltaTime / 2000), p.rot, 3);
	}

	p.multleftBLift = function(a){
		if(v_len(a) == 0)
			return;
		// turn small rotation into quaternion.
		let q = angleaxis_to_Q(a);
		// apply a to b
		p.rot = mm_prod(angleaxis_to_matrix(a), p.rot, 3);
		// apply this quaternion to tildeB.
		p.tildeB = mat4_to_Q(mm_prod(Q_to_mat4(q),Q_to_mat4(p.tildeB),4));
	}

	p.multrightBLift = function(a){
		if(v_len(a) == 0)
			return;
		// turn small rotation into quaternion.
		let q = angleaxis_to_Q(a);
		// apply a to b
		p.rot = mm_prod(p.rot, angleaxis_to_matrix(a), 3);
		// apply this quaternion to tildeB.
		p.tildeB = mat4_to_Q(mm_prod(Q_to_mat4(p.tildeB), Q_to_mat4(q), 4));
	}

	p.handleRotationSelectionInput = function(){
			p.v1_vec = p.screenToWorld(p.mouseX, p.height-p.mouseY, 0.8).sub(p.screenToWorld(p.mouseX, p.height-p.mouseY, 0.2));
			p.v1 = v_normalise([p.v1_vec.x, p.v1_vec.y, p.v1_vec.z]);
			if(p.v0 != undefined && p.mouseIsPressed && p.clickStartedOnRight){
				p.v0xv1 = vv_cross(p.v0, p.v1);
				let rot_change = angleaxis_to_matrix(vs_prod(p.v0xv1,12));
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
		p.line(0,-p.height/2,0,p.height/2); // Vertical centerline
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
			p.strokeWeight(10);
			p.stroke(0,0,0,100);
			p.push();
			p.strokeShader(p.dotsShader);
			p.draw_points(p.points);
			p.pop();

			// draw tildeB
			p.stroke(255,0,0);
			p.strokeWeight(16);
			p.beginShape(p.POINTS);
				p.vertex(tildeBVec[0], tildeBVec[1], tildeBVec[2]);
			p.endShape();
			p.setAnnotationPos3left(p.lab_left_tb, tildeBVec, [0,2]);

			// set annotation positions
			p.setAnnotationPos3left(p.lab_left_x, [PI,0,0]);
			p.setAnnotationPos3left(p.lab_left_y, [0,-PI,0]);
			p.setAnnotationPos3left(p.lab_left_z, [0,0,PI]);

			// draw axes
			p.clearDepth();
			p.draw_axes(PI,2);

			p.push();
			p.scale(0.5);
			p.draw_outline_ball(PI);
			p.setAnnotationPos3left(p.lab_left_b, rotVector, [0,-25]);
			// draw theta u
			p.stroke(0,0,255);
			p.strokeWeight(16);
			p.beginShape(p.POINTS);
				p.vertex(rotVector[0], rotVector[1], rotVector[2]);
			p.endShape();

			p.pop();
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

