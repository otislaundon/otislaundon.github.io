let sketch_so3 = new p5((p) => {
	p5_lib_world_orientation_interaction(p);
    p.canvas_id = "vis:so3";

	p.get_point_in_ball = function(r){
		let v = [(Math.random()-0.5)*r,(Math.random()-0.5)*r,(Math.random()-0.5)*r];
		while(v_len(v) > r)
			v = [(Math.random()-0.5)*r,(Math.random()-0.5)*r,(Math.random()-0.5)*r];
		return v;
	}

	p.mult_so3 = function(a,b){
		let a_mat = angleaxis_to_matrix(v_normalise(a), v_len(a));
		return matrix_to_angleaxis(mm_prod(a_mat, angleaxis_to_matrix(v_normalise(b), v_len(b)),3));
	}

	p.compute_points = function(a){
		let a_mat = angleaxis_to_matrix(v_normalise(a),v_len(a));
		p.points_transformed = [];
		for(let i = 0; i < p.n_points; i++)
			p.points_transformed.push(matrix_to_angleaxis(mm_prod(a_mat, angleaxis_to_matrix(v_normalise(p.points[i]), v_len(p.points[i])),3)));
		console.log(p.points_transformed[0]);
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);

		p.points = [];
		

		let res = 32;
		for(let i = 0; i <res; i++)
		{
			
			p.points.push([(i/res-0.5)*TWOPI,0,0]);
			p.points.push([0,(i/res-0.5)*TWOPI,0]);
			p.points.push([0,0,(i/res-0.5)*TWOPI]);
			

			for(let j = 0; j <= res; j++)
				p.points.push(p.mult_so3([j/res*TWOPI,0,0], [0,0,(i/res-0.5)*TWOPI]));
		}

		p.n_points = p.points.length;
		p.noStroke(); 
    }

	p.update = function(){
		p.compute_points([p.millis()/2000,0,0]);
	}

    p.draw = function(){
		p.update();

        p.background(0,128,128);
		p.applyMatrix(p.world_transform.mat);
		p.scale(50);
		p.lights(); 
	

		for(let i = 0; i < p.n_points; i++){
			let offset = p.points_transformed[i];
			p.push();
			p.translate(offset[0], offset[1], offset[2]);
			p.scale(0.001);
			p.box();
			p.pop(); 
		}
    }

	p.mousePressed = function(){p.interactOnPressed();}
	p.mouseDragged = function(){p.interactOnDragged();}
});

