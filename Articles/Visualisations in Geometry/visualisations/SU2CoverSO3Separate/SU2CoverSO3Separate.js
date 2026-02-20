let sketch_SU2CoverSO3Separate = new p5((p) => {
    p.canvas_id = "vis:SU2CoverSO3Separate";

	p5_lib_world_orientation_interaction(p);
	p5_lib_controls (p);
	p5_lib_so3_core(p);
	p5_lib_annotations(p);

	p.compute_transformed_points = function(q_mat, quaternion_matrices){
		p.points_transformed_so3 = [];
		p.points_transformed_su2 = [];

		for(let i = 0; i < quaternion_matrices.length; i++)
		{
			let q_new = real_mat4_to_quaternion(mm_prod(q_mat, quaternion_matrices[i], 4));
			//let q_new = p.real_mat4_to_quaternion(quaternion_matrices[i]);
			p.points_transformed_su2.push(quaternion_to_point(q_new));
			p.points_transformed_so3.push(matrix_to_angleaxis(SU2_to_rot_matrix(q_new)));
		}
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480,p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.quaternion_matrices = [];

		//initialise points
		p.quaternion_matrices.push(quaternion_to_real_mat4(point_to_quaternion([0,PI/4,0])));
		p.n_points = p.quaternion_matrices.length;

		p.lab_so3 = p.createAnnotation(p.width/2 + 10,50,"\\( SO(3) \\)");
		p.lab_so3_x = p.createAnnotation(p.width/2 + 10,50,"\\( x \\)");
		p.lab_so3_y = p.createAnnotation(p.width/2 + 10,50,"\\( y \\)");
		p.lab_so3_z = p.createAnnotation(p.width/2 + 10,50,"\\( z \\)");
		p.lab_so3_a = p.createAnnotation(p.width/2 + 10,50,"Spin\\( (a) \\)");

		p.lab_su2 = p.createAnnotation(10,50,"\\( SU(2) \\)");
		p.lab_su2_x = p.createAnnotation(p.width/2 + 10,50,"\\( x \\)");
		p.lab_su2_y = p.createAnnotation(p.width/2 + 10,50,"\\( y \\)");
		p.lab_su2_z = p.createAnnotation(p.width/2 + 10,50,"\\( z \\)");
		p.lab_su2_a = p.createAnnotation(p.width/2 + 10,50,"\\( a \\)");
    }

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.compute_transformed_points(quaternion_to_real_mat4(point_to_quaternion([p.millis()/2000,0,0])), p.quaternion_matrices);
		p.clear();
		p.fill(255,255,255,0);
		p.noStroke();

		p.push(); // start scene

			p.lights(); 
			p.strokeWeight(4);

			p.push();// Draw SU2 on left
				p.translate(-p.width/4,0,0);
				p.applyMatrix(p.world_transform.mat);
				p.scale(50);

				p.draw_outline_ball(PI);
				p.strokeWeight(2);
				p.stroke(0,0,0,30);
				p.line(-PI,0,0,PI,0,0);
				
				// add annotations for axes.
				let wpx = p.worldToScreen(PI,0,0);
				let wpy = p.worldToScreen(0,-PI,0);
				let wpz = p.worldToScreen(0,0,-PI);
				let wpa = p.worldToScreen(p.points_transformed_su2[0][0],p.points_transformed_su2[0][1],p.points_transformed_su2[0][2]);
				p.setAnnotationPos(p.lab_su2_x, wpx.x, wpx.y);
				p.setAnnotationPos(p.lab_su2_y, wpy.x, wpy.y);
				p.setAnnotationPos(p.lab_su2_z, wpz.x, wpz.y);
				p.setAnnotationPos(p.lab_su2_a, wpa.x, wpa.y);

				p.strokeWeight(8);
				p.stroke(255,0,0,50);
				p.draw_points(p.points_transformed_su2);
			p.pop();

			p.push();// Draw SO3 on right
				p.translate(p.width/4,0,0);
				p.applyMatrix(p.world_transform.mat);
				p.scale(50);

				// add annotations for axes.
				wpx = p.worldToScreen(PI,0,0);
				wpy = p.worldToScreen(0,-PI,0);
				wpz = p.worldToScreen(0,0,-PI);
				wpa = p.worldToScreen(p.points_transformed_so3[0][0],p.points_transformed_so3[0][1],p.points_transformed_so3[0][2]);
				p.setAnnotationPos(p.lab_so3_x, wpx.x, wpx.y);
				p.setAnnotationPos(p.lab_so3_y, wpy.x, wpy.y);
				p.setAnnotationPos(p.lab_so3_z, wpz.x, wpz.y);
				p.setAnnotationPos(p.lab_so3_a, wpa.x, wpa.y);

				p.draw_outline_ball(PI);
				p.strokeWeight(2);
				p.stroke(0,0,0,30);
				p.line(-PI,0,0,PI,0,0);

				p.strokeWeight(8);
				p.stroke(0,0,250,50);
				p.draw_points(p.points_transformed_so3);
			p.pop();

		p.pop(); // end scene
    }

	p.mousePressed = function(){p.interactOnPressed();}
	p.mouseDragged = function(){p.interactOnDragged();}
})

