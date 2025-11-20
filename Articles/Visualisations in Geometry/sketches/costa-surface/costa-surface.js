let sketch_template = new p5((p) => {
    p.canvas_id = "sketch:costa-surface";
    p5_lib_surfaceparam(p);

    p.surface = function(u, v) {
        
        let depth = 12;
        
        let w = new Complex(u, v);
        let PI_c = new Complex(PI, 0);
        let pw = weierstrass_p(w, depth);
        let zeta_wmh = weierstrass_zeta(w.sub(0.5), depth);
        let zeta_wmih = weierstrass_zeta(w.sub(0,0.5), depth);
        let e1 = weierstrass_p(new Complex(0, 0.5)).mul(-1);

        let x = 0;
        let y = 0;
        let z = 0;

        x = PI_c.mul(PI_c.div(e1.mul(4)).add(u));
        x = x.sub(weierstrass_zeta(w));
        x = x.add(PI_c.div(e1.mul(2)).mul(
            zeta_wmh.sub(zeta_wmih)
        ));
        x = x.re;

        z = PI_c.mul(PI_c.div(e1.mul(4)).add(v));
        z = z.sub(weierstrass_zeta(w).mul(0,1));
        z = z.sub(PI_c.mul(0,1).div(e1.mul(2)).mul(
            zeta_wmh.sub(zeta_wmih)
        ));
        z = z.re;

        y = p.sqrt(PI/2) * (pw.sub(e1)).div(pw.add(e1)).log().re;
        return [x,y,z];
    }

    p.setup = function(){
        p.canvas = p.createCanvas(720, 360, p.WEBGL);
        p.canvas.parent(p.canvas_id);
        
        p.costa_surface_geom = p.createSurfaceGeom(p.surface, 100, 100);
    }

    p.draw = function(){
        // don't do any drawing if not visible
        if(!isVisibleInViewport(p.canvas.elt))
            return;
    
        p.background(0);
        p.orbitControl();
        p.stroke(120);
        p.scale(30);
        p.model(p.costa_surface_geom);
    }
})

