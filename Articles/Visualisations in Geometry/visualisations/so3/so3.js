function p5_lib_so3_core(p){
	// TODO: move main SO3 point rendering code here to allow different variants of the same visualisation.
}


let sketch_so3 = new p5((p) => {
	p5_lib_world_orientation_interaction(p);
	p5_lib_controls (p);
    p.canvas_id = "vis:so3";

	p.get_point_in_ball = function(r){
		let v = [(Math.random()-0.5)*r,(Math.random()-0.5)*r,(Math.random()-0.5)*r];
		while(v_len(v) > r)
			v = [(Math.random()-0.5)*r,(Math.random()-0.5)*r,(Math.random()-0.5)*r];
		return v;
	}

	p.mult_so3 = function(...args){
		let mats = args.map((a) => angleaxis_to_matrix(v_normalise(a), v_len(a)));
		let prod = mats.reduce((p, m) => mm_prod(m, p, 3));
		return matrix_to_angleaxis(prod);
	}

	p.compute_points = function(a){
		let a_mat = angleaxis_to_matrix(v_normalise(a),v_len(a));
		p.points_transformed = [];
		for(let i = 0; i < p.n_points; i++)
			p.points_transformed.push(matrix_to_angleaxis(mm_prod(a_mat, angleaxis_to_matrix(v_normalise(p.points[i]), v_len(p.points[i])),3)));
	}

	p.initialise_points = function(...args){
		p.points = [];

		let t_0 = args[0];
		let t_1 = args[1];
		let t_2 = args[2];

		t_0 = parseFloat(p.sliders[0].value) * 2*PI;
		t_1 = parseFloat(p.sliders[1].value) * 2*PI;
		t_2 = parseFloat(p.sliders[2].value) * 2*PI;
		
		//initialise points
		let res = 32;
		for(let i = 0; i <=res; i++)
		{

			// axes
			/*
			p.points.push([(i/res-0.5)*TWOPI,0,0]);
			p.points.push([0,(i/res-0.5)*TWOPI,0]);
			p.points.push([0,0,(i/res-0.5)*TWOPI]);
			*/

			for(let j = 0; j <= res; j++)
				p.points.push(p.mult_so3([j/res*TWOPI*0.9999,0,0], [0,0,(i/res-0.5)*TWOPI*0.9999],[t_0,t_1,t_2]));
		}

		p.n_points = p.points.length;
		p.background(255,255,255);
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.sliders = [];

		for(let i = 0; i < 3; i++)
		{
			let input_slider = p.createSlider();
			input_slider.addEventListener('input', () => {
				p.initialise_points();
			});
			p.sliders.push(input_slider);
		}

		p.initialise_points(0,1,0);

		p.noStroke(); 
	}

	p.update = function(){
		p.compute_points([p.millis()/2000,0,0]);
	}

    p.draw = function(){
		p.update();
        //p.background(0,128,128);
		p.push();
		p.fill(255,255,255,20);
		p.noStroke();
		p.rect(-p.width/2,-p.height/2,p.width,p.height);
		p.pop();

		p.push(); // start scene
		p.applyMatrix(p.world_transform.mat);
		p.scale(50);
		p.lights(); 

		p.push();
			p.scale(PI);
			p.gl.disable(p.gl.DEPTH_TEST);
			p.fill(255,255,255,10);
			p.sphere(1,32,32);
		p.pop();


		p.strokeWeight(2);
		p.beginShape(p.POINTS);
		for(let i = 0; i < p.n_points; i++){
			let offset = p.points_transformed[i];
			p.stroke(p.points[i][0],p.points[i][1],p.points[i][2]);
			p.vertex(offset[0], offset[1], offset[2]);
		}
		p.endShape();
		p.pop(); // end scene
    }

	p.mousePressed = function(){p.interactOnPressed();}
	p.mouseDragged = function(){p.interactOnDragged(); p.background(255,255,255);}
});

