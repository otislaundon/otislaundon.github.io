#import "../format.typ" 
#import "../format.typ": sketch
#show: format.section

= Costa's Surface

In this section, we introduce the Weierstrass functions used to parameterise costa's surface (using Gray's parameterisation). We will need both the Weierstrass zeta function and Weierstrass elliptic function. These have definitions as follows:

$
  
$

== Visualisation

Below we show visualisations of approximations of each of the functions defined above. We only compute finitely many terms in order to complete the computation in finite time... 

=== Weierstrass Sigma Function
#sketch("./sketches/domain-col-weierstrass/domain-col-weierstrass-sigma.js",
        "sketch:dom-col-weierstrass-sigma", 
        "./sketches/template/placeholder.png")

=== Weierstrass P Function
#sketch("./sketches/domain-col-weierstrass/domain-col-weierstrass-p.js",
        "sketch:dom-col-weierstrass-p", 
        "./sketches/template/placeholder.png")

=== Weierstrass Zeta Function
#sketch("./sketches/domain-col-weierstrass/domain-col-weierstrass-zeta.js",
        "sketch:dom-col-weierstrass-zeta", 
        "./sketches/template/placeholder.png")

=== Parameterised Surface Visualisation 

Using the above weierstrass functions, we can draw a parameterisation of costa's surface as follows

$
  x &= ... \
  y &= ... \
  z &= ... \
$

below is a visualisation of costa's surface as parameterised above:

#sketch("./sketches/costa-surface/costa-surface.js",
        "sketch:costa-surface", 
        "./sketches/template/placeholder.png")