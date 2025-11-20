//returns whether html element intersects viewport
const isVisibleInViewport = (element) => {
    const rect = element.getBoundingClientRect()
    return (
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    )
}

const sum = (x) => x.reduce((partial_sum, a) => (partial_sum + a), 0);
const v_length = (x) => Math.sqrt(sum(x.map((a) => a*a)));
const v_normalise = (x) => {let l = v_length(x); return x.map((a) => a/l)};

// This function takes in a p5 instance and adds to it drawing functions in R4
// We will create simmilar libraries potentially for hyperbolic or other drawing methods.
let augment_p5_instance = function(p){
  p.R4_to_screen = function(a)
  {
    a = vv_add(a, [0,0,0,2]);
    let a_pos3 = project_stereo(a);
    a_pos3 = vv_add(a_pos3, [0,0,3]);
    let a_pos2 = project_stereo(a_pos3);
    a_pos2 = mv_prod(p.clip_to_screen, a_pos2);
    return vv_add([p.width/2, p.height/2], a_pos2);
  }

  p.lineR4 = function(a, b) 
  { 
    let a_screen = p.R4_to_screen(mv_prod(MODEL_MAT4, a));
    let b_screen = p.R4_to_screen(mv_prod(MODEL_MAT4, b));
    p.line(a_screen[0], a_screen[1], b_screen[0], b_screen[1]);
  }

  p.point_R4 = function(a){
      let a_screen = p.R4_to_screen(mv_prod(MODEL_MAT4, a));
      p.circle(a_screen[0], a_screen[1], 0.0);
  }

  /**
   * 
   * @param {vertices, indices, colors?} mesh
   */
  p.draw_wire_mesh_r4 = function(mesh)
  {
      for(let i = 0; i < mesh.indices.length; i += 2){
          let edge = [mesh.indices[i], mesh.indices[i+1]]; 
          if(mesh.colors != null)
              p.stroke(mesh.colors[i/2]);
          p.lineR4(mesh.vertices[edge[0]], mesh.vertices[edge[1]]);
      }
  }

  function draw_wire_mesh_r4_webgl()
  {
    //TODO: Implement mesh drawing with 4d coordinates in webgl instead of software renderer.
  }
}

project_stereo = function(v){
  return v.slice(0,-1).map((e) => e / v[v.length - 1]);
}

// w should be a complex number from math.js
weierstrass_sigma = function(z, depth=2){

 let result = new Complex(z);
 let w1 = new Complex(1,0);
 let w2 = new Complex(0,1);

 for(let n = -depth; n <= depth; n++)
 for(let m = -depth; m <= depth; m++){
  if(n == 0 && m==0)
    continue;

  let cf = z.div(w1.mul(n).add(w2.mul(m)));
  result = result.mul(cf.mul(-1).add(1,0).mul((cf.add(cf.pow(2,0).mul(0.5,0))).exp()));
}
 return result;
}

weierstrass_p = function(z, depth = 3) 
{
  let result = new Complex(z);

 for(let n = -depth; n <= depth; n++)
 for(let m = -depth; m <= depth; m++){
  if(n == 0 && m==0)
    continue;
  let l = new Complex(n, m);
  result = result.add(((z.sub(l)).pow(2)).inverse().sub(l.inverse()))
}
 return result.add(z.pow(2).inverse());
}

weierstrass_zeta = function(z, depth=3) 
{
  let result = new Complex(z);

 for(let n = -depth; n <= depth; n++)
 for(let m = -depth; m <= depth; m++){
  if(n == 0 && m==0)
    continue;
  let l = new Complex(n, m);
  result = result.add((z.sub(l)).inverse().add(l.inverse()).add(z.mul(l.pow(-2))))
}
 return result.add(z.inverse());
}

weierstrass_e1 = 6.87519;

// Augments a p5 instance with the capability to draw domain colourings. 
// TODO: improve performance
//       - could perhaps implement complex function parsing to shader compilation (may be a lot of work)
let p5_lib_domaincol = p => {
    p.complex_to_color = function({"re": x, "im": y}){
        return p.color(p.atan2(y, -x)/TWOPI + 0.5, 1, 0.5);
    }
    
    p.dom_col_res = {"x":120, "y":120};
    p.domain_col = function(f, x_min = -2, y_min = -2, x_max = 2, y_max = 2){
      p.colorMode(p.HSL,1,1,1);
      p.noStroke();

      let scale_x = (x_max - x_min) / p.dom_col_res.x;
      let scale_y = (y_max - y_min) / p.dom_col_res.y;

      let img = p.createImage(p.dom_col_res.x, p.dom_col_res.y);

      for(let x = 0; x < p.dom_col_res.x; x++)
          for(let y = 0; y < p.dom_col_res.y; y++)
          {
              let z = new Complex(x * scale_x + x_min, y * scale_y + y_min)
              let fz = f(z);
              let cz = p.complex_to_color(fz);
              img.set(x,y,cz);
          }
      img.updatePixels();
      p.scale(3);
      p.image(img, 0, 0);
      }
}

// Augments p5 instance with
// parameterised surface drawing capabilities.
let p5_lib_surfaceparam = p => {
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
}