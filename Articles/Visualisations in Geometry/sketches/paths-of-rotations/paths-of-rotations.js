let sketch_paths_of_rotations = new p5((p) => {
    p.canvas_id = "sketch:paths-of-rotations";
    p5_lib_surfaceparam(p);
    p5_lib_controls(p);

    p.surface = function(a, b){
        return vv_lerp([0,0,0], [sin(TWOPI*a), -2, cos(TWOPI*a)], b);
    }

    // TODO: fix this jank!!! randomising the gid is a terrible solution.
    p.createPathGeom = function(f, res){
        let geom = new p5.Geometry();
        geom.gid = "path"+p.random(100000);
        for(let x = 0; x <= res; x++)
        {
            let x_scaled = x/res;
            let pos = f(x_scaled);
            geom.vertices.push(p.createVector(pos[0], pos[1], pos[2]));
            if(x <res)
                geom.edges.push([x, x+1]);
        }
        return geom;
    }

    p.draw_homotopy_sphere = function(){
        p.noStroke();
        p.fill(p.color(1,1,1,0.1))
        p.GL.disable(p.GL.DEPTH_TEST);
        p.sphere(PI);
    }
    p.draw_parameterised_surface = function(){
        p.GL.enable(p.GL.DEPTH_TEST);

        p.noStroke();
        p.stroke(1,0,0.85);
        p.fill(1,0,0.75, 255);
        p.strokeWeight(1);
        p.model(p.surface_geom);
    }

    p.draw_parameterised_path =function(){
        p.stroke(1,1,0.5);
        p.GL.disable(p.GL.DEPTH_TEST);
        p.model(p.path_geom);
    }

    p.draw_parameterised_path_points =function(){
        p.GL.enable(p.GL.DEPTH_TEST);
        p.colorMode(p.HSL, 1);
        p.noStroke();
        for(let theta = 0; theta < 1; theta += 0.01){
            // Box
            p.push();
            p.fill(theta,1,0.6);
            
            let rot = p.surface(theta, p.t);
            p.translate(rot[0], rot[1], rot[2]);
            if(theta - 0.01/2 < p.slider_theta.value && theta + 0.01 > p.slider_theta.value)
            {
                p.fill(theta,1,0.2);
                p.sphere(0.12, 5,5);
            }else{
                p.sphere(0.05, 5,5);
            }
            p.pop();
        }
    }

    p.homotopy_surface = function(){
        p.draw_homotopy_sphere();
        p.draw_parameterised_surface();
        //p.draw_parameterised_path();
        p.draw_parameterised_path_points();
    }

    p.draw_rotation_path = function(path, object)
    {
        p.GL.enable(p.GL.DEPTH_TEST);
        p.colorMode(p.HSL, 1);
        p.stroke(1,0,1);
        p.strokeWeight(0.5);
        for(let theta = 0; theta < 1; theta += 0.01){
            // Box
            p.push();
            p.fill(theta,1,0.6);
            p.translate(3*p.cos(theta * TWOPI), 3 * p.sin(theta * TWOPI), 0);
            p.rotate(theta*TWOPI,[0,0,1]);
            
            let rot = p.surface(theta, p.t);
            let angle = v_length(rot);
            let axis = v_normalise(rot);
            if(angle != 0)
            p.rotate(angle,axis);
            p.scale(1);
            p.box(0.1,0.5,1);
            p.pop();
        }
    }

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360, p.WEBGL);
        p.canvas.parent(p.canvas_id);

        p.slider_t = p.createSlider("t");
        p.slider_theta = p.createSlider("theta");

        p.surface_geom = p.createSurfaceGeom(p.surface, 50, 10);

        p.GL = p._renderer.GL;

        p.colorMode(p.HSL, 1);

        p.stroke(0);
        p.strokeWeight(1);
    }

    p.orientation = mat4_id;
    p.obj_rot_yaw = 0;
    p.obj_rot_pitch = 0;
    p.mouse_sensetivity = 0.01;
    p.interact = function(){
        p.orientation = mm_prod(rot4_xz_yw(p.obj_rot_yaw, 0.0), rot4_xw_yz(0.0,p.obj_rot_pitch), 4);
        console.log(p.obj_rot_pitch);
    }

    p.mousePressed = () => {
        if(p.mouseX > 0 && p.mouseY > 0 && p.mouseX < p.width && p.mouseY < p.height)
        p.clickStartedInCanvas = true;
        
        console.log(document.getElementById(p.canvas_id).matches(':hover'))
    }
    p.mouseReleased = () => {
        p.clickStartedInCanvas = false;
    }

    p.mouseDragged = function(){
        if(p.clickStartedInCanvas){
            p.obj_rot_yaw += (p.mouseX - p.pmouseX) * p.mouse_sensetivity;
            p.obj_rot_pitch += (p.mouseY - p.pmouseY) * p.mouse_sensetivity;
        }
    }

    p.draw = function(){

        p.background(0);

        p.interact();
        //p.orientation = mm_prod(p.orientation, rot4_xz_yw(0.01,0), 4);

        p.push();
        p.scale(40);

        p.push();
        p.translate(4,0,0);
        p.applyMatrix(p.orientation);
        p.homotopy_surface();
        p.pop();

        p.push();
        p.translate(-4,0,0);
        p.applyMatrix(p.orientation);
        p.draw_rotation_path(p.homotopy)

        p.colorMode(p.HSL, 1);
        p.fill(p.slider_theta.value, 1, 0.5);
        let selected_rot = p.surface(p.slider_theta.value, p.slider_t.value);
        if(v_length(selected_rot) != 0)
            p.rotate(v_length(selected_rot), v_normalise(selected_rot));
        p.box(0.1,0.5,1);

        p.pop();
        p.pop();

        p.t = p.slider_t.value;
    }
})

