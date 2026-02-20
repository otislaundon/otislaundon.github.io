let sketch_SU2coverSO3 = new p5((p) => {
	p5_lib_world_orientation_interaction(p);
	p5_lib_controls (p);
	p5_lib_so3_core(p);

    p.canvas_id = "vis:SU2-cover-SO3";

	p.compute_transformed_points = function(q_mat, quaternion_matrices){
		p.points_transformed_so3 = [];
		p.points_transformed_su2 = [];

		for(let i = 0; i < quaternion_matrices.length; i++){
			let q_new = real_mat4_to_quaternion(mm_prod(q_mat, quaternion_matrices[i], 4));
			p.points_transformed_su2.push(vs_prod(quaternion_to_point(q_new),2.0)); 		// Double angle needed for the representations to line up
			p.points_transformed_so3.push(matrix_to_angleaxis(SU2_to_rot_matrix(q_new)));
		}
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480,p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.quaternion_matrices = [];

		//initialise points
		let resi = 48;
		let resj = 12;
		for(let i = 0; i <=resi; i++)
			for(let j = 0; j <= resj; j++)
			{
				p.quaternion_matrices.push(
				mm_prod(
					mm_prod(
							quaternion_to_real_mat4(point_to_quaternion([(i/resi*PI-PI/2)*2.0,0,0])),
							quaternion_to_real_mat4(point_to_quaternion([0,0,(j/resj*PI-PI/2)*2.0])),4),
							quaternion_to_real_mat4(point_to_quaternion([0,PI/4,0])),4)
				);
			}
		p.n_points = p.quaternion_matrices.length;
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
		p.applyMatrix(p.world_transform.mat);
			p.scale(30);
			p.strokeWeight(4);

			p.draw_outline_ball(PI);
			p.draw_outline_ball(2*PI);
			p.push();
				p.stroke(0,0,0,30);
				p.rotateX(PI/2);
				p.line(-2*PI,0,0,2*PI,0,0);
			p.pop();
		
			p.stroke(255,0,0,50);
			p.draw_points(p.points_transformed_su2);
			p.stroke(0,0,250,50);
			p.draw_points(p.points_transformed_so3);
		p.pop(); // end scene
    }

	p.mousePressed = function(){p.interactOnPressed();}
	p.mouseDragged = function(){p.interactOnDragged();}
})

