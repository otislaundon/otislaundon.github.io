let sketch_doubleColourSphere = new p5((p) => {
    p.canvas_id = "vis:doubleColourSphere";

	p5_lib_world_orientation_interaction(p);
	p5_lib_controls (p);
	p5_lib_so3_core(p);
	p5_lib_annotations(p);

	p.src_vert = `
	precision highp float;
	uniform mat4 uModelViewMatrix ;
	uniform mat4 uProjectionMatrix;
	uniform vec4 uBounds;

	attribute vec3 aPosition;

	varying vec3 vVertexPos;

	void main() {
	  vVertexPos = aPosition;
	  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
	}
	`;

	p.src_frag_anti = `
	precision highp float;
	
	varying vec3 vVertexPos;
	uniform float uDirScale;

	vec3 dir_to_col(vec3 dir){
		return vec3(dir * 0.5 + 0.5);
	}

	void main() {
		gl_FragColor = vec4(dir_to_col(uDirScale * vVertexPos.xyz), 1.0);
	}
	`;

	p.spherical = function(theta, phi){
		return [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)];
	}

	p.createCheckerSphere = function(resx, resy){
		p.beginShape(p.QUADS);
		for(let i = 0; i < resx; i++)
		for(let k = 0; k < resy/2; k++)
		{
			let j = 2*k + (i+k)%2;
			let a = p.spherical(TWOPI*i/resx,     TWOPI*j/resy);
			let b = p.spherical(TWOPI*(i+1)/resx, TWOPI*j/resy);
			let c = p.spherical(TWOPI*i/resx,     TWOPI*(j+1)/resy);
			let d = p.spherical(TWOPI*(i+1)/resx, TWOPI*(j+1)/resy);
			p.vertex(a[0],a[1],a[2]);
			p.vertex(b[0],b[1],b[2]);
			p.vertex(d[0],d[1],d[2]);
			p.vertex(c[0],c[1],c[2]);
		}
		p.endShape();

	}

	p.createSphere = function(resx, resy){
		p.beginShape(p.QUADS);
		for(let i = 0; i < resx; i++)
		for(let j = 0; j < resy; j++)
		{
			let a = p.spherical(TWOPI*i/resx,     TWOPI*j/resy);
			let b = p.spherical(TWOPI*(i+1)/resx, TWOPI*j/resy);
			let c = p.spherical(TWOPI*i/resx,     TWOPI*(j+1)/resy);
			let d = p.spherical(TWOPI*(i+1)/resx, TWOPI*(j+1)/resy);
			p.vertex(a[0],a[1],a[2]);
			p.vertex(b[0],b[1],b[2]);
			p.vertex(d[0],d[1],d[2]);
			p.vertex(c[0],c[1],c[2]);
		}
		p.endShape();
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;
		p.gl.enable(p.gl.CULL_FACE);
		p.gl.cullFace(p.gl.BACK); 
		p.antipode_shader = p.createShader(p.src_vert, p.src_frag_anti);

		p.example_rot_angleaxis =[1,-0.5,2];

		p.sphere_geom = p.buildGeometry(() => p.createCheckerSphere(50,100,1));

		p.noStroke(); 

		p.lab_k = p.createAnnotation(0,0,"\\(\\kappa\\)")
		p.lab_ki = p.createAnnotation(0,0,"\\(\\kappa^{-1}\\)")
		p.lab_kd = p.createAnnotation(0,0,"\\([\\kappa,\\kappa^{-1}]\\)")

		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createP("Drag with mouse to rotate the view.", p.margin);
	}

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.clear();

		p.shader(p.antipode_shader);
		p.push(); // Draw sphere 1
			p.translate(-p.width*2/7,0);
			p.applyMatrix(p.world_transform.mat);
			p.scale(30);

			p.scale(PI);
			p.antipode_shader.setUniform("uDirScale", -1);
			p.model(p.sphere_geom);
			p.scale(-1);
			p.antipode_shader.setUniform("uDirScale", 1);
			p.model(p.sphere_geom);
		p.pop(); 

		p.push(); // Draw sphere 2 
			p.applyMatrix(p.world_transform.mat);
			p.scale(30);

			p.scale(PI);
			p.antipode_shader.setUniform("uDirScale", 1);
			p.model(p.sphere_geom);
			p.scale(-1);
			p.antipode_shader.setUniform("uDirScale", -1);
			p.model(p.sphere_geom);
		p.pop();
	
		p.push(); // Draw sphere 3
			p.translate(p.width*2/7,0);
			p.applyMatrix(p.world_transform.mat);
			p.scale(30);

			p.scale(PI);
			p.antipode_shader.setUniform("uDirScale", 1);
			p.model(p.sphere_geom);
			p.scale(-1);
			p.model(p.sphere_geom);
		p.pop();

		p.setAnnotationPos(p.lab_k, 80, 60);
		p.setAnnotationPos(p.lab_ki, 300, 60);
		p.setAnnotationPos(p.lab_kd, 480, 60);
    }

	p.mousePressed = function(){p.interactOnPressed();}
	p.mouseDragged = function(){p.interactOnDragged();}

})

