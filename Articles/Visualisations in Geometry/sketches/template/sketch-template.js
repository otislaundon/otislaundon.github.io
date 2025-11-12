let sketch_template = new p5((p) => {
    p.canvas_id = "sketch:template";

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360);
        p.canvas.parent(p.canvas_id);

        p.strokeWeight(10);
    }

    p.t = 0;
    p.draw = function(){
        p.t += p.deltaTime / 1000;

        p.noStroke();
        p.circle(p.width/2,p.height/2,110);
        p.stroke(0);
        p.line(p.width/2,p.height/2,p.width/2 + p.cos(p.t/12) * 40, p.height/2+ p.sin(p.t/12) * 40, 20);
        p.line(p.width/2,p.height/2,p.width/2+ p.cos(p.t) * 50, p.height/2+ p.sin(p.t) * 50, 20);
    }
})

