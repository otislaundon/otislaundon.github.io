let surface_param = new p5((p) => {
    p.canvas_id = "sketch:surface-param";

    p.surface = function(a, b){
        return [
            cos(TWOPI * a),
            sin(TWOPI * a),
            b*2-1
            ]
    }

    p.IxI_color = function(a, b){
        //return p.color("#ff00ff")
        //return [255,0,255];
        return p.color(255,0,255, 255);
    }

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

    p.createSurfaceGeom = function (f, res_x, res_y){
        let geom = new p5.Geometry();
        geom.gid = "surf`"
        for(let x = 0; x <= res_x; x++)
        for(let y = 0; y <= res_y; y++)
        {
            let x_scaled = x/res_x;
            let y_scaled = y/res_y;
            let pos = f(x_scaled, y_scaled);
            geom.vertices.push(p.createVector(pos[0], pos[1], pos[2]));
            //let col = p.IxI_color(x_scaled, y_scaled);
            //geom.vertexColors.push(col);
            
            let a = x*(res_y+1) + y;
            let b = a + 1;
            let c = a + (res_y+1);
            let d = c + 1;

            if(x < res_x && y < res_y)
                geom.faces.push([a,b,d],[a,d,c]);
            if(x < res_x)
                geom.edges.push([a,c]);
            if(y < res_y)
                geom.edges.push([a,b]);
        }
        return geom;
    }

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360, p.WEBGL);
        p.canvas.parent(p.canvas_id);

        p.surface_geom = p.createSurfaceGeom(p.surface, 50,10);

        p.GL = p._renderer.GL;

        p.colorMode(p.HSL, 1);

        p.stroke(0);
        p.strokeWeight(1);
    }

    p.draw_homotopy_sphere = function(){
        p.push();

        p.scale(50);
        p.rotate(-PI/6, [0,1,0]);

        p.noStroke();
        p.fill(p.color(1,1,1,0.1))
        p.GL.disable(p.GL.DEPTH_TEST);
        p.sphere(PI);

        p.pop();
    }
    p.draw_parameterised_surface = function(){
        p.push()

        p.GL.enable(p.GL.DEPTH_TEST);
        
        p.scale(50);
        p.noStroke();
        p.stroke(1,0,0.85);
        p.fill(1,0,0.75, 255);
        p.strokeWeight(1);
        p.model(p.surface_geom);

        p.pop()
    }

    p.draw_parameterised_path =function(){
        p.push();

        p.scale(50);

        p.stroke(1,1,0.5);

        p.GL.disable(p.GL.DEPTH_TEST);
        p.model(p.path_geom);

        p.pop();
    }
    p.homotopy_surface = function(){
        p.draw_homotopy_sphere();
        p.draw_parameterised_surface();
        p.draw_parameterised_path();
    }
    p.t = 0;
    p.draw = function(){
        p.path_geom = p.createPathGeom((x) => p.surface(x, p.t%1), 50);

        p.background(0);
        p.orbitControl();
        p.homotopy_surface();
        p.t += 0.01;
    }

})


// Our vertex shader source as a string
let vert = `
precision highp float;

attribute vec3 aPosition;
attribute vec4 aVertexColor;

// The transform of the object being drawn
uniform mat4 uModelViewMatrix;

// Transforms 3D coordinates to 2D screen coordinates
uniform mat4 uProjectionMatrix;

// A custom uniform with the time in milliseconds
uniform float time;

varying vec4 vVertexColor;

void main() {
  // Apply the camera transform
  vec4 viewModelPosition = uModelViewMatrix * vec4(aPosition, 1.0);

  // Use the time to adjust the position of the vertices
  //viewModelPosition.x += 10.0 * sin(time * 0.01 + viewModelPosition.y *0.00 );

  // Tell WebGL where the vertex goes
  gl_Position = uProjectionMatrix * viewModelPosition;  

  vVertexColor = aVertexColor;
}
`;

let frag = `
precision highp float;

varying vec4 vVertexColor;

void main() {
  gl_FragColor = vVertexColor;
}
`