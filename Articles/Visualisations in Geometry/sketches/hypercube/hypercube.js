let sketch_hypercube = new p5((p) => { //begin sketch scope

augment_p5_instance(p); // adds 4d drawing functions

p.MODEL_MAT4 = mat4_id;

p.theta = 0;

p.setup = function(){
    p.canvas = p.createCanvas(720, 480);
    p.canvas.parent("sketch:hypercube");
    
    p.clip_to_screen = [
        p.height/2,0      ,
        0      ,p.height/2];

    p.clifford_mesh = mesh_clifford(64, 8);
    p.hypercube_mesh = mesh_cube(4);
}

p.draw = function(){
    // don't do any drawing if not visible
    if(!isVisibleInViewport(p.canvas.elt))
        return;

    // Set the styles
    p.background(0);

    if (p.keyIsPressed === true) 
        p.theta += p.deltaTime / 1000;
    
    let phi = p.theta;
    let rot_double_xw_yz = rot4_xy_zw(p.theta, phi);
    let rot_xz = rot4_xz_yw(-p.mouseX / p.width * 2 * PI, 0);
    let rot_yz = rot4_xw_yz(0, p.mouseY / p.width * 2.0 * PI);
    let rot_stage = mm_prod(rot_yz, rot_xz, 4);

    let ct = p.cos(p.theta);
    let st = p.sin(p.theta);

    MODEL_MAT4 = rot_double_xw_yz;
    MODEL_MAT4 = mm_prod(rot_stage, MODEL_MAT4, 4);

    p.stroke(200);
    p.strokeWeight(2)
    //p.draw_wire_mesh_r4(p.clifford_mesh);
    p.draw_wire_mesh_r4(p.hypercube_mesh);

    MODEL_MAT4 = rot_stage;

    p.strokeWeight(8);

    p.draw_wire_mesh_r4(axes_mesh);
}

}) //end sketch scope
