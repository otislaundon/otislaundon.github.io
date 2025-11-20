let dom_col_weierstrass_p = new p5((p) => {
    p5_lib_domaincol(p);
    p.canvas_id = "sketch:dom-col-weierstrass-p";

    p.setup = function(){
        p.canvas = p.createCanvas(360, 360);
        p.canvas.parent(p.canvas_id);
        p.domain_col(weierstrass_p);
    }
})

