// rename this to sketch_<SKETCH NAME>
let sketch_template = new p5((p) => {
    // rename this to "sketch:<SKETCH NAME>"
    p.canvas_id = "sketch:template";

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360);
        p.canvas.parent(p.canvas_id);
    }

    p.draw = function(){

    }
})

