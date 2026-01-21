#import "../format.typ" 
#import "../format.typ": sketch
#import  "../preamble.typ": *
#show: format.section

= Rotations in $RR^4$

In this section, we will be exploring the group structure of rotations in $RR^4$. Specifically, we will show that it can be decomposed into two copies of $SO(3)$, and furthermore, we will visualise this fact.

== Mathematical Theory


Steps:

- show that SO(4) has a lie algebra with dynkin diagram that is 2 points.
- As SO(4) is semisimple, it is determined by its dynkin diagram.
- Since SO(3) is a simple lie algebra whos dynkin diagram is a single point, we get that SO(4) is the direct sum of SO(3) + SO(3).

- For simply connected lie groups, there is a bijective correspondence between lie groups and their lie algebras.
- SO(4) is not simply connected.
- Lie algebras and Dynkin Diagrams


== Visualisation Theory

The visualisation here allows the user to pick out $2$ elements of $SO(3)$ (rotations in $RR^3$), which are then combined in an intuitive way to form an element of $SO(4)$.

When thinking about the decomposition of $SO(4) tilde.equiv SO(3) plus.o SO(3)$, it is helpful to utilise both of these approaches in order to create the most intuitive visualisation. Remember that the goal is to visualise a single element of $SO(4)$, as well as the unique pair of elements of $SO(3)$ that it is associated to. 

We break the visualisation down into $3$ parts. The first is a visualisation of our element of $SO(4)$ via it's action on a coloured hypercube with vertices at $(a,b,c,d) in RR^4$ where $a, b, c, d in {-1,1}$.

== Visualisation

#sketch("./sketches/hypercube/hypercube.js", "sketch:hypercube", "./sketches/hypercube/rotating clifford torus.png")

