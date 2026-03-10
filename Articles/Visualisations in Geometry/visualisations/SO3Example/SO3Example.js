let sketch_SO3Example = new p5((p) => {
    p.canvas_id = "vis:SO3Example";

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

		p.antipode_shader = p.createShader(src_vert_anti, src_frag_anti);
		p.normal_shader = p.createShader(src_vert_normal, src_frag_normal);
		p.antipode_shader.setUniform("uScale", 1);

		p.sphere_geom = p.buildGeometry(() => p.createCheckerSphere(50,100,1));

		p.rot = angleaxis_to_matrix(v_normalise([0.5,1,0]), PI/2);

		p.noStroke();
		p.setWorldRot(-0.5,0.45);

		p.left = p.createFramebuffer({width: p.width/2, height: p.height});	
		p.right = p.createFramebuffer({width: p.width/2, height: p.height});	

		// create labels
		p.lab_left_title = p.createAnnotation(10,10, "\\( \\text{SO}(3) \\)");
		p.lab_left_x = p.createAnnotation(0, 0, "\\(x\\)");
		p.lab_left_y = p.createAnnotation(0, 0, "\\(y\\)");
		p.lab_left_z = p.createAnnotation(0, 0, "\\(z\\)");
		p.lab_left_thetau = p.createAnnotation(0, 0,"\\(\\theta \\mathbf{u}\\)", true);

		p.lab_right_title = p.createAnnotation(p.width/2+10, 10, "\\( \\theta \\mathbf{u} \\in \\text{SO}(3) \\) acting on \\( \\mathbb{R}^3 \\)");
		p.lab_right_x = p.createAnnotation(0, 0, "\\(x\\)");
		p.lab_right_y = p.createAnnotation(0, 0, "\\(y\\)");
		p.lab_right_z = p.createAnnotation(0, 0, "\\(z\\)");
		p.lab_right_u = p.createAnnotation(0, 0, "\\(\\mathbf{u}\\)");
		p.lab_right_theta = p.createAnnotation(0, 0, "\\(\\theta\\)");

		p.animate = false;
		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createButton("Reset \\(\\theta\\mathbf{u}\\) to identity", ()=> {p.rot = mat3_id}, p.margin);
		p.createBr(p.margin);
		p.createButton("Start/Stop Animation", () => {p.animate = !p.animate}, p.margin);
		p.createP("Drag with mouse on left hand side to rotate the view. Drag with mouse on the right hand side to change \\(\\theta \\mathbf{u}\\).", p.margin);

	}

	p.Animate = function(){
		p.rot = mm_prod(angleaxis_to_matrix([1,0,0],p.deltaTime / 2000), p.rot, 3);
	}

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		if(p.animate)
			p.Animate();

		p.clear();
		//p.rot = angleaxis_to_matrix(v_normalise([0.5,1,-0.1]), p.millis()/1000);
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

			// draw checkered sphere
			p.push();
				p.gl.enable(p.gl.CULL_FACE);
				p.gl.cullFace(p.gl.BACK); 
				p.scale(PI);
				p.shader(p.antipode_shader);
				p.model(p.sphere_geom);
				p.scale(-1);
				p.model(p.sphere_geom);
				p.gl.disable(p.gl.CULL_FACE);
			p.pop();

			// we will draw things inside sphere, so just overwrite it's depth information.
			p.clearDepth();

			// draw theta u
			p.stroke(0);
			p.strokeWeight(16);
			p.beginShape(p.POINTS);
				p.vertex(rotVector[0], rotVector[1], rotVector[2]);
			p.endShape();

			// set annotation positions
			p.setAnnotationPos3left(p.lab_left_x, [PI,0,0]);
			p.setAnnotationPos3left(p.lab_left_y, [0,-PI,0]);
			p.setAnnotationPos3left(p.lab_left_z, [0,0,-PI]);
			p.setAnnotationPos3left(p.lab_left_thetau, vv_add(rotVector, [0,-0.6,0]));

			// draw axes
			p.draw_axes(PI,4);
			// draw line through theta u
			p.strokeWeight(2);
			p.stroke(0);
			p.line(0, 0,0,rotAxis[0]*PI, rotAxis[1]*PI, rotAxis[2]*PI);
			// draw box with corners at theta u and 0
			p.noFill();
			p.stroke(0,0,0,100);
			p.translate(rotVector[0]/2, rotVector[1]/2, rotVector[2]/2);
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
			p.setAnnotationPos3right(p.lab_right_z, [0,0,-PI]);

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

