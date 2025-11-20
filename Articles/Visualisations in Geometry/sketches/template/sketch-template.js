let sketch_template = new p5((p) => {
    p.canvas_id = "sketch:template";

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360);
        p.canvas.parent(p.canvas_id);
    }

    p.draw = function(){

    }
})

