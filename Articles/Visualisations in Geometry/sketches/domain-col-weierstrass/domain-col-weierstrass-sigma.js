let dom_col_weierstrass_sigma = new p5((p) => {
    p5_lib_domaincol(p);
    p.canvas_id = "sketch:dom-col-weierstrass-sigma";

    p.setup = function(){
        p.canvas = p.createCanvas(360, 360);
        p.canvas.parent(p.canvas_id);
        p.domain_col(weierstrass_sigma, -2.25, -2.25, 2.25, 2.25);
    }
})

