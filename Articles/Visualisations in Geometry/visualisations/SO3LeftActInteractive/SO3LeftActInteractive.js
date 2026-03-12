let sketch_SO3LeftActInteractive = new p5((p) => {
    p.canvas_id = "vis:SO3LeftActInteractive";

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

		p.rot = angleaxis_to_matrix([0,0.001,0]);

		p.dotsShader = p.baseStrokeShader().modify(SO3_shader_hooks).modify({
			uniforms: {
				'float uCheckSize': 6,
				'vec3 rot_element': () => matrix_to_angleaxis(p.rot),
			},
			varyingVariables: ['vec3 vVertexPos'],
			'void afterVertex': `(){
				vVertexPos = aPosition.xyz/3.1415927;
			} `,
			'StrokeVertex getObjectInputs': `(StrokeVertex inputs){
				inputs.position.xyz = mat3_to_angleaxis(angleaxis_to_mat3(rot_element) * angleaxis_to_mat3(inputs.position.xyz));
				return inputs;
			}`,
			'vec3 dir_to_col': `(vec3 dir){
				dir = vec3(dir.x, dir.y, -dir.z);
				return vec3(dir * 0.5 + 0.5);
			}`,
			'Inputs getPixelInputs': `(Inputs inputs) {
				vec3 col1 = dir_to_col(vVertexPos);
				float r = length(vVertexPos);
				vec3 col2 = mix(col1, dir_to_col(-vVertexPos), r);
				vec2 screenPosRel = (inputs.position.xy - inputs.center.xy);
				float total = floor(screenPosRel.x / uCheckSize) + floor(screenPosRel.y / uCheckSize);
				float blend = (mod(total, 2.0) == 0.0) ? 0.0 : 1.0;

				inputs.color.xyz = r * mix(col1, col2, blend);
				inputs.color.a = 1.0;
				return inputs;
			}`
		});

		p.dotsShader.setUniform("uCheckSize", 6)
		p.normal_shader = p.createShader(src_vert_normal, src_frag_normal);
		p.sphere_geom = p.buildGeometry(() => p.createCheckerSphere(50,100,1));

		//p.initialiseSO3PointsRandom(1000);
		p.points = [];
		let ppr = 40;
		for(let r = 0; r <= PI; r+= PI/4)
			for(let i = 0; i < ppr*r*r; i++)
				p.points.push(vs_prod(random_point_on_sphere(),r*0.999));
		p.n_points = p.points.length;

		//p.points = p.points.map(p => vs_prod(v_normalise(p), Math.floor(Math.random() * 4 + 1)/4 * PI*0.999));

		p.noStroke();
		p.setWorldRot(-0.5,0.45);

		p.left = p.createFramebuffer({width: p.width/2, height: p.height});	
		p.right = p.createFramebuffer({width: p.width/2, height: p.height});	

		// create labels
		p.lab_left_title = p.createAnnotation(10,10, "\\(L_b: \\text{SO}(3) \\rightarrow \\text{SO}(3) \\)");
		p.lab_left_x = p.createAnnotation(0, 0, "\\(x\\)", true);
		p.lab_left_y = p.createAnnotation(0, 0, "\\(y\\)", true);
		p.lab_left_z = p.createAnnotation(0, 0, "\\(z\\)", true);
		p.lab_left_b = p.createAnnotation(0, 0,"\\(b\\)",true);

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
		p.createButton("Reset b to identity", ()=> {p.rot = mat3_id}, p.margin);
		p.createBr(p.margin);
		p.createButton("Start/Stop Animation", () => {p.animate = !p.animate}, p.margin);
		p.createP("Drag with mouse on left hand side to rotate the view. Drag with mouse on the right hand side to change \\(b\\).", p.margin);
	}

	p.Animate = function(){
		p.rot = mm_prod(angleaxis_to_matrix([p.deltaTime / 2000,0,0]), p.rot, 3);
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

			// set annotation positions
			p.setAnnotationPos3left(p.lab_left_x, [PI,0,0]);
			p.setAnnotationPos3left(p.lab_left_y, [0,-PI,0]);
			p.setAnnotationPos3left(p.lab_left_z, [0,0,PI]);
			p.setAnnotationPos3left(p.lab_left_b, vv_add(rotVector, [0,-0.6,0]));

			// draw axes
			p.clearDepth();
			p.draw_axes(PI,2);
			// draw line through theta u
			p.strokeWeight(2);
			p.stroke(0);
			p.line(0, 0,0,rotAxis[0]*PI, rotAxis[1]*PI, rotAxis[2]*PI);
			// draw theta u
			p.stroke(0);
			p.strokeWeight(16);
			p.beginShape(p.POINTS);
				p.vertex(rotVector[0], rotVector[1], rotVector[2]);
			p.endShape();
			// draw box with corners at theta u and 0
			p.noFill();
			p.strokeWeight(2);
			p.stroke(0,0,0,100);
			p.translate(rotVector[0]/2, rotVector[1]/2, rotVector[2]/2);
			p.box(rotVector[0], rotVector[1], rotVector[2]);
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

