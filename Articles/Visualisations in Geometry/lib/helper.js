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
