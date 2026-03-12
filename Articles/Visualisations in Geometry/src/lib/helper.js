const HALF_PI = 1.5707963267

clamp = function(x,m,M){return Math.min(M, Math.max(x, m));}

//returns whether html element intersects viewport
const isVisibleInViewport = (element) => {
    const rect = element.getBoundingClientRect()
    return (
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    )
}

// This function takes in a p5 instance and adds to it drawing functions in R4
// We will create simmilar libraries potentially for hyperbolic or other drawing methods.
let augment_p5_instance = function(p){
	p.R4_to_R3 = function(a){
		a = mv_prod(p.MODEL_MAT4, a);
		a = vv_add(a, [0,0,0,3]);
		return project_stereo(a);
	}
  p.R4_to_screen = function(a)
  {
    a = vv_add(a, [0,0,0,2]);
    let a_pos3 = project_stereo(a);
    a_pos3 = vv_add(a_pos3, [0,0,3]);
    let a_pos2 = project_stereo(a_pos3);
    a_pos2 = mv_prod(p.clip_to_screen, a_pos2);
    return vv_add([p.width/2, p.height/2], a_pos2);
  }

  p.lineR4 = function(a, b) 
  { 
    let a_screen = p.R4_to_screen(mv_prod(MODEL_MAT4, a));
    let b_screen = p.R4_to_screen(mv_prod(MODEL_MAT4, b));
    p.line(a_screen[0], a_screen[1], b_screen[0], b_screen[1]);
  }

  p.point_R4 = function(a){
      let a_screen = p.R4_to_screen(mv_prod(MODEL_MAT4, a));
      p.circle(a_screen[0], a_screen[1], 0.0);
  }

  /**
   * 
   * @param {vertices, indices, colors?} mesh
   */
	p.draw_wire_mesh_r4 = function(mesh)
	{
		p.beginShape(p.LINES);
		for(let i = 0; i < mesh.indices.length; i += 2){
        	let edge = [mesh.indices[i], mesh.indices[i+1]]; 
			//if(mesh.colors != null)
            	//p.stroke(mesh.colors[i/2]);
        	//p.lineR4(mesh.vertices[edge[0]], mesh.vertices[edge[1]]);
			let p0 = p.R4_to_R3(mesh.vertices[edge[0]]);
			let p1 = p.R4_to_R3(mesh.vertices[edge[1]]);
			p.vertex(p0[0], p0[1], p0[2]);
			p.vertex(p1[0], p1[1], p1[2]);
		}
		p.endShape();
	}
}

project_stereo = function(v){
  return v.slice(0,-1).map((e) => e / v[v.length - 1]);
}

// w should be a complex number from math.js
weierstrass_sigma = function(z, depth=2){

 let result = new Complex(z);
 let w1 = new Complex(1,0);
 let w2 = new Complex(0,1);

 for(let n = -depth; n <= depth; n++)
 for(let m = -depth; m <= depth; m++){
  if(n == 0 && m==0)
    continue;

  let cf = z.div(w1.mul(n).add(w2.mul(m)));
  result = result.mul(cf.mul(-1).add(1,0).mul((cf.add(cf.pow(2,0).mul(0.5,0))).exp()));
}
 return result;
}

weierstrass_p = function(z, depth = 3) 
{
  let result = z.pow(-2);

 for(let n = -depth; n <= depth; n++)
 for(let m = -depth; m <= depth; m++){
  if(n == 0 && m==0)
    continue;
  let l = new Complex(n, m);
  result = result.add((z.sub(l).pow(-2)).sub(l.pow(-2)))
}
 return result;
}

weierstrass_zeta = function(z, depth=3) 
{
  let result = z.inverse();

 for(let n = -depth; n <= depth; n++)
 for(let m = -depth; m <= depth; m++){
  if(n == 0 && m==0)
    continue;
  let l = new Complex(n, m);
  result = result.add((z.sub(l)).inverse().add(l.inverse()).add(z.mul(l.pow(-2))))
}
 return result;
}

// Augments a p5 instance with the capability to draw domain colourings. 
// TODO: improve performance
//       - could perhaps implement complex function parsing to shader compilation (may be a lot of work)
let p5_lib_domaincol = p => {
    p.complex_to_color = function({"re": x, "im": y}){
        return p.color(p.atan2(y, -x)/TWOPI + 0.5, 1, 0.5);
    }
    
    p.dom_col_res = {"x":120, "y":120};
    p.domain_col = function(f, x_min = -2, y_min = -2, x_max = 2, y_max = 2){
      p.colorMode(p.HSL,1,1,1);
      p.noStroke();

      let scale_x = (x_max - x_min) / p.dom_col_res.x;
      let scale_y = (y_max - y_min) / p.dom_col_res.y;

      let img = p.createImage(p.dom_col_res.x, p.dom_col_res.y);

      for(let x = 0; x < p.dom_col_res.x; x++)
          for(let y = 0; y < p.dom_col_res.y; y++)
          {
              let z = new Complex(x * scale_x + x_min, y * scale_y + y_min)
              let fz = f(z);
              let cz = p.complex_to_color(fz);
              img.set(x,y,cz);
          }
      img.updatePixels();
      p.scale(3);
      p.image(img, 0, 0);
      }
}

// Augments p5 instance with
// parameterised surface drawing capabilities.
let p5_lib_surfaceparam = function(p){
    p.createSurfaceGeom = function (f, res_x, res_y){
        let geom = new p5.Geometry();
        geom.gid = "surf`"
        for(let x = 0; x <= res_x; x++)
        for(let y = 0; y <= res_y; y++)
        {
            let x_scaled = x/res_x;
            let y_scaled = y/res_y;
            let pos = f(x_scaled, y_scaled);
            geom.vertices.push(p.createVector(pos[0], pos[1], pos[2]));
            
            let a = x*(res_y+1) + y;
            let b = a + 1;
            let c = a + (res_y+1);
            let d = c + 1;

            if(x < res_x && y < res_y)
                geom.faces.push([a,b,d],[a,d,c]);
            if(x < res_x)
                geom.edges.push([a,c]);
            if(y < res_y)
                geom.edges.push([a,b]);
        }
        return geom;
    }
}

let p5_lib_controls = function(p){
  p.createMargin = function(){
	let margin = document.createElement("div");
    margin.setAttribute("class", "sidenote");
    document.getElementById(p.canvas_id).appendChild(margin);
	return margin;
  }
	p.createBr = function(parent){
		let br = document.createElement("br");
		parent.appendChild(br);
		return br;
	}
	p.createP = function(text, parent){
		let par = document.createElement("p");
		par.innerHTML = text;
		parent.appendChild(par);
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, par]);
		return par;
	}
	p.createTitle = function(text, parent){
		let title = document.createElement("h3");
		title.innerHTML = text;
		parent.appendChild(title);
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, title]);
		return title;
	}
  p.createSlider = function(){
    let sl = document.createElement("input");
    sl.type="range";
    sl.min = 0;
    sl.max = 1;
    sl.step = 0.01;
    document.getElementById(p.canvas_id).appendChild(sl);
    return sl;
  }
  p.createButton = function(text, onclick, parent){
	let button = document.createElement("button");
	button.innerHTML = text;
	button.onclick = onclick;
    parent.appendChild(button);
	MathJax.Hub.Queue(["Typeset", MathJax.Hub, button]);
    return button;
  }
}

let p5_lib_axes = function(p){
    p.draw_axes = function(scale, weight = 2){
      p.push();
        p.strokeWeight(weight);
        //p.gl.disable(p.gl.DEPTH_TEST);
        p.stroke(255,0,0);
        p.line(0,0,0, scale,0,0);
        p.stroke(0,255,0);
        p.line(0,0,0, 0,-scale,0);
        p.stroke(0,0,255);
        p.line(0,0,0, 0,0,scale);
    p.pop();
    }
    p.draw_ground = function(){
      //console.log("this is too slow");
      return;
      p.strokeWeight(1);
      p.stroke(255,255,255,50);
      for(let i = 0; i < 21; i++){
          p.line(i*0.1-1,0, -1, i*0.1-1,0, 1);
          p.line(-1,0,i*0.1-1, 1,0, i*0.1-1);
      }
    }
}

let p5_lib_arrows = function(p){
  p.arrowHead = function(x, y, dir, head_size = 8){
    let perp = [dir[1], -dir[0]];
    p.line(x, y, x + (perp[0]-dir[0]) * head_size, y + (perp[1]-dir[1]) * head_size);
    p.line(x, y, x + (-perp[0]-dir[0]) * head_size, y + (-perp[1]-dir[1]) * head_size);
	}
  p.arrow = function(x0,y0,x1,y1,head_size){
    let dir = v_normalise([x1 - x0, y1 - y0]);
    let perp = v_normalise([dir[1], -dir[0]]);
    p.line(x0, y0, x1, y1);
    p.line(x1, y1, x1 + (perp[0]-dir[0]) * head_size, y1 + (perp[1]-dir[1]) * head_size);
    p.line(x1, y1, x1 + (-perp[0]-dir[0]) * head_size, y1 + (-perp[1]-dir[1]) * head_size);
  }
}

p5_lib_world_orientation_interaction = function(p, world_transform) {
    if(undefined === world_transform)
      p.world_transform = {mat: mat4_id, rot_xz: 0, rot_yz: 0};
    else
      p.world_transform = world_transform;

    p.mouse_sensetivity = 0.01;
    p.clickStartedInCanvas = false;

	p.setWorldRot = function(rot_xz, rot_yz){
            p.world_transform.rot_xz = rot_xz;
            p.world_transform.rot_yz = rot_yz;
            p.world_transform.mat = mm_prod(rot4_xz_yw(p.world_transform.rot_xz, 0.0), rot4_xw_yz(0.0,p.world_transform.rot_yz), 4);
	}

    p.interactOnPressed = function(){
        if(p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height)
			p.clickStartedInCanvas = true;
		else
			p.clickStartedInCanvas = false;
    }
    p.interactOnDragged = function(){
        if(p.clickStartedInCanvas){
            p.world_transform.rot_xz += (p.mouseX - p.pmouseX) * p.mouse_sensetivity;
            p.world_transform.rot_yz += (p.mouseY - p.pmouseY) * p.mouse_sensetivity;
			p.world_transform.rot_yz = Math.max(Math.min(p.world_transform.rot_yz,PI/2),-PI/2);
            p.world_transform.mat = mm_prod(rot4_xz_yw(p.world_transform.rot_xz, 0.0), rot4_xw_yz(0.0,p.world_transform.rot_yz), 4);
        }
    }

	// p.mousePressed = function(){p.interactOnPressed();}
	// p.mouseDragged = function(){p.interactOnDragged();}
}

p5_lib_rotation_selection = function(p){
	p.handleRotationSelectionInput = function(){
			p.v1_vec = p.screenToWorld(p.mouseX, p.height-p.mouseY, 0.8).sub(p.screenToWorld(p.mouseX, p.height-p.mouseY, 0.2));
			p.v1 = v_normalise([p.v1_vec.x, p.v1_vec.y, p.v1_vec.z]);
			if(p.v0 != undefined && p.mouseIsPressed && p.clickStartedOnRight){
				p.v0xv1 = vv_cross(p.v0, p.v1);
				let rot_change = angleaxis_to_matrix(vs_prod(p.v0xv1,12));
				p.rot = mm_prod(p.rot, rot_change,3);
				p.points_updated = false;
			}
			p.v0 = [p.v1[0], p.v1[1], p.v1[2]];
	}
}
	
// Functions for creating special mini-sketches to be used as inputs to other sketches
input_square_creator = function(name, parent, width, height) {
    let input_container = document.createElement("div");
    input_container.setAttribute("id", name);
    input_container.setAttribute("class", "input-sketch");
    parent.appendChild(input_container);
    return (p) => {
        p.canvas_id = name;
        p.val_x = 0;
        p.val_y = 0;
        p.clickInCanvas= false;
        p.setup = function(){
            p.canvas = p.createCanvas(width, height);
            p.canvas.parent(p.canvas_id);
        }
        p.mousePressed = function(){
          if(p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height)
            p.clickInCanvas = true;
          else
            p.clickInCanvas = false;
        }
        p.mouseReleased = function(){
          p.clickInCanvas = false;
        }
        p.mouseDragged = function(){
          if(!p.clickInCanvas)
            return;
          p.val_x = clamp(p.mouseX, 0, p.width-1)/p.width;
          p.val_y = clamp(p.mouseY, 0, p.height-1)/p.height;
        }
        p.draw = function(){
            p.background(0,0,0);
            p.ellipse(p.val_x * p.width, p.val_y * p.height, 20);
        }   
    }
}

input_rotation_creator = function(name, parent, html_parent, width, height) {
    let input_container = document.createElement("div");
    input_container.setAttribute("id", name);
    input_container.setAttribute("class", "input-sketch");
    document.getElementById(parent.canvas_id).appendChild(input_container);
    return (p) => {
        p5_lib_axes(p);
        p5_lib_world_orientation_interaction(p, parent.world_transform); // By putting parent.world_transform in the 2nd arg, we tell this sketch to share the world orientation with it's parent, allowing interaction with either this sketch or it's parent.
        p.canvas_id = name;
        p.val_x = 0;
        p.val_y = 0;
        p.val_z = 0;
        p.clickInCanvas = false;
        p.html_parent = html_parent;
        p.setup = function(){
            p.noStroke();
            p.canvas = p.createCanvas(width, height, p.WEBGL);
            p.canvas.parent(p.canvas_id);
            p.html_parent.appendChild(document.getElementById(p.canvas_id));
        }
        p.mousePressed = function(){
          p.interactOnPressed();
        }
        p.mouseReleased = function(){
          p.clickStartedInCanvas = false;
        }
        p.mouseDragged = function(){
          if(!p.clickStartedInCanvas)
            return;
          // only interact as world rotation if a gimbal axis was not selected.
          p.interactOnDragged();
          // Here we want to do gimbal rotations relative to world
        }
        p.draw = function(){
            p.scale(100);
            p.background(255);
            p.applyMatrix(parent.world_transform.mat);
            p.push();

				p.rotateX(p.val_x);
				p.rotateY(-p.val_y);
				p.rotateZ(-p.val_z);
              p.fill(0,0,255);
              p.torus(1,0.05,64,12);
              
              p.push();
                p.rotate(p.PI/2,[0,1,0]);
                p.fill(255,0,0);
                p.torus(1,0.05,64,12);
              p.pop();

              p.rotate(p.PI/2,[1,0,0]);
              p.fill(0,255,0);
              p.torus(1,0.05,64,12);
            p.pop()
            p.draw_ground();
            p.draw_axes(0.5);
        }   
    }
}

// returns point [x, y, z] in ball of radius r.
random_point_in_ball = function(r){
	let v = [(Math.random()-0.5)*2,(Math.random()-0.5)*2,(Math.random()-0.5)*2];
	while(v_len(v) >= 1)
		v = [(Math.random()-0.5)*2,(Math.random()-0.5)*2,(Math.random()-0.5)*2];
	return vs_prod(v, r);
}

random_in_cube = function(n){
	let v = [];
	for(let i = 0; i < n; i++)
		v.push((Math.random()-0.5)*2);
	return v;
}

random_point_on_sphere = function(dim = 3){
	let v = random_in_cube(dim);
	while(v_len(v) >= 1)
		v = random_in_cube(dim);
	return v_normalise(v);
}

function p5_lib_so3_core(p){

	p.initialise_points = function(...args){
		p.points = [];

		let t_0 = args[0];
		let t_1 = args[1];
		let t_2 = args[2];

		//initialise points
		let res = 32;
		for(let i = 0; i <=res; i++)
			for(let j = 0; j <= res; j++)
				p.points.push(mult_so3([t_0,t_1,t_2], [0,0,(i/res-0.5)*TWOPI*0.9999],[j/res*TWOPI*0.9999,0,0]));

		p.n_points = p.points.length;
		p.background(255,255,255);
	}

	p.initialiseSO3PointsRandom = function(n){
		p.points = [];
		p.n_points = n;
		for(let i = 0; i < p.n_points; i++)
			p.points.push(matrix_to_angleaxis(SU2_to_rot_matrix(random_point_on_sphere(4))));
	}

	p.draw_outline_ball = function(r){
		p.push();
			p.scale(r);
			p.gl.disable(p.gl.DEPTH_TEST);
			p.fill(255,255,255,10);
			p.sphere(1,32,32);

			p.stroke(0,0,0,30);
			p.strokeWeight(2);
			p.rotateX(HALF_PI);
			p.ellipse(0,0,2,2,50);
			p.gl.enable(p.gl.DEPTH_TEST);
		p.pop();
	}

	p.draw_points = function(points){
		p.beginShape(p.POINTS);
		for(let i = 0; i < points.length; i++)
		{
			p.vertex(points[i][0], points[i][1], points[i][2]);
		}
		p.endShape();
	}

	p.draw_points_plane = function(points){
		p.beginShape(p.POINTS);
		for(let i = 0; i < points.length; i++)
			p.vertex(points[i][0], PI, points[i][2]);
		p.endShape();
	}

	p.draw_spheres = function(points){
		p.push();
		for(let i = 0; i < points.length; i++){
			let offset = points[i]; 
			p.push();
			p.translate(offset[0], offset[1], offset[2]);
			p.sphere(0.1,4,4);
			p.pop();
		}
		p.pop();
	}
	p.draw_angle_axis_markers = function(rotAxis, theta, lab_axis, lab_theta){
		p.push();
		p.noFill();
		let rotaxis_to_u = v_normalise(vv_cross(rotAxis, [0,0,1]));
		let rotangle_to_u = Math.acos(vv_dot(v_normalise(rotAxis), [0,0,1]));
		let rotMat = angleaxis_to_matrix(vs_prod(rotaxis_to_u, rotangle_to_u));

		let angle_ref_vec = vv_cross(rotaxis_to_u, rotAxis);
		let angle_start_vec = mv_prod(mat3_T(rotMat),[1,0,0]);

		p.applyMatrix(mat3_to_mat4(rotMat));
		p.setAnnotationPos3right(lab_axis, [0,0,3.7]);

		// draw axis of rotation
		p.stroke(0);
		p.strokeWeight(2);
		p.line(0,0,-3,   0,0,3);
		p.push();
			p.translate(0,0,3);
			p.rotateX(HALF_PI);
			p.cone(0.05,0.18);
		p.pop();

		// this keeps the starting point for the arc consistent as u changes
		let arc_start = Math.atan2(vv_dot(angle_start_vec, rotaxis_to_u), vv_dot(angle_start_vec, angle_ref_vec));

		p.arc(0,0, 4,4, arc_start-theta,arc_start);

		let arc_start_pos = [Math.cos(arc_start),Math.sin(arc_start)];
		let arc_end_pos = [Math.cos(arc_start-theta),Math.sin(arc_start-theta)];
		p.line(0,0, arc_start_pos[0]*2, arc_start_pos[1]*2);

		// Right angle square
		p.line(0,0,0.25, arc_start_pos[0]*0.25, arc_start_pos[1]*0.25,0.25);
		p.line(arc_start_pos[0]*0.25, arc_start_pos[1]*0.25,0, arc_start_pos[0]*0.25, arc_start_pos[1]*0.25,0.25);

		p.setAnnotationPos3right(lab_theta, [Math.cos(arc_start - theta)*2, Math.sin(arc_start - theta)*2, 0]);
		p.translate(arc_end_pos[0]*2, arc_end_pos[1]*2);
		p.rotateZ(arc_start-theta+PI);
		p.cone(0.05,0.18);
		p.pop();
	}
}

p5_lib_annotations = function(p){
	p.createAnnotation = function(x, y, text, bg = false){
		let ann = document.createElement("div");
		ann.innerText = text;
		ann.setAttribute("class", "annotation");
		ann.style.left = x+"px";
		ann.style.top = y+"px";
		ann.style.backgroundColor = (bg ? "white" : "");
		ann.style.padding = (bg ? "0px 3px 0px 3px" : "0");
		document.getElementById(p.canvas_id).appendChild(ann);
		MathJax.Hub.Queue(["Typeset", MathJax.Hub, ann]);
		return ann;
	}
	p.setAnnotationPos = function(ann, x, y){
		ann.style.left = x+"px";
		ann.style.top = y+"px";
	}
	p.setAnnotationPos3 = function(ann, pos, offset = [0,0]){
		let sp = p.worldToScreen(pos[0], pos[1], pos[2]);
		ann.style.left = (sp.x+offset[0])+"px";
		ann.style.top = (sp.y+offset[1])+"px";
	}

	// these apply the necessary transformations when using framebuffers with half the width of the original frame. worldToScreen seems to still assume that the screen is the whole screen rather than the framebuffer.
	p.setAnnotationPos3left = function(ann, pos, offset = [0,0]){
		let sp = p.worldToScreen(pos[0], pos[1], pos[2]);
		ann.style.left = (sp.x/2+offset[0])+"px";
		ann.style.top = (p.height-sp.y+offset[1])+"px";
	}
	p.setAnnotationPos3right = function(ann, pos, offset = [0,0]){
		let sp = p.worldToScreen(pos[0], pos[1], pos[2]);
		ann.style.left = (sp.x/2+offset[0]+p.width/2)+"px";
		ann.style.top = (p.height-sp.y+offset[1])+"px";
	}
}

