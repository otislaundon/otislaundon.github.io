let sketch_SU2LeftAction = new p5((p) => {
	p5_lib_world_orientation_interaction(p);
	p5_lib_controls (p);
	p5_lib_so3_core(p);
	p5_lib_annotations(p);

    p.canvas_id = "vis:SU2LeftAction";

	p.compute_transformed_points = function(q_mat, quaternion_matrices){
		p.points_transformed_su2 = [];

		for(let i = 0; i < quaternion_matrices.length; i++)
		{
			let q_new = real_mat4_to_quaternion(mm_prod(q_mat, quaternion_matrices[i], 4));
			p.points_transformed_su2.push(quaternion_to_point(q_new));
		}
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.quaternion_matrices = [];

		//initialise points
		p.n_points = 200;
		for(let i = 0; i < p.n_points; i++)
			p.quaternion_matrices.push(quaternion_to_real_mat4(random_point_on_sphere(4)));

		p.lab_su2 = p.createAnnotation(10,50,"Left action of \\(a\\) on \\( SU(2) \\)");

		p.lab_su2_x = p.createAnnotation(p.width/2 + 10,50,"\\( x \\)");
		p.lab_su2_y = p.createAnnotation(p.width/2 + 10,50,"\\( y \\)");
		p.lab_su2_z = p.createAnnotation(p.width/2 + 10,50,"\\( z \\)");
		p.lab_su2_a = p.createAnnotation(p.width/2 + 10,50,"\\( a \\)");
    }

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		let a = point_to_quaternion([p.millis()/2000,0,0]);
		p.point_a = quaternion_to_point(a);

		p.compute_transformed_points(
			quaternion_to_real_mat4(a),
			p.quaternion_matrices);

		p.noStroke();
		//p.fill(255,255,255,20);
		//p.rect(-p.width/2, -p.height/2, p.width, p.height);

		p.applyMatrix(p.world_transform.mat);
		p.scale(1,-1,-1)//rescale to standard mathematical coordinates

		p.clear();

		p.fill(255,255,255,0);

		p.push(); // start scene

			p.lights(); 
			p.strokeWeight(4);

			p.scale(50);

			p.draw_outline_ball(PI);
			p.strokeWeight(2);
			p.stroke(0,0,0,30);
			p.line(-PI,0,0,PI,0,0);
			
			// add annotations for axes.
			p.setAnnotationPos3(p.lab_su2_x, [PI,0,0]);
			p.setAnnotationPos3(p.lab_su2_y, [0,PI,0]);
			p.setAnnotationPos3(p.lab_su2_z, [0,0,PI]);
			p.setAnnotationPos3(p.lab_su2_a, p.point_a);

			p.strokeWeight(6);
			p.stroke(255,0,0,50);
			p.draw_points(p.points_transformed_su2);

			p.push();
			p.translate(p.point_a[0],p.point_a[1],p.point_a[2])
			p.noStroke();
			p.fill(0,255,0,100);
			p.sphere(0.1);
			p.pop();
		p.pop(); // end scene
    }

	p.mousePressed = function(){p.interactOnPressed();}
	p.mouseDragged = function(){p.interactOnDragged();}
})

