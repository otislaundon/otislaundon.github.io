let sketch_DiskWrapSphere = new p5((p) => {
    p.canvas_id = "vis:DiskWrapSphere";

	p5_lib_world_orientation_interaction(p);
	p5_lib_annotations(p);
	p5_lib_axes(p);
	p5_lib_controls(p);

    p.setup = function(){
        p.canvas = p.createCanvas(640, 640, p.WEBGL);
        p.canvas.parent(p.canvas_id);

		p.setWorldRot(0.8, 0.2);

		p.sphere_shader = p.baseMaterialShader().modify({
			varyingVariables:['vec3 vVertex'],
			'void afterVertex': `(){
				vVertex = aPosition;
			}`,
			'vec4 hsv2rgb_smooth':`( vec4 c ){
				vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
				rgb = c.z * mix(vec3(1.0), rgb, c.y);
				return vec4(rgb, c.w);
			}`,
			'vec4 getFinalColor':`(vec4 color){
				float s = max(0., vVertex.x+1.);
				float v = min(1., -vVertex.x+1.);
				return hsv2rgb_smooth(vec4(atan(-vVertex.y, -vVertex.z)/6.283, s, v, 1.));
			}`,
		});

		p.circle_shader = p.baseMaterialShader().modify({
			varyingVariables:['vec3 vVertex'],
			'void afterVertex': `(){
				vVertex = (-aPosition + vec3(0.5,0.5,0.))*2.0;
			}`,
			'vec4 hsv2rgb_smooth':`( vec4 c ){
				vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
				rgb = c.z * mix(vec3(1.0), rgb, c.y);
				return vec4(rgb, c.w);
			}`,
			'vec4 getFinalColor':`(vec4 color){
				float theta = atan(vVertex.x, vVertex.y);
				float psi = length(vVertex) * 3.14159;
				vec3 pos = vec3(cos(psi), -cos(theta)*sin(psi), sin(theta)*sin(psi));

				float s = max(0., pos.x+1.);
				float v = min(1., -pos.x+1.);
				return hsv2rgb_smooth(vec4(atan(-pos.y, -pos.z)/6.283, s, v, 1.));
			}`,
		});

		p.lab_x = p.createAnnotation(0, 0, "\\(x\\)");
		p.lab_y = p.createAnnotation(0, 0, "\\(y\\)");
		p.lab_z = p.createAnnotation(0, 0, "\\(z\\)");

		// create controls panel
		p.animate = false;
		p.margin = p.createMargin();
		p.createTitle("Controls", p.margin);
		p.createP("Drag with mouse to rotate the view.", p.margin);
	}

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.clear();
		p.applyMatrix(p.world_transform.mat);

		p.scale(25);

		p.push();
			p.noStroke();
			p.shader(p.sphere_shader);
			p.sphere(PI);
		p.pop();

		p.push();
			p.translate(PI,0,0);
			p.rotateY(HALF_PI);
			p.scale(PI);
			p.shader(p.circle_shader);
			p.ellipse(0,0,TWOPI, TWOPI,50);
		p.pop();

		p.clearDepth();
		p.draw_axes(4,2);
		p.setAnnotationPos3(p.lab_x,[4.0,0.0,0.0]);
		p.setAnnotationPos3(p.lab_y,[0.0,-5.5,0.0]);
		p.setAnnotationPos3(p.lab_z,[0.0,0.0,4.0]);
    }

	p.mousePressed = function(){
      		p.interactOnPressed();
	}
	p.mouseDragged = function(){
			p.interactOnDragged();
	}
})

