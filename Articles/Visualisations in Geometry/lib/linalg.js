// Here A is an (n x m) matrix, and v is an m-dim vector. Returns the product Av
let mv_prod = function(A, v){
    let m = v.length;
    let n = A.length / m;
    let Av = new Array(n);
    for(let i = 0; i < n; i++) {
            Av[i] = 0;
            for(let j = 0; j < m; j++)
                Av[i] += A[i*m + j] * v[j];
        }
    return Av;
}

// Here A is (m x k) and B is (k x m)
function mm_prod(A, B, k){
    let n = A.length / k;
    let m = B.length / k;
    let AB = new Array(n*m);
    for(let j = 0; j < m; j++)
    for(let i = 0; i < n; i++){
        let ind = i*m + j;
        AB[ind] = 0;
        for(let l = 0; l < k; l++){
            AB[ind] += A[i*k + l] * B[l*m + j];
        }
    }
    return AB;
}

function vv_add(u, v){
  let n = u.length;
  let result = new Array(n);
  for(let i = 0; i < n; i++)
      result[i] = u[i] + v[i];
  
  return result;
}

function vc_mult(v, c){
  let n = v.length;
  let result = new Array(n);
    for(let i = 0; i < n; i++)
      result[i] = v[i] * c;
  return result;
}

vs_mult = (v, s) => v.map(a => a * s);

function rot4_xy_zw(theta, phi){
    let ct = cos(theta);
    let st = sin(theta);
    let cp = cos(phi);
    let sp = sin(phi);
    return [
        ct,-st,0,0,
        st,ct,0,0,
        0,0,cp,-sp,
        0,0,sp,cp];
}
function rot4_xz_yw(theta, phi){
    let ct = cos(theta);
    let st = sin(theta);
    let cp = cos(phi);
    let sp = sin(phi);
    return [
        ct,0,-st,0,
        0,cp,0,-sp,
        st,0,ct,0,
        0,sp,0,cp] 
}
function rot4_xw_yz(theta, phi){
    let ct = cos(theta);
    let st = sin(theta);
    let cp = cos(phi);
    let sp = sin(phi);
    return [
        ct,0,0,-st,
        0,cp,-sp,0,
        0,sp,cp,0,
        st,0,0,ct];
}

const mat4_id = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
]
