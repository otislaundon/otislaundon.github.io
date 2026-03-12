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
    return [ ct, -st, 0,
			 st, ct, 0,
			 0,0,1]
}

function rot3_yz(theta){
    let ct = cos(theta);
    let st = sin(theta);
    return [ 1, 0, 0,
			 0, ct, -st,
			 0, st, ct];
}

function rot3_xz(theta){
    let ct = cos(theta);
    let st = sin(theta);
    return [ ct, 0, -st,
			 0, 1, 0,
			 st,0,ct];
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

function mat3_to_mat4(m){
	return [
	m[0], m[1], m[2], 0.0,
	m[3], m[4], m[5], 0.0,
	m[6], m[7], m[8], 0.0,
	0,0,0,1];
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

function mat3_det(m){
	return m[0] * (m[4]*m[8] - m[7]*m[5]) + m[1]*(m[5]*m[6] - m[3]*m[8]) + m[2]*(m[3]*m[7] - m[6]*m[4]);
}

function mat3_cofac(m){
	return [
		m[4]*m[8]-m[5]*m[7], m[5]*m[6]-m[3]*m[8], m[3]*m[7]-m[4]*m[6],
		m[7]*m[2]-m[1]*m[8], m[0]*m[8]-m[2]*m[6], m[6]*m[1]-m[0]*m[7],
		m[1]*m[5]-m[2]*m[4], m[2]*m[3]-m[0]*m[5], m[0]*m[4]-m[1]*m[3]
	];
}

function mat3_inv(m){
	let d = mat3_det(m);
	let minor = mat3_cofac(m);
	return [
		minor[0]/d, minor[3]/d, minor[6]/d,
		minor[1]/d, minor[4]/d, minor[7]/d,
		minor[2]/d, minor[5]/d, minor[8]/d
	]
}

function mat3_T(m){
	return [
		m[0], m[3], m[6],
		m[1], m[4], m[7],
		m[2], m[5], m[8]
	];
}

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

function angleaxis_to_matrix(v){
	let e = v_normalise(v);
	let phi = -v_len(v); // This minus sign comes from the non-standard orientation being used
	let e1 = rotate_vector([1,0,0], e, phi);
	let e2 = rotate_vector([0,1,0], e, phi);
	let e3 = rotate_vector([0,0,1], e, phi);
	return [e1[0],e2[0],e3[0],
			e1[1],e2[1],e3[1],
			e1[2],e2[2],e3[2]];
}


/*
function angleaxis_to_matrix(e, phi){
		let axis = v_normalise(e);
		if(phi==0)
			return mat3_id;
		let s = sin(phi);
		let c = cos(phi);
		let oc = 1 - c;
	return [
		oc * axis[0] * axis[0] + c,           oc * axis[0] * axis[1] + axis[2] * s ,oc * axis[2] * axis[0] - axis[1] * s,
		oc * axis[0] * axis[1] - axis[2] * s,  oc * axis[1] * axis[1] + c          ,oc * axis[1] * axis[2] + axis[0] * s,
		oc * axis[2] * axis[0] + axis[1] * s,  oc * axis[1] * axis[2] - axis[0] * s, oc * axis[2] * axis[2] + c
	];
}
*/

function cross_matrix(v){
	return [
		0, -v[2], v[1],
		v[2], 0, -v[0],
		-v[1], v[0], 0
	];
}
// converts a rotation matrix to it's angle-axis representation
function matrix_to_angleaxis(A){
	let ax = [A[7]-A[5], A[2]-A[6], A[3]-A[1]];
	if(v_len(ax) == 0)
		return ax;
	ax = v_normalise(ax);
	let K = cross_matrix(ax);
	let theta = Math.atan2(-m_trace(mm_prod(K,A,3),3), m_trace(A,3) - 1);
	//let a = 1 / (2 * sin(Math.atan2(-m_trace(mm_prod(K, A)))));
	return vs_prod(ax, theta);
}

// takes a list of rotations R_1, R_2, ..., R_n in angle-axis representation and returns the composite R_1 R_2 ... R_n
mult_so3 = function(...args){
	let mats = args.map((a) => angleaxis_to_matrix(a)); // convert each argument to a rotation matrix
	let prod = mats.reduce((p, m) => mm_prod(p, m, 3)); // compute product of all these matrices
	return matrix_to_angleaxis(prod); // convert back to point
}

// takes unit quaternion [w, x, y, z] as input and returns a rotation matrix. This map is two-to-one.
QSpinor = function(u){
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
Q_to_mat4 = function(q){
	return [q[0], -q[1], -q[2], -q[3],
		    q[1], q[0], -q[3], q[2],
			q[2], q[3], q[0], -q[1],
			q[3], -q[2], q[1], q[0]];
}
//inverts previous function.
mat4_to_Q = function(m){
	return [m[0], m[4], m[8], m[12]];
}

//takes point in ball of radius pi to a quaternion.
//This is the quaternion exponential map.
vec3_to_Q = function(a){
	if(v_len(a) == 0.)
		return [1.,0.,0.,0.];
	let h_len_w = -v_len(a);
	let fac = sin(h_len_w)/h_len_w;
	return [cos(h_len_w), fac * a[0],fac * a[1],fac * a[2]];
}

angleaxis_to_Q = function(a){
	return vec3_to_Q(a);
}

// This is the right inverse of the above function.
Q_to_vec3 = function(q){
	let im = [q[1], q[2], q[3]];
	let theta = Math.atan2(v_len(im), q[0]);
	return vs_prod(v_normalise(im), theta);
}
