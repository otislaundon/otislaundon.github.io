const SO3_shader_funcs = `
	mat3 angleaxis_to_mat3(vec3 angleaxis){
		vec3 axis = normalize(angleaxis);
		float angle = length(angleaxis);
		if(angle==0.)
			return mat3(1.,0.,0.,0.,1.,0.,0.,0.,1.);
		float s = sin(angle);
		float c = cos(angle);
		float oc = 1.0 - c;
		return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
					oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
					oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
	}

	float trace(mat3 A){return A[0][0] + A[1][1] + A[2][2];}

	vec3 mat3_to_angleaxis(mat3 A){
		vec3 ax = vec3(A[1][2]-A[2][1], A[2][0]-A[0][2], A[0][1]-A[1][0]);
		if(length(ax) == 0.)
			return ax;
		ax = normalize(ax);
		mat3 K = mat3(0.,ax.z,-ax.y, -ax.z,0.,ax.x, ax.y,-ax.x,0.); // cross matrix
		float theta = -atan(-trace(K * A), trace(A) - 1.);
		return ax * theta;
	}
`;

const SO3_shader_hooks = {
	'mat3 angleaxis_to_mat3': `(vec3 angleaxis){
		vec3 axis = normalize(angleaxis);
		float angle = length(angleaxis);
		if(angle==0.)
			return mat3(1.,0.,0.,0.,1.,0.,0.,0.,1.);
		float s = sin(angle);
		float c = cos(angle);
		float oc = 1.0 - c;
		return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
					oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
					oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
	}` ,
	'float trace': `(mat3 A){return A[0][0] + A[1][1] + A[2][2];}`,
	'vec3 mat3_to_angleaxis': `(mat3 A){
		vec3 ax = normalize(vec3(A[1][2]-A[2][1], A[2][0]-A[0][2], A[0][1]-A[1][0]));
		mat3 K = mat3(0.,ax.z,-ax.y, -ax.z,0.,ax.x, ax.y,-ax.x,0.); // cross matrix
		float theta = -atan(-trace(K * A), trace(A) - 1.);
		return ax * theta;
	}`,
};

const SU2_shader_funcs = `
	// takes unit quaternion as input and returns a rotation matrix. This map is two-to-one.
	mat3 QSpinor(vec4 u){
		return mat3(1.-2.*(u.z*u.z + u.w*u.w), 2.*(u.y*u.z+ u.w*u.x), 2.*(u.y*u.w - u.z*u.x),
					2.*(u.y*u.z - u.w*u.x), 1.-2.*(u.y*u.y + u.w*u.w), 2.*(u.z*u.w + u.y*u.x),
					2.*(u.y*u.w + u.z*u.x), 2.*(u.z*u.w - u.y*u.x), 1.-2.*(u.y*u.y + u.z*u.z));
	}

	// converts quaternion q to real 4x4 matrix, such that conversion followed by matrix multiplication is same as quaternion multiplication followed by conversion.
	mat4 Q_to_mat4(vec4 q){
	return mat4(q.x, q.y, q.z, q.w,
				-q.y, q.x, q.w, -q.z,
				-q.z, -q.w, q.x, q.y,
				-q.w, q.z, -q.y, q.x);

	}

	//inverts previous function.
    vec4 mat4_to_Q(mat4 m){
		return vec4(m[0][0], m[0][1], m[0][2], m[0][3]);
	}

	//takes point in ball of radius pi to a quaternion.
	//This is the quaternion exponential map.
	vec4 vec3_to_Q(vec3 a){
		if(length(a) == 0.)
			return vec4(1.,0.,0.,0.);
		float h_len_w = length(a);
		float fac = sin(h_len_w)/h_len_w;
		return vec4(cos(h_len_w), fac * a);
	}

	// This is the right inverse of the above function.
	vec3 Q_to_vec3 (vec4 q){
		float theta = atan(length(q.yzw), q.x);
		return normalize(q.yzw) * theta;
	}
`;
const SU2_shader_hooks = {
	'mat3 Qspinor':`(vec4 u){
		return mat3(1.-2.*(u.y*u.y + u.z*u.z), 2.*(u.x*u.y+ u.z*u.w), 2.*(u.x*u.z - u.y*u.w),
					2.*(u.x*u.y - u.z*u.w), 1.-2.*(u.x*u.x + u.z*u.z), 2.*(u.y*u.z + u.x*u.w),
					2.*(u.x*u.z + u.y*u.w), 2.*(u.y*u.z - u.x*u.w), 1.-2.*(u.x*u.x + u.y*u.y));
	}`,

	'mat4 Q_to_mat4':`(vec4 q){
		return transpose(mat4(q.x, q.y, q.z, q.w,
					-q.y, q.x, q.w, -q.z,
					-q.z, -q.w, q.x, q.y,
					-q.w, q.z, -q.y, q.x));
	}`,

    'vec4 mat4_to_Q':`(mat4 m){
		return vec4(m[0][0], m[0][1], m[0][2], m[0][3]);
	}`,

	'vec4 vec3_to_Q':`(vec3 a){
		if(length(a) == 0.)
			return vec4(1.,0.,0.,0.);
		float h_len_w = length(a);
		float fac = sin(h_len_w)/h_len_w; 
		return vec4(cos(h_len_w), -fac * a);
	}`,

	'vec3 Q_to_vec3 ':`(vec4 q){
		float theta = atan(length(q.yzw), q.x);
		return -normalize(q.yzw) * theta;
	}`
};

const src_vert_base = `
precision highp float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uBounds;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

void main() {
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
}
`;

src_vert_anti = `
precision highp float;
uniform mat4 uModelViewMatrix ;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;

uniform float uScale;

varying vec3 vVertexPos;

void main() {
  vVertexPos = aPosition*uScale;
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
}
`;

src_frag_anti = `
precision highp float;
varying vec3 vVertexPos;

vec3 dir_to_col(vec3 dir){
	return vec3(dir * 0.5 + 0.5)*length(dir);
}

void main() {
	gl_FragColor = vec4(dir_to_col(vVertexPos)*0.7 + vec3(0.3), 1.0);
}
`;


src_frag_double = `
precision highp float;
varying vec3 vVertexPos;

vec3 dir_to_col(vec3 dir){
	dir = normalize(dir) * mod((length(dir) * 2), 3.141593);
	return vec3(dir * 0.5 + 0.5)*length(dir);
}

void main() {
	gl_FragColor = vec4(dir_to_col(vVertexPos)*0.7 + vec3(0.3), 1.0);
}
`;


src_vert_checkso3_world = `
precision highp float;
uniform mat3 uRotMat;
uniform mat4 uModelViewMatrix ;
uniform mat4 uProjectionMatrix;
attribute vec3 aPosition;
varying vec3 vVertexPos;
varying vec3 vWorldPos;

void main() {
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
  vVertexPos =  uRotMat * (aPosition.xyz - vec3(0.5,0.5,0.0))*2.0;
  vWorldPos = aPosition.xyz;
}
`;

src_frag_checkso3_world = `
precision highp float;
uniform float uCheckSize;
varying vec3 vVertexPos;
varying vec3 vWorldPos;

vec3 dir_to_col(vec3 dir){
	return vec3(dir * 0.5 + 0.5);
}

void main() {
	vec3 col1 = dir_to_col(vVertexPos);
	float r = length(vVertexPos);
	vec3 col2 = mix(col1, dir_to_col(-vVertexPos), r);

	float total = floor(vWorldPos.x * uCheckSize) + floor(vWorldPos.y*uCheckSize) + floor(vWorldPos.z*uCheckSize);
	float blend = (mod(total, 2.0) == 0.0) ? 0.0 : 1.0;

	vec3 col = mix(r * col1, r * col2, blend);

	gl_FragColor = vec4(col*1.0 + vec3(0.0), 1.0);
}
`;

src_vert_normal = `
precision highp float;
uniform mat4 uModelViewMatrix ;
uniform mat4 uProjectionMatrix;

attribute vec3 aPosition;
attribute vec3 aNormal;

varying vec3 vNormal;

void main() {
  vNormal = aNormal;
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
}
`;

src_frag_normal = `
precision highp float;

varying vec3 vNormal;

vec3 dir_to_col(vec3 dir){
	return vec3(dir.x, -dir.y, dir.z) * 0.5 + 0.5;
}

void main() {
	gl_FragColor = vec4(dir_to_col(vNormal), 0.9);
}
`

const src_complex_base =`
precision highp float;
varying vec2 vComplexPos;

float e = 2.7183;
float pi = 3.141593;
vec2 i = vec2(0.0, 1.0);

vec4 hsv2rgb( vec4 c ){
	vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
	rgb = c.z * mix(vec3(1.0), rgb, c.y);
	return vec4(rgb, c.w);
}

vec4 complexToColor(vec2 z){
	float zmag = length(z);
	float heading = atan(z.y, z.x);

	return hsv2rgb(vec4(heading / (2.0 * 3.1415927), min(1.0, 1.0/zmag), min(1.0, zmag), 1.0));
}

vec2 cmult(vec2 a, vec2 b){
	return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 cexp(vec2 z){
	return vec2(pow(e, z.x) * cos(z.y), pow(e, z.x) * sin(z.y));
}

vec2 clog(vec2 z, float branch){
	int k = int((branch - atan(z.y, z.x) + 2.0 *  pi) / (2.0 * pi));
	return vec2(log(length(z)), atan(z.y, z.x) + (2.0 * float(k) * pi));
}

vec2 cpow(vec2 z, vec2 alpha, float branch){
	return cexp(cmult(clog(z, branch), alpha));
}

vec2 cpow(vec2 z, float alpha, float branch){
  return cpow(z, vec2(alpha, 0.0), branch);
}

vec2 cpow(vec2 z, float alpha){
  return cpow(z, vec2(alpha, 0.0), -pi);
}

vec2 cpow(float x, vec2 alpha){
  return cpow(vec2(x, 0.0), alpha, -pi);
}
vec2 cpow(float x, float alpha){
  return cpow(vec2(x, 0.0), vec2(alpha, 0.0), -pi);
}

vec2 clog(vec2 z){
	return clog(z, -pi);
}

vec2 csinh(vec2 z){
	return (cexp(z) - cexp(-z)) / 2.0;
}

vec2 ccosh(vec2 z){
	return (cexp(z) + cexp(-z)) / 2.0;
}

vec2 csin(vec2 z){
	return cmult(-i, csinh(vec2(-z.y, z.x)));
}

vec2 ccos(vec2 z){
	return cmult(-i, ccosh(vec2(-z.y, z.x)));
}

vec2 cconj(vec2 z){
	return vec2(z.x, -z.y);
}

vec2 Re(vec2 z){
	return vec2(z.x, 0.0);
}

vec2 Im(vec2 z){
	return vec2(0.0, z.y);
}

vec2 cdiv(vec2 a, vec2 b){
	return cmult(a, cpow(b, -1.0, 0.0));
}

vec2 cmobius(vec2 z, vec2 a, vec2 b, vec2 c, vec2 d){
	return cdiv(cmult(a, z) + b, cmult(c, z) + d);
}
`;

