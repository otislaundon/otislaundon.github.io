let sketch_paths_of_rotations = new p5((p) => {
    p.canvas_id = "sketch:paths-of-rotations";

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360, p.WEBGL);
        p.canvas.parent(p.canvas_id);
    }

    p.homotopy = function(t){
        return function(theta){
            return {
            "angle": t * 0.001 + theta,
            "axis" : [p.sin(t*0.001), p.cos(t*0.001), 0.5]
            }
        }
    }

    p.draw_homotopy_cylinder = function(h, c, r){
        p.fill(1,1,1,0.1);
        p.noStroke();
        p.push();
        p.translate(c[0], c[1])
        p.sphere(r);
        p.pop();
    }

    p.t = 0;
    p.dtheta = 2*p.PI/20;
    p.draw = function(){
        // don't do any drawing if not visible
        if(!isVisibleInViewport(p.canvas.elt))
            return;
    
        p.background(255,255,255,0);
        
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
            p.box(70, 70, 70);
            p.pop();
        }

        p.draw_homotopy_cylinder(p.homotopy, [p.width / 2- 200, 0], 100);

        p.t += p.deltaTime;
    }
})

