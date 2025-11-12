let sketch_paths_of_rotations = new p5((p) => {
    p.canvas_id = "sketch:paths-of-rotations";

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360, p.WEBGL);
        p.canvas.parent(p.canvas_id);

        p.perspective();

        p.gl = p._renderer.GL;

        p.colorMode(p.HSL, 1);
    }

    p.homotopy = function(t){
        return function(theta){
            return {
            "angle": t * 0.001 + theta - p.PI,
            "axis" : v_normalise([p.sin(t*0.001), p.cos(t*0.001), 0.5])
            }
        }
    }

    let TWOPI = 2*p.PI;
    p.draw_homotopy_cylinder = function(h, r, res_t = 4, res_theta = 4){
        p.fill(1,1,1,0.1);
        // draw the sphere
        p.noStroke();
        p.push();
        p.sphere(p.PI);
        p.pop();
        //draw the axes
        p.draw_axes();

        p.strokeWeight(1);
        p.stroke(0,0,0.8);
        for(let t = 0; t < 1; t += 1/res_t)
            for(let theta = 0; theta < TWOPI; theta += TWOPI/res_theta)
        {
            let h_0 = h(t)(theta);
            let h_1 = h(t)(theta + TWOPI/res_theta); 
            p.line(h_0["axis"][0] * h_0["angle"],
                 h_0["axis"][1] * h_0["angle"],
                 h_0["axis"][2] * h_0["angle"],
                 h_1["axis"][0] * h_1["angle"],
                 h_1["axis"][1] * h_1["angle"],
                 h_1["axis"][2] * h_1["angle"]
             );// this is really slow probably, indexing with strings.
        //console.log(h_0["angle"], h_0["axis"][0] * h_0["angle"] * r + c[0]);
        }
        
    }

    p.t = 0;
    p.dtheta = 2*p.PI/16;

    p.draw_axes = function(){

        p.strokeWeight(2);
        p.gl.disable(p.gl.DEPTH_TEST);
        p.stroke(0,1,0.5);
        p.line(0,0,0, p.PI,0,0);
        p.stroke(1/3,1,0.5);
        p.line(0,0,0, 0,-p.PI,0);
        p.stroke(2/3,1,0.5);
        p.line(0,0,0, 0,0,p.PI);
    }

    p.draw_rotation_path = function(path, object)
    {
        p.stroke(255,0,0);
        p.colorMode(p.HSL, 1);
        for(let theta = 0; theta < 2 * p.PI; theta += p.dtheta){
            p.stroke(theta/6.283, 1.0, 0.6);
            // Box
            p.push();
            p.translate(100 * p.cos(theta) - p.width/2 + 250, 100*p.sin(theta), 0);
            let rot = p.homotopy(p.t)(theta);
            let angle = rot.angle;
            let axis = rot.axis;
            p.rotate(angle,axis);
            //p.box(70, 70, 70);
            p.scale(20);
            p.draw_axes();
            p.pop();
        }
    }

    p.draw = function(){
        // don't do any drawing if not visible
        if(!isVisibleInViewport(p.canvas.elt))
            return;
    
        p.background(255,255,255,0);

        p.orbitControl();
        
        // the circle with objects of different rotations around them
        p.draw_rotation_path(p.homotopy(p.t));

        // the 3-sphere with homotopy visualised as a cylinder mapped into it
        p.push();
        p.translate(150,0,0);
        p.scale(30);
        p.draw_homotopy_cylinder(p.homotopy, 100);
        p.pop();

        p.t += p.deltaTime;
    }
})

