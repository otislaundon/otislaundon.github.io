let sketch_SU2LeftActInteractive = new p5((p) => {
    p.canvas_id = "vis:SU2LeftActInteractive";

	p5_lib_world_orientation_interaction(p);
	p5_lib_rotation_selection(p);
	p5_lib_so3_core(p);
	p5_lib_annotations(p);
	p5_lib_axes(p);
	p5_lib_checker_sphere_mesh(p);

 p.SU2_shader_hooks = {
	'mat3 Qspinor':`(vec4 u){
		return mat3(1.-2.*(u.y*u.y + u.z*u.z), 2.*(u.x*u.y+ u.z*u.w), 2.*(u.x*u.z - u.y*u.w),
					2.*(u.x*u.y - u.z*u.w), 1.-2.*(u.x*u.x + u.z*u.z), 2.*(u.y*u.z + u.x*u.w),
					2.*(u.x*u.z + u.y*u.w), 2.*(u.y*u.z - u.x*u.w), 1.-2.*(u.x*u.x + u.y*u.y));
	}`,

	'mat4 Q_to_mat4':`(vec4 q){
		return mat4(q.x, q.y, q.z, q.w,
					-q.y, q.x, q.w, -q.z,
					-q.z, -q.w, q.x, q.y,
					-q.w, q.z, -q.y, q.x);
	}`,

    'vec4 mat4_to_Q':`(mat4 m){
		return vec4(m[0][0], m[0][1], m[0][2], m[0][3]);
	}`,

	'vec4 vec3_to_Q':`(vec3 a){
		float h_len_w = length(a);
		float fac = sin(h_len_w)/h_len_w; 
		return vec4(cos(h_len_w), fac * a);
	}`,

	'vec3 Q_to_vec3 ':`(vec4 q){
		float theta = atan(length(q.yzw), q.x);
		return normalize(q.yzw) * theta;
	}`
};
    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.gl = p._renderer.GL;

		p.elem_u = vec3_to_Q([0,0.01,0]);

		p.dotsShader = p.baseStrokeShader().modify(p.SU2_shader_hooks).modify({
			uniforms: {
				'float uCheckSize': 6,
				'vec4 uElemU': () => p.elem_u,
			},
			varyingVariables: ['vec3 vVertexPos'],
			'void afterVertex': `(){
				vVertexPos = aPosition.xyz/3.1415927;
			} `,
			'StrokeVertex getObjectInputs': `(StrokeVertex inputs){
				inputs.position.xyz= Q_to_vec3(Q_to_mat4(uElemU) * mat4_to_Q(Q_to_mat4(vec3_to_Q(inputs.position.xyz))));
				return inputs;
			}`,
			'vec4 hsv2rgb_smooth':`( vec4 c ){
				vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
				rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing	
				rgb = c.z * mix(vec3(1.0), rgb, c.y);
				return vec4(rgb, c.w);
			}`,
			'vec3 dir_to_col': `(vec3 dir){
				return vec3(dir * 0.5 + 0.5)*length(dir);
			}`,
			'Inputs getPixelInputs': `(Inputs inputs) {
				float r = length(vVertexPos);
				inputs.color.xyz = mix(hsv2rgb_smooth(vec4(atan(vVertexPos.y, vVertexPos.z)/6.28, 1., 1., 1.)).xyz,vec3(r), 2.*abs(r-0.5));
				inputs.color.a = 1.0;
				return inputs;
			}`
		});

		p.dotsShader.setUniform("uCheckSize", 6)
		p.normal_shader = p.createShader(src_vert_normal, src_frag_normal);
		p.sphere_geom = p.buildGeometry(() => p.createCheckerSphere(50,100,1));

		p.n_points = 500;
		p.points = [];
		for(let i = 0; i < p.n_points; i++)
			p.points.push(Q_to_vec3(random_point_on_sphere(4)));

		p.noStroke();
		p.setWorldRot(-0.5,0.45);

		p.left = p.createFramebuffer({width: p.width/2, height: p.height});	
		p.right = p.createFramebuffer({width: p.width/2, height: p.height});	

		// create labels
		p.lab_title = p.createAnnotation(10,10, "\\(L_u: \\text{SU}(2) \\rightarrow \\text{SU}(2) \\)");
		p.lab_x = p.createAnnotation(0, 0, "\\(x\\)", true);
		p.lab_y = p.createAnnotation(0, 0, "\\(y\\)", true);
		p.lab_z = p.createAnnotation(0, 0, "\\(z\\)", true);
		p.lab_u = p.createAnnotation(0, 0,"\\(u\\)",true);
	}

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.clear();
		p.elem_u = vec3_to_Q([p.millis()/2000,0,0]);
		let u_vec3 = Q_to_vec3(p.elem_u);

		p.clear();
		p.applyMatrix(p.world_transform.mat);
		p.scale(50);
		p.lights();

		// DRAW OUTLINE SPHERE HERE
		p.draw_outline_ball(PI);

		// we will draw things inside sphere, so just overwrite it's depth information.
		p.clearDepth();

		// draw points with action applied to them
		p.strokeWeight(12);
		p.stroke(0,0,0,100);
		p.push();
		p.strokeShader(p.dotsShader);
		p.draw_points(p.points);
		p.pop();

		// set annotation positions
		p.setAnnotationPos3(p.lab_x, [PI,0,0]);
		p.setAnnotationPos3(p.lab_y, [0,-PI,0]);
		p.setAnnotationPos3(p.lab_z, [0,0,-PI]);
		p.setAnnotationPos3(p.lab_u, vv_add(u_vec3, [0,-0.6,0]));

		// draw axes
		p.clearDepth();
		p.draw_axes(PI,2);
		// draw theta u
		p.stroke(0);
		p.strokeWeight(16);
		p.beginShape(p.POINTS);
			p.vertex(u_vec3[0], u_vec3[1], u_vec3[2]);
		p.endShape();
		// draw box with corners at theta u and 0
		p.noFill();
		p.strokeWeight(2);
		p.stroke(0,0,0,100);
		p.translate(u_vec3[0]/2, u_vec3[1]/2, u_vec3[2]/2);
		p.box(u_vec3[0], u_vec3[1], u_vec3[2]);
    }

	p.mousePressed = function(){
      		p.interactOnPressed();
	}
	p.mouseDragged = function(){
		if(!p.clickStartedOnRight)
			p.interactOnDragged();
	}


})

