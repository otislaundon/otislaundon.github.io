let sketch_PathLiftNontrivial = new p5((p) => {
    p.canvas_id = "vis:PathLiftNontrivial";

	p5_lib_world_orientation_interaction(p);
	p5_lib_controls (p);
	p5_lib_so3_core(p);
	p5_lib_annotations(p);

	p.path_1 = function(t){
		//return [p.sin(t)*3 + 1 * p.cos(t), 4*p.cos(t*3.0), p.sin(2*t)]
		let q0 = quaternion_to_real_mat4(point_to_quaternion([0.1,0.25,0.25]));
		let qt = quaternion_to_real_mat4(point_to_quaternion([t*PI,0,0.001]));

		return quaternion_to_point(real_mat4_to_quaternion(mm_prod(qt, q0, 4)));
	}

	p.create_path_geom = function(alpha, res){
		let point = alpha(0);
		for(let i = 1; i <= res; i++){
			let new_point = alpha(i/res);
			p.line(point[0], point[1], point[2], new_point[0], new_point[1], new_point[2]);
			point = new_point;
		}
	}

	p.create_path_so3_geom = function(alpha, res){
		for(let i = 1; i <= res; i++){
			let point_su2 = alpha((i-1)/res);
			let point = matrix_to_angleaxis(SU2_to_rot_matrix(point_to_quaternion(point_su2)));
			let new_point_su2 = alpha(i/res);
			let new_point = matrix_to_angleaxis(SU2_to_rot_matrix(point_to_quaternion(new_point_su2)));

			// if both points of su2 are on same side of boundary, no problem, add the line.
			if(v_len(point_su2) < PI/2 == v_len(new_point_su2) < PI/2)
				p.line(point[0], point[1], point[2], new_point[0], new_point[1], new_point[2]);

			// if on opposite sides of boundary, problem, add 2 line segments
			//TODO:
		}
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480,p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.path_1_geom = p.buildGeometry(() => {p.create_path_geom(p.path_1, 64)});
		p.path_1_so3_geom = p.buildGeometry(() => {p.create_path_so3_geom(p.path_1, 64)});

		p.t = 0;
		p.lab_t = p.createAnnotation(100,70,"\\(t={}\\)");
		p.lab_x0 = p.createAnnotation(0,0,"\\(x_0\\)");
		p.lab_a = p.createAnnotation(0,0,"\\(\\alpha(t)\\)");
		p.lab_atil = p.createAnnotation(0,0,"\\(\\tilde\\alpha(t)\\)");
    }

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.clear();
		p.fill(255,255,255,0);
		p.noStroke();

		p.push(); // start scene
		p.lights(); 
		p.applyMatrix(p.world_transform.mat);
			p.scale(30);
			p.strokeWeight(4);

			p.draw_outline_ball(PI);
			p.push();
				p.stroke(0,0,0,30);
				p.rotateX(PI/2);
				p.line(-2*PI,0,0,2*PI,0,0);
			p.pop();
			p.setAnnotationPos3(p.lab_x0, p.path_1(0));
		
			p.push();
				p.scale(2);
				p.draw_outline_ball(PI);

				p.stroke(255,0,0,100);
				p.model(p.path_1_geom);
			p.pop();

			p.stroke(0,0,255,50);
			p.model(p.path_1_so3_geom);
			
			p.noStroke();
			let atil_pos = vs_prod(p.path_1(p.t),2);
			let a_pos = matrix_to_angleaxis(SU2_to_rot_matrix(point_to_quaternion(p.path_1(p.t))))
			p.push();
				p.translate(atil_pos[0],atil_pos[1],atil_pos[2]);
				p.fill(255,0,0,100);
				p.sphere(0.2);
			p.pop();
			p.push();
				p.translate(a_pos[0],a_pos[1],a_pos[2]);
				p.fill(0,0,255,50);
				p.sphere(0.2);
			p.pop();
			p.setAnnotationPos3(p.lab_atil, atil_pos, [15,0]);
			p.setAnnotationPos3(p.lab_a, a_pos, [15,-20]);
		p.pop(); // end scene

		p.t = (p.t + p.deltaTime/5000)%1;
		p.lab_t.innerHTML = "t = "+p.t.toFixed(2);
    }

	p.mousePressed = function(){p.interactOnPressed();}
	p.mouseDragged = function(){p.interactOnDragged();}

})

