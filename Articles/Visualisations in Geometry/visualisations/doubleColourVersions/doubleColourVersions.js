let sketch_doubleColourVersions = new p5((p) => {
    p.canvas_id = "vis:doubleColourVersions";

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

	p.src_frag_anti= `
	precision highp float;
	
	varying vec3 vVertexPos;
	uniform float uDirScale;

	vec3 dir_to_col(vec3 dir){
		return vec3(dir * 0.5 + 0.5);
	}

	void main() {
		gl_FragColor = vec4(dir_to_col(uDirScale * vVertexPos), 1.0);
	}
	`;


	p.src_frag_check_R3 = `
	precision highp float;
	
	varying vec3 vVertexPos;

	vec3 dir_to_col(vec3 dir){
		return vec3(dir * 0.5 + 0.5);
	}

	void main() {
		float total = floor(vVertexPos.x * 10.0) + floor(vVertexPos.y*10.0)  + floor(vVertexPos.z*10.0);
		float blend = (mod(total, 2.0) == 0.0) ? 0.0 : 1.0;
		gl_FragColor = vec4(dir_to_col(vVertexPos) * blend + (1.0-blend)*dir_to_col(-vVertexPos), 1.0);
	}
	`;


	p.src_frag_check_IxI = `
	precision highp float;
	
	varying vec3 vVertexPos;

	vec3 dir_to_col(vec3 dir){
		return vec3(dir * 0.5 + 0.5);
	}

	void main() {
		float total = floor(gl_FragCoord.x / 10.0) + floor(gl_FragCoord.y / 10.0);
		float blend = (mod(total, 2.0) == 0.0) ? 0.0 : 1.0;

		vec3 surf_col = blend * dir_to_col(vVertexPos) + (1.0-blend)*dir_to_col(-vVertexPos);
		
		gl_FragColor = vec4(surf_col, 1.0);
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

	p.sphere_axes = function(){
		p.push();
			//p.gl.disable(p.gl.DEPTH_TEST);

			p.fill(0,0,0,0);
			p.stroke(0,0,0,255);
			p.strokeWeight(2);

			p.ellipse(0,0,2.001,2.001,50);
			p.rotateX(PI/2);
			p.ellipse(0,0,2.001,2.001,50);
			p.rotateY(PI/2);
			p.ellipse(0,0,2.001,2.001,50);
		p.pop();

	}

	p.setup = function(){
        p.canvas = p.createCanvas(720, 360, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.antipode_shader = p.createShader(p.src_vert, p.src_frag_anti);
		p.antipode_shader_R3 = p.createShader(p.src_vert, p.src_frag_check_R3);
		p.antipode_shader_screen = p.createShader(p.src_vert, p.src_frag_check_IxI);

		p.example_rot_angleaxis =[1,-0.5,2];

		p.sphere_geom = p.buildGeometry(() => p.createSphere(50,100));
		p.sphere_checker_geom = p.buildGeometry(() => p.createCheckerSphere(50,100));

		p.noStroke(); 

		p.lab_1 = p.createAnnotation(0,0,"\\(S^2\\) checkerboard");
		p.lab_2 = p.createAnnotation(0,0,"\\(\\mathbb R^3\\) checkerboard");
		p.lab_3 = p.createAnnotation(0,0,"\\(I\\times I\\) checkerboard");

		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createP("Drag with mouse to rotate the view.", p.margin);
	}

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.clear();

		p.push(); // Draw sphere 1, with S^2 checkerboard
			p.shader(p.antipode_shader);

			p.translate(-p.width*2/7,0);
			p.applyMatrix(p.world_transform.mat);
			p.scale(30);
			p.scale(PI);

			p.sphere_axes();
			p.antipode_shader.setUniform("uDirScale", 1);
			p.model(p.sphere_checker_geom);
			p.scale(-1);
			p.model(p.sphere_checker_geom);
		p.pop(); 

		p.push(); // Draw sphere 2, with \R^3 checkerboard
			p.shader(p.antipode_shader_R3);
			p.applyMatrix(p.world_transform.mat);
			p.scale(30);
			p.scale(PI);
			p.sphere_axes();
			p.model(p.sphere_geom);
		p.pop();
	
		p.push(); // Draw sphere with IxI checkerboard
			p.translate(p.width*2/7,0);
			p.scale(30);
			p.scale(PI);

			p.applyMatrix(p.world_transform.mat);

			p.sphere_axes();
			
			p.shader(p.antipode_shader_screen);
			p.model(p.sphere_geom);
		p.pop();

		p.setAnnotationPos(p.lab_1, 80, 60);
		p.setAnnotationPos(p.lab_2, 280, 60);
		p.setAnnotationPos(p.lab_3, 480, 60);
    }

	p.mousePressed = function(){p.interactOnPressed();}
	p.mouseDragged = function(){p.interactOnDragged();}


})

