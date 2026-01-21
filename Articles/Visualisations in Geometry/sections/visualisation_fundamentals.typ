#import "../format.typ"  
#import "../format.typ": *
#import "../preamble.typ": *
#show: format.section

= Visualisation Methods

In this section, we will go over some basic visualisation techniques that will later be composed to create visualisations of more complex results and ideas.

== Rendering Techniques

- Rasterising primitives (triangles, lines, points)
- Raymarching in spaces.

== Geometric Objects

=== Surfaces
As typically in computer graphics the aim is to simulate the view of a somewhat realistic scene, which is composed of different objects, each equipped with textures, and lighting information in the scene.

In the case of opaque objects, the simulation of their interactions with light is limited to that at their surfaces. This is computationally very convenient, as we can approximate any 2-dimensional surface in euclidean space to arbitrary precision (with respect to) with a triangulated mesh. This is essentially because triangle-approximations of surfaces are piecewise linear approximations of continuous functions. TODO: WRITE MORE ABOUT THIS

=== Spaces

Of all spaces which we study the geometry of, probably the first considered, and simplest, is euclidean space. It was concieved to model the 3-dimensional space around us.

== Algebraic Objects

Of the different types of algebraic objects, perhaps groups are the ones with the most intuitive way of visualisation. 

In the case of finite groups, it is known by Frucht's Theorem @PinskyFrucht that every finite group is the automorphism group of a finite undirected graph, and other groups such as the Lie groups $GL(n)$ for $n = 1, 2, ...$ are the groups of symmetries of the spaces $RR^n$ respectively.

=== Rotations

Perhaps the most natural way to visualise a rotation is to visualise it's effect on some object, such as a frame or wire-sphere. Since we generally think of rotations via their action on objects or spaces.

If we take the perspective that a rotation in $RR^3$ is a point in the space $SO(3)$, it is more natural to visualise the space $SO(3)$ and then label one point in this space.

=== Permutations

== Maps

=== Graphs

=== Diagrams

== Algebra and Geometry

The link between algebra and geometry has been prevelant in the last century, and could be worth exploring more in terms of visualisation.