let sketch_hypercube = new p5((p) => { //begin sketch scope

augment_p5_instance(p); // adds 4d drawing functions
p5_lib_arrows(p);
p5_lib_axes(p);
p5_lib_world_orientation_interaction(p);

p.theta = 0;
p.canvas_id = "sketch:hypercube";
p.canvas_holder = document.getElementById(p.canvas_id);
console.log(p.canvas);

let sketch_l = Object.assign(document.createElement("div"), {className: "sketch-l"});
let sketch_tr = Object.assign(document.createElement("div"), {className: "sketch-tr"});
let sketch_br = Object.assign(document.createElement("div"), {className: "sketch-br"});

p.canvas_holder.appendChild(sketch_l);
p.canvas_holder.appendChild(sketch_tr);
p.canvas_holder.appendChild(sketch_br);

p.setup = function(){
    p.canvas = p.createCanvas(480, 480, p.WEBGL);
    sketch_l.appendChild(p.canvas.elt);
    console.log(p.canvas);
    
    p.clip_to_screen = [
        p.height/2,0      ,
        0      ,p.height/2];

    p.hypercube_mesh = mesh_cube(4);

    //p.SO3_1 = input
    p.input_1 = new p5(input_rotation_creator("input_1", p, sketch_tr, 240, 240));
    p.input_2 = new p5(input_rotation_creator("input_2", p, sketch_br, 240, 240));
}

p.draw = function(){
    // don't do any drawing if not visible
    if(!isVisibleInViewport(p.canvas.elt))
        return;

    p.push();
    p.applyMatrix(p.world_transform.mat);
    p.scale(100);
    
    // Set the styles
    p.background(0);

    // draw an arrow

    // handle rotation input from keypresses
    if (p.keyIsPressed === true) 
        p.theta += p.deltaTime / 1000;
    
    // compute rotation matrix for hypercube object
    let phi = p.theta;
    let rot_double_xw_yz = rot4_xy_zw(p.theta, phi);
    let rot_xz = rot4_xz_yw(-p.mouseX / p.width * 2 * PI, 0);
    let rot_yz = rot4_xw_yz(0, p.mouseY / p.width * 2.0 * PI);
    let rot_stage = mm_prod(rot_yz, rot_xz, 4);
    MODEL_MAT4 = rot_double_xw_yz;
    MODEL_MAT4 = mm_prod(rot_stage, MODEL_MAT4, 4);

    p.stroke(200);
    p.strokeWeight(2)
    //p.draw_wire_mesh_r4(p.hypercube_mesh);

    p.strokeWeight(8);
    //p.draw_wire_mesh_r4(axes_mesh);

    p.draw_axes(1);
    p.draw_ground();
    p.pop();

    p.stroke(255);
    p.strokeWeight(2);
    p.arrow(230,120,120,70,20);
    p.arrow(230,-120,120,-70,20);

}

p.mousePressed = function(){
    p.interactOnPressed();
}
p.mouseReleased = function(){
    p.clickStartedInCanvas = false;
}
p.mouseDragged = function(){
    p.interactOnDragged();
}

}); //end sketch scope
