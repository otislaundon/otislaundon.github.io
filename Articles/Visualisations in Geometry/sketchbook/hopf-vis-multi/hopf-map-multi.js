let sketch_hopf_map_multi = new p5((p) => {
    p.canvas_id = "sketch:hopf-map-multi";

    p.setup = function(){
        p.canvas = p.createCanvas(1440, 720);
        p.x = v_normalise([0.1,0.1,-0.1,-0.7]);
        console.log(p.x);
    }

    p.draw_points = function(points){
        for(let i = 0; i < points.length; i += 2){
            p.circle(points[i], points[i+1], 0.025);
        }
    }

    p.draw = function(){
        p.background(255,0,0);
        p.noStroke();
        p.push();
        p.translate(p.width/2, p.height/2);
        p.push();
        p.translate(360,0);
        p.scale(700);
        p.circle(0,0,1);
        p.pop();
        p.push();
        p.translate(-360,0);
        p.scale(700);
        p.circle(0,0,1);
        p.fill(0,0,255);
        p.draw_points(p.x);
        p.pop();
        p.pop();
    }
})


