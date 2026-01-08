let sketch_pink_sketch = new p5((p) => {
    p.canvas_id = "sketch:pink_sketch";

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360);
        p.canvas.parent(p.canvas_id);
    }

    p.draw = function(){
        p.background(255,128,128);
    }
})

