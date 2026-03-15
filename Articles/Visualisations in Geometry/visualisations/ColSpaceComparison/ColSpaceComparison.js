let sketch_ColSpaceComparison = new p5((p) => {
    p.canvas_id = "vis:ColSpaceComparison";

	p5_lib_world_orientation_interaction(p);
	p5_lib_annotations(p);
	p5_lib_controls(p);

p.src_vert_rgb = `
precision highp float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;

varying vec3 vCol;

void main() {
	vCol = (vec3(aPosition.x, -aPosition.y, aPosition.z)+0.5);
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
}
`;

p.src_frag_rgb = `
precision highp float;

varying vec3 vCol;

void main() {
	gl_FragColor = vec4(vCol, 1.0);
}
`

p.src_vert_hsv = `
precision highp float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;

varying vec3 vPos;

void main() {
	vPos = aPosition;
    gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
}
`;

p.src_frag_hsv = `
precision highp float;

varying vec3 vPos;

vec3 hsv2rgb(vec3 c){
	vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
	rgb = c.z * mix(vec3(1.0), rgb, c.y);
	return rgb;
}
void main() {
	float h = atan(-vPos.z, vPos.x)/6.28;
	float v = (-vPos.y + 0.5);
	float s = length(vPos.xz);
	gl_FragColor = vec4(hsv2rgb(vec3(h,s,v)), 1.0);
}
`

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.rgb_shader = p.createShader(p.src_vert_rgb, p.src_frag_rgb);
		p.hsv_shader = p.createShader(p.src_vert_hsv, p.src_frag_hsv);

		p.noStroke();

		p.left = p.createFramebuffer({width: p.width/2, height: p.height});	
		p.right = p.createFramebuffer({width: p.width/2, height: p.height});	

		p.setWorldRot(-0.5,0.45);

		p.lab_left_title = p.createAnnotation(10,10, "RGB colour model");
		p.lab_right_title = p.createAnnotation(p.width/2+10, 10, "HSV colour model");

		// create labels
		
		p.lab_left_x = p.createAnnotation(0, 0, "\\(r\\)");
		p.lab_left_y = p.createAnnotation(0, 0, "\\(g\\)");
		p.lab_left_z = p.createAnnotation(0, 0, "\\(b\\)");

		p.lab_right_h = p.createAnnotation(0, 0, "\\(h\\)");
		p.lab_right_s = p.createAnnotation(0, 0, "\\(s\\)");
		p.lab_right_v = p.createAnnotation(0, 0, "\\(v\\)");

		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createP("Drag with mouse to rotate the view.", p.margin);
	}

	p.arrow = function(start, end, col, rot){
			p.stroke(col[0], col[1], col[2]);
			p.fill(col[0], col[1], col[2]);
			p.strokeWeight(2);
			p.line(start[0], start[1], start[2], end[0], end[1], end[2]);
			p.push();
			p.translate(end[0], end[1], end[2]);
			rot();
			p.cone(0.02,0.05);
			p.pop();
	}

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.clear();

		// begin left framebuffer
		p.left.begin();
			p.clear();
			p.applyMatrix(p.world_transform.mat);
			p.scale(180);
		
			// set annotation positions
		
			p.setAnnotationPos3left(p.lab_left_x, [0.7,0.5,-0.5]);
			p.setAnnotationPos3left(p.lab_left_y, [-0.45,-0.75,-0.5]);
			p.setAnnotationPos3left(p.lab_left_z, [-0.5,0.5,0.7]);

			p.arrow([-0.5,0.5,-0.5], [0.7,0.5,-0.5], [255,0,0], ()=>{p.rotateZ(-HALF_PI)});
			p.arrow([-0.5,0.5,-0.5], [-0.5,-0.7,-0.5], [0,255,0], ()=>{p.rotateZ(PI)});
			p.arrow([-0.5,0.5,-0.5], [-0.5,0.5,0.7], [0,0,255], ()=>{p.rotateX(HALF_PI)});

			p.noStroke();
			p.shader(p.rgb_shader);
			p.box(1);
		p.left.end();

		// begin right framebuffer
		p.right.begin();
			p.clear();
			p.applyMatrix(p.world_transform.mat);
			p.scale(100);
		
			// set annotation positions
		
			p.setAnnotationPos3right(p.lab_right_s, [1.1,-1.2,0]);
			p.setAnnotationPos3right(p.lab_right_v, [-1.2,-1.3,0.4]);

			//p.arrow([-0.5,0.5,-0.5], [0.7,0.5,-0.5], [255,0,0], ()=>{p.rotateZ(-HALF_PI)});
			
			p.arrow([0,-1.05,0], [1,-1.05,0], [0,0,0], ()=>{p.rotateZ(-HALF_PI)});
			p.arrow([-1.2,1,0.4], [-1.2,-1,0.4], [0,0,0], ()=>{p.rotateZ(PI)});
			p.push();
			p.translate(0,-1.1,0);
			p.rotateX(HALF_PI);
			p.noFill();
			p.arc(0,0,1,1,PI,0);
			p.translate(-0.5,0,0);
			p.setAnnotationPos3right(p.lab_right_h, [0,0,0]);
			p.cone(0.02,0.05);
			p.pop();

			p.noStroke();
			p.shader(p.hsv_shader);
			p.cylinder(1,2);
		p.right.end();

		// draw frame buffers to screen
		p.image(p.left, -p.width/2, -p.height/2);
		p.image(p.right, 0, -p.height/2);
    }

	p.mousePressed = function(){
		p.interactOnPressed();
	}
	p.mouseDragged = function(){
		p.interactOnDragged();
	}

})

