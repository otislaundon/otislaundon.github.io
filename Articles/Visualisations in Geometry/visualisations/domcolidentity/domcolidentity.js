let sketch_domcolidentity = new p5((p) => {
    p.canvas_id = "vis:domcolidentity";

	p5_lib_annotations(p);

p.vertSrc = `
precision highp float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec4 uBounds;

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vComplexPos;

void main() {
  vComplexPos = uBounds.zw * aTexCoord + uBounds.xy * (vec2(1.) - aTexCoord);
  gl_Position = uProjectionMatrix * (uModelViewMatrix * vec4(aPosition,1.0));
}
`;

p.fragDomCol = src_complex_base +
`
vec2 f(vec2 z){
	return z;
}

void main() {
    vec2 image = f(vComplexPos);
    gl_FragColor = vec4(complexToColor(image).xyz, 1.0);
}
`;

	p.createAxisLabels = function(minx, miny, maxx, maxy){
		for(let x = minx; x <= maxx; x++){
			let lab = p.createAnnotation(0,0, ""+x);
			p.setAnnotationPos3(lab, [x,0,0]);
		}

		for(let y = miny; y <= maxy; y++){
			if(y == 0)
				continue;
			let lab = p.createAnnotation(0,0, ""+y + (y*y > 1 ? "\\(i\\)" : ""));
			p.setAnnotationPos3(lab, [0,y,0]);
		}
	}

	p.preload = function(){
		p.dom_col_shader = p.createShader(p.vertSrc, p.fragDomCol);
	}

    p.setup = function(){
        p.canvas = p.createCanvas(720, 480, p.WEBGL);
        p.canvas.parent(p.canvas_id);
		p.noStroke();

		p.lab_Re = p.createAnnotation(0,0,"Re");
		p.lab_Im = p.createAnnotation(0,0,"Im");

		p.figBounds = [-3.6,-2.4, 3.6,2.4];

		p.preload();

		p.scale(1,-1,1);
		p.scale(p.width/(p.figBounds[2] - p.figBounds[0]), p.height/(p.figBounds[3]-p.figBounds[1]));
		p.createAxisLabels(-3,-2,3,2);
    }

    p.draw = function(){
		// don't do any drawing if not visible
		if(!isVisibleInViewport(p.canvas.elt))
			return;

		p.scale(1,-1,1);
		p.scale(p.width/(p.figBounds[2] - p.figBounds[0]), p.height/(p.figBounds[3]-p.figBounds[1]));

		p.background(255,255,255,0);

		p.dom_col_shader.setUniform("uBounds", p.figBounds);
		p.shader(p.dom_col_shader);

		p.rect(p.figBounds[0], p.figBounds[1], p.figBounds[2]-p.figBounds[0], p.figBounds[3]-p.figBounds[1]);

		p.stroke(0);
		p.strokeWeight(1);
		p.line(p.figBounds[0],0,p.figBounds[2],0);
		p.line(0,p.figBounds[1],0,p.figBounds[3]);
		p.noStroke();

		p.setAnnotationPos3(p.lab_Re, [3.2,0,0], [0,-30]);
		p.setAnnotationPos3(p.lab_Im, [0,2.3,0], [10,0]);
    }


})

