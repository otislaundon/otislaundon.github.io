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

vs_prod = function(v, s) { 
    return v.map(a => a * s);
}

const sum = function(x){return x.reduce((partial_sum, a) => (partial_sum + a), 0);}
const v_len_2 = function(x){return sum(x.map((a) => a*a));}
const v_len = function(x){return Math.sqrt(v_len_2(x));}
const v_normalise = function(x){let l =v_len(x); return x.map((a) => a/l)};
const vv_dot = function(u, v){return sum(u.map((a,i)=>a*v[i]))}

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

function rot3_xy(theta){
    let ct = cos(theta);
    let st = sin(theta);
    return [
        ct, -st, 0,
        st, ct, 0,
        0,0,1
    ]
}

function standard_basis(n, i){
    let e_i = [];
    for(let j = 0; j < n; j++)
        e_i.push(i == j ? 1 : 0);
    return e_i;
}

function mat_id(n){
    let columns = [];
    for(let i = 0; i < n; i++)
        columns.push(standard_basis(n,i));
    return columns.flat();
}

function vv_cross(a, b){
	return [a[1]*b[2] - a[2]*b[1],
			a[2]*b[0] - a[0]*b[2],
			a[0]*b[1] - a[1]*b[0]];
}

// rotates vector v about axis e by phi radians
function rotate_vector(v, e, phi){
	if(v_len_2(e) == 0 || phi == 0)
		return v;
	let cp = Math.cos(phi);
	let sp = Math.sin(phi);
	return vv_add(vs_prod(v, cp), vv_add(vs_prod(e, vv_dot(e, v) * (1-cp)), vs_prod(vv_cross(v, e),sp)));
}

function angleaxis_to_matrix(e, phi){
	let e1 = rotate_vector([1,0,0], e, phi);
	let e2 = rotate_vector([0,1,0], e, phi);
	let e3 = rotate_vector([0,0,1], e, phi);
	return [e1[0],e2[0],e3[0],
			e1[1],e2[1],e3[1],
			e1[2],e2[2],e3[2]];
}

function matrix_to_angleaxis(A){
	let ax = v_normalise([A[7]-A[5], A[2]-A[6], A[3]-A[1]]);
	let K = cross_matrix(ax);
	let theta = Math.atan2(-m_trace(mm_prod(K,A,3),3), m_trace(A,3) - 1);
	//let a = 1 / (2 * sin(Math.atan2(-m_trace(mm_prod(K, A)))));
	return vs_prod(ax, theta);
}

function cross_matrix(v){
	return [
		0, -v[2], v[1],
		v[2], 0, -v[0],
		-v[1], v[0], 0
	];
}

const mat4_id = [
    1,0,0,0,
    0,1,0,0,
    0,0,1,0,
    0,0,0,1
];

const mat3_id = [
	1,0,0,
	0,1,0,
	0,0,1
];

function vv_lerp(a, b, t){
    return vv_add(vs_mult(a, 1-t), vs_mult(b, t));
}

function mat2_inv(a){
    let inv_det = 1/(a[0] * a[3] - a[1] * a[2]);
    if(inv_det == 0)
        return [0,0,0,0];
    return [
         det * a[3], -det * a[1],
        -det * a[2],  det * a[0]
    ];
}

function m_trace(A, n){
	let tr = 0;
	for(let i = 0; i < n*n; i+= n+1)
		tr += A[i];
	return tr;
}
