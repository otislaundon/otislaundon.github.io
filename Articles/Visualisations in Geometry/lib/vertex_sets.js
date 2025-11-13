let cos = Math.cos;
let sin = Math.sin;
let PI = Math.PI;
let TWOPI = 2 * PI;

function generate_hypercube_edgecolors(){
    let colors = [];
    // for each axis x, y, z, w, there are 8 edges aligned to it. We will enumerate these 8 edges for each axis and add them to the list of edges.
    // inside this loop we "alias" the axis as ijk, each time dropping one of the 4 axes.
    for(let i = 0; i < 2; i++)
    for(let j = 0; j < 2; j++)
    for(let k = 0; k < 2; k++)
    {
        // ijk = yzw
        colors.push(axes_colors_4[0]);
        // ijk = xzw
        colors.push(axes_colors_4[1]);
        // ijk = xyw
        colors.push(axes_colors_4[2]);
        // ijk = xyz
        colors.push(axes_colors_4[3]);
    }
    return colors;
}

function mesh_discrete(mesh){
    return {"vertices": mesh.vertices, "indices": []};
}

function mesh_circle(n){
    let vertices = [];
    let indices = [];
    for(let i = 0; i < n; i++){
        vertices.push([cos(i * 2*PI/n), sin(i * 2*PI/n)]);
        indices.push(i);
        indices.push((i+1)%n);
    }
    return {"vertices": vertices, "indices": indices};
}

const axes_mesh = {"vertices": [[0,0,0,0], [1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]],
    "indices": [0,1, 0,2, 0,3, 0,4],
    "colors": [[255,0,0], [0,255,0], [0,0,255], [255,128,255]]
}

function mesh_prod(meshes){
    if(meshes.length > 2)
        return mesh_prod([meshes[0], mesh_prod(meshes.slice(1))]);
    if(meshes.length == 2)
    {
        let mesh_a = meshes[0];
        let mesh_b = meshes[1];
        let b_vert_count = mesh_b.vertices.length;
        return {
            "vertices": mesh_a.vertices.map(a => mesh_b.vertices.map(b => [a, b].flat())).flat(),
            "indices": mesh_b.vertices.map((b, j) => mesh_a.indices.map(i => i * b_vert_count + j)).flat().concat(
                    mesh_a.vertices.map((a, i) => mesh_b.indices.map(j => i * b_vert_count + j)).flat()
            )
        }
    }
    return meshes[0];
}

function mesh_sum(meshes){
    if(meshes.length > 2)
        return mesh_prod([meshes[0], mesh_prod(meshes.slice(1))]);
    if(meshes.length == 2)
    {
        let va_count = meshes[0].vertices.length;
        return {
            "vertices" : meshes[0].vertices.concat(meshes[1].vertices),
            "indices" : meshes[0].indices.concat(meshes[1].indices.map(e => e + va_count))
        }
    }
    return meshes[0];
}

function mesh_single(){
    return {
        "vertices": [1],
        "indices": []
    }
}

/**
 * 
 * @param {vertices, indices} mesh 
 * @param {natural number} n 
 * 
 * returns the n-fold product of @mesh with itself.
 */
function mesh_pow(mesh, n){
    let result = mesh;
    for(let i = 0; i < n-1; i++)
        result = mesh_prod([result, mesh]);
    return result;
}

function mesh_interval(n){
    return {
        "vertices": Array.from(Array(n+1).keys(), i => i/n),
        "indices": Array.from(Array(n).keys(), i => [i, i+1]).flat()
    };
}

function mesh_closed_path(n){
    let interval = mesh_interval(n);
    interval.indices.push([n-1, 0]);
    return interval;
}

function mesh_cube(n){
    return mesh_pow({"vertices": [-1,1], "indices": [0,1]}, n);
}

function mesh_clifford(res_min, res_maj){
    return mesh_sum([
      mesh_prod([mesh_circle(res_min), mesh_discrete(mesh_circle(res_maj))]),
      mesh_prod([mesh_discrete(mesh_circle(res_maj)), mesh_circle(res_min)])
    ]);
}
