let sketch_doubleColourSchemeBall = new p5((p) => {
    p.canvas_id = "vis:doubleColourSchemeBall";

	p5_lib_world_orientation_interaction(p);
	p5_lib_rotation_selection(p);
	p5_lib_annotations(p);
	p5_lib_checker_sphere_mesh(p);
	p5_lib_controls(p);

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.antipode_shader = p.createShader(src_vert_anti, src_frag_anti);
		p.check_shader = p.createShader(src_vert_checkso3_world, src_frag_checkso3_world);
		p.check_shader.setUniform("uCheckSize", 20);
		p.rot_yz_90 = rot3_yz(HALF_PI);
		p.rot_xz_90 = rot3_xz(HALF_PI);
	
		p.sphere_geom_partialA = p.buildGeometry(() => p.createCheckerSpherePartial(24,100,0));
		p.sphere_geom_partialB = p.buildGeometry(() => p.createCheckerSpherePartial(24,100,1));

		p.rot = angleaxis_to_matrix(v_normalise([0.5,1,0]), PI/2);

		p.noStroke();
		p.setWorldRot(-0.5,0.45);

		p.left = p.createFramebuffer({width: p.width/2, height: p.height});	
		p.right = p.createFramebuffer({width: p.width/2, height: p.height});	

		// create labels
		p.lab_left_title = p.createAnnotation(10,10, "Double colour scheme \\( \\tau: \\text{SO}(3) \\rightarrow \\text{Col}\\)");
		p.lab_left_x = p.createAnnotation(0, 0, "\\(x\\)");
		p.lab_left_y = p.createAnnotation(0, 0, "\\(y\\)");
		p.lab_left_z = p.createAnnotation(0, 0, "\\(z\\)");

		p.lab_right_title = p.createAnnotation(p.width/2+10, 10, "\\(\\tau\\) applied to cross-section of \\( \\text{SO}(3) \\)");

		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createP("Drag with mouse on left hand side to rotate the view. Drag with mouse on the right hand side to rotate the cross section.", p.margin);

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
			p.setAnnotationPos3left(p.lab_left_z, [0,0,-PI]);

			p.applyMatrix(mat3_to_mat4(p.rot));
			p.strokeWeight(4);
			p.stroke(0,0,0,200);
			p.noFill();
			p.ellipse(0,0,TWOPI, TWOPI, 49);
		p.left.end();

		// begin right framebuffer
		p.right.begin();
			p.clear();
			//p.applyMatrix(p.world_transform.mat);
			p.scale(50);

			p.strokeWeight(4);

			// draw cube with rotation theta u
			p.noStroke();
			p.fill(255);
			p.shader(p.check_shader);
			p.check_shader.setUniform("uRotMat", p.rot);
			p.ellipse(0,0,TWOPI,TWOPI,50);
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

