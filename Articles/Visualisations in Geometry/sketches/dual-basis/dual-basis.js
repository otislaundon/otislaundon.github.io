let sketch_dual_basis = new p5((p) => {
    p.canvas_id = "sketch:dual-basis";
    p5_lib_world_orientation_interaction(p);

    p.setup = function(){
        p.canvas = p.createCanvas(360, 360, p.WEBGL);
        p.canvas.parent(p.canvas_id);
        p.stroke(255);
        p.grid_size = 50;
    }

    p.draw_basis = function(basis, y){
        let n = 2;
        for(let i = -n; i <= n; i++){
            screenpos_a = vv_add(vs_mult(basis[0], -n), vs_mult(basis[1], i));
            screenpos_b = vv_add(vs_mult(basis[0],  n), vs_mult(basis[1], i));
            p.line(screenpos_a[0], y, screenpos_a[1], screenpos_b[0], y, screenpos_b[1]);
        }
        for(let i = -n; i <= n; i++){
            screenpos_a = vv_add(vs_mult(basis[1], -n), vs_mult(basis[0], i));
            screenpos_b = vv_add(vs_mult(basis[1],  n), vs_mult(basis[0], i));
            p.line(screenpos_a[0],y, screenpos_a[1], screenpos_b[0],y, screenpos_b[1]);
        }
    }

    p.draw = function(){
        p.background(0);
        p.push();
            p.scale(50);
            p.applyMatrix(p.orientation);

            p.draw_basis([[1,0], [0,1]]);

            p.stroke(0,0,255);
            p.draw_basis([[1,-0.5], [1,0]],-0.5);
        p.pop();
    }
})

