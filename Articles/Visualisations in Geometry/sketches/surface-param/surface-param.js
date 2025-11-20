let surface_param = new p5((p) => {
    p5_lib_surfaceparam(p);
    p.canvas_id = "sketch:surface-param";

    p.surface = function(a, b){
        return [
            cos(TWOPI * a),
            sin(TWOPI * a),
            b*2-1
            ]
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
        p.rotate(-PI/6, [0,1,0]);

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
    p.homotopy_surface = function(){
        p.push();
        p.scale(50);

        p.draw_homotopy_sphere();
        p.draw_parameterised_surface();
        p.draw_parameterised_path();

        p.pop()
    }

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360, p.WEBGL);
        p.canvas.parent(p.canvas_id);

        // create input slider
        p.slider1 = document.createElement("input");
        p.slider1.type="range";
        p.slider1.min = 0;
        p.slider1.max = 1;
        p.slider1.step = 0.01;
        p.slider1.oninput = (e) => {p.slider1_val = e.target.value};
        document.getElementById(p.canvas_id).appendChild(p.slider1);

        p.surface_geom = p.createSurfaceGeom(p.surface, 50,10);

        p.GL = p._renderer.GL;

        p.colorMode(p.HSL, 1);

        p.stroke(0);
        p.strokeWeight(1);
    }

    p.draw = function(){
        p.path_geom = p.createPathGeom((x) => p.surface(x, p.t%1), 50);

        p.background(0);
        p.orbitControl();
        p.homotopy_surface();

        p.t = p.slider1_val;
    }

})