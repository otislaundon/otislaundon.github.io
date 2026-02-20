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

function m_trace(A, n){
	let tr = 0;
	for(let i = 0; i < n*n; i+= n+1)
		tr += A[i];
	return tr;
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

// rotates vector v about axis e by phi radians
function rotate_vector(v, e, phi){
	if(v_len_2(e) == 0 || phi == 0)
		return v;
	let cp = Math.cos(phi);
	let sp = Math.sin(phi);
	return vv_add(vs_prod(v, cp), vv_add(vs_prod(e, vv_dot(e, v) * (1-cp)), vs_prod(vv_cross(v, e),sp)));
}

// converts a rotation in angle-axis representation to it's rotation matrix
function angleaxis_to_matrix(e, phi){
	let e1 = rotate_vector([1,0,0], e, phi);
	let e2 = rotate_vector([0,1,0], e, phi);
	let e3 = rotate_vector([0,0,1], e, phi);
	return [e1[0],e2[0],e3[0],
			e1[1],e2[1],e3[1],
			e1[2],e2[2],e3[2]];
}

// converts a rotation matrix to it's angle-axis representation
function matrix_to_angleaxis(A){
	let ax = v_normalise([A[7]-A[5], A[2]-A[6], A[3]-A[1]]);
	let K = cross_matrix(ax);
	let theta = Math.atan2(-m_trace(mm_prod(K,A,3),3), m_trace(A,3) - 1);
	//let a = 1 / (2 * sin(Math.atan2(-m_trace(mm_prod(K, A)))));
	return vs_prod(ax, theta);
}

// takes a list of rotations R_1, R_2, ..., R_n in angle-axis representation and returns the composite R_1 R_2 ... R_n
mult_so3 = function(...args){
	let mats = args.map((a) => angleaxis_to_matrix(v_normalise(a), v_len(a))); // convert each argument to a rotation matrix
	let prod = mats.reduce((p, m) => mm_prod(p, m, 3)); // compute product of all these matrices
	return matrix_to_angleaxis(prod); // convert back to point
}

// takes unit quaternion [w, x, y, z] as input and returns a rotation matrix. This map is two-to-one.
SU2_to_rot_matrix = function(u){
	let w = u[0];
	let x = u[1];
	let y = u[2];
	let z = u[3];
	return [
		1-2*(y**2 + z**2), 2*(x*y - z*w), 2*(x*z + y*w),
		2*(x*y+ z*w), 1-2*(x**2 + z**2), 2*(y*z - x*w),
		2*(x*z - y*w), 2*(y*z + x*w), 1-2*(x**2 + y**2)
	];
}

// converts quaternion q to real 4x4 matrix, such that conversion followed by matrix multiplication is same as quaternion multiplication followed by conversion.
quaternion_to_real_mat4 = function(q){
	return [q[0], q[3],-q[1],-q[2],
		   -q[3], q[0], q[2],-q[1],
			q[1],-q[2], q[0],-q[3],
			q[2], q[1], q[3], q[0]];
}
//inverts previous function.
real_mat4_to_quaternion = function(m){
	return [m[0], -m[2], -m[3], m[1]];
}

//takes point in ball of radius pi to a quaternion.
//This is the quaternion exponential map.
point_to_quaternion = function(a){
	let h_len_w = v_len(a);
	let fac = sin(h_len_w)/h_len_w;
	return [cos(h_len_w), fac * a[0],fac * a[1],fac * a[2]];
}

// This is the right inverse of the above function.
quaternion_to_point = function(q){
	let im = [q[1], q[2], q[3]];
	let theta = Math.atan2(v_len(im), q[0]);
	return vs_prod(v_normalise(im), theta);
}
