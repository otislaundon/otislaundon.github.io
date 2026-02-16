const src_complex_base =`
precision highp float;
varying vec2 vComplexPos;

float e = 2.7183;
float pi = 3.141593;
vec2 i = vec2(0.0, 1.0);

vec4 hsv2rgb_smooth( vec4 c ){
	vec3 rgb = clamp( abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),6.0)-3.0)-1.0, 0.0, 1.0);
	rgb = rgb*rgb*(3.0-2.0*rgb); // cubic smoothing	
	rgb = c.z * mix(vec3(1.0), rgb, c.y);
	return vec4(rgb, c.w);
}

vec4 complexToColor(vec2 z){
	float zmag = length(z);
	float heading = atan(z.y, z.x);

	return hsv2rgb_smooth(vec4(heading / (2.0 * 3.1415927) + 0.5, min(1.0, 1.0/zmag), min(1.0, zmag), 0.6));
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

