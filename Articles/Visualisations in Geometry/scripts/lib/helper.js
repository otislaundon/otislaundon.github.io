function project_stereo(v){
  return v.slice(0,-1).map((e) => e / v[v.length - 1]);
}

function R4_to_screen(a)
{
  a = vv_add(a, [0,0,0,2]);
  let a_pos3 = project_stereo(a);
  a_pos3 = vv_add(a_pos3, [0,0,3]);
  let a_pos2 = project_stereo(a_pos3);
  a_pos2 = mat2x2_vec2_prod(clip_to_screen, a_pos2);
  return vv_add([width/2, height/2], a_pos2);
}

function lineR4(a, b) 
{ 
  let a_screen = R4_to_screen(mv_prod(MODEL_MAT4, a));
  let b_screen = R4_to_screen(mv_prod(MODEL_MAT4, b));
  line(a_screen[0], a_screen[1], b_screen[0], b_screen[1]);
}

function pointR4(a){
    let a_screen = R4_to_screen(mv_prod(MODEL_MAT4, a));
    circle(a_screen[0], a_screen[1], 0.0);
}

/**
 * 
 * @param {vertices, indices, colors?} mesh
 */
function draw_wire_mesh_r4(mesh)
{
    for(let i = 0; i < mesh.indices.length; i += 2){
        let edge = [mesh.indices[i], mesh.indices[i+1]]; 
        if(mesh.colors != null)
            stroke(mesh.colors[i/2]);
        lineR4(mesh.vertices[edge[0]], mesh.vertices[edge[1]]);
    }
}

function draw_wire_mesh_r4_webgl()
{
  //TODO: Implement mesh drawing with 4d coordinates in webgl instead of software renderer.
}