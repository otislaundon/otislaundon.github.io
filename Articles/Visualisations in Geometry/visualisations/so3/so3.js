let sketch_so3 = new p5((p) => {
	p5_lib_world_orientation_interaction(p);
	p5_lib_controls (p);
	p5_lib_so3_core(p);

    p.canvas_id = "vis:so3";

	p.compute_points = function(a){
		let a_mat = angleaxis_to_matrix(v_normalise(a),v_len(a));
		p.points_transformed = [];
		for(let i = 0; i < p.n_points; i++)
			p.points_transformed.push(matrix_to_angleaxis(mm_prod(a_mat, angleaxis_to_matrix(v_normalise(p.points[i]), v_len(p.points[i])),3)));
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		/*
		p.sliders = [];
		for(let i = 0; i < 3; i++)
		{
			let input_slider = p.createSlider();
			input_slider.addEventListener('input', () => {
				p.initialise_points(0,1,0);
			});
			p.sliders.push(input_slider);
		}
		*/

		p.initialise_points(0,0,0);

		p.noStroke(); 
	}

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.compute_points([p.millis()/2000,0,0]);

		//create semi-transparent background effect
		/*
		p.push();
			p.fill(255,255,255,20);
			p.noStroke();
			p.rect(-p.width/2,-p.height/2,p.width,p.height);
		p.pop();
		*/
		p.clear();

		p.push(); // start scene
		p.applyMatrix(p.world_transform.mat);
			p.scale(50);
			p.lights(); 
			p.draw_outline_ball(PI);
			p.stroke(255,0,0,50);
			p.strokeWeight(4);
			p.draw_points(p.points_transformed);
		p.pop(); // end scene
    }

	p.mousePressed = function(){p.interactOnPressed();}
	p.mouseDragged = function(){p.interactOnDragged();}
});

