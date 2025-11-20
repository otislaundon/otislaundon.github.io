#import "../format.typ"  
#import "../format.typ": *
#show: format.section

#let by = [$slash$]
#let SO = [$"SO"$]

#let proposition(content) = {
  [_Proposition_ : #content]
}

#let proof(content) = {
  pad([_Proof_ : #content #align(right, [$square.stroked$])], left:10pt, right:10pt)
}

#let SO3 = $"SO"(3)$

= Fundamental Group of $"SO"(3)$

The first geometric, or really more topological, topic that we will be showcasing is the fundamental group of $"SO(3)"$, that is the fundamental group of the special orthogonal group in $3$ dimensions. You may or may not already know that the fundamental group of $SO(3)$ is $ZZ by 2 ZZ$. That is to say there are exactly $2$ homotopy classes of closed paths in $SO(3)$. Note that we do not need to worry about the base point of the loops since $SO(3)$ is homeomorphic to projective $3$-space, and so is connected.

This section will assume familiarity with the basics of
 - topology
 - algebraic topology
 - lie groups

== Mathematical Theory

We will start by showing that the topology of $SO3$ is the same as $RR P^3$. This can be thought of intuitively by the fact that an element of $SO3$, i.e. a rotation in $RR^3$, is determined by an axis and an angle between $0$ and $pi$. All rotations in the $x y$ plane for example are described either by the direction $mat(0,0,1)$ and some angle $theta in [0,pi)$ for the rotations that map $mat(1,0,0)$ to the upper half of the $x y$ plane, or the direction $mat(0,0,-1)$ and an angle $theta in [0,pi)$ for the rotations that map $mat(1,0,0)$ to the lower half of the $x y$ plane.

#proposition[
  Every rotation in $RR^3$ can be described by an angle and an axis.
]

#proof[
  TODO.
]

Combining the direction, a unit vector, and angle around this direction, allows us to _almost_ uniquely describe any rotation by a vector in $RR^3$ who's length is in $[0,pi]$. These are exactly the vectors in the closed ball of radius $pi$, which we denote $overline(B_0(pi))$.

 The caveat here is that a rotation clockwise by $pi$ radians is the same as a rotation anticlockwise by $pi$ radians. This implies that rotations described by vectors of length $pi$ describe the same rotation as their negative. So If we want to describe rotations uniquely, we need to quotient by the relation $u ~ v <=> ||u|| = ||v||$ and $u = -v$. We now have that the points in the topological space $overline(B_0(pi)) / ~$ correspond one-to-one with the elements of $SO3$.

 It is the case that $overline(B_0(pi)) by ~ #" " tilde.equiv RR P^3$. We know from [TODO: CITE HERE] that the first fundamental group of $RR P^n$ is $ZZ / 2 ZZ$ for all $n >= 2$. This is the key fact that we will be visualising. That there are exactly two homotopy classes of paths of rotations in $RR^3$, and that for non-trivial paths of rotations, concatenating the path with itself results in a trivial path.

== Visualisation Theory

Since the fundamental group consists of the set of homoptopy classes of closed paths (loops) of rotations in $SO3$, it would be nice if we had a way of visualising both loops of rotations, and homotopies between them.

We will visualise a loop of rotations in the following way: Let $alpha: S^1 -> SO3$ be a loop in $"SO(3)"$, where $S^1 = {(cos(theta), sin(theta)) | 0 <= theta < 2 pi}$. We will visualise this by picking some reference object, say a set of axes, or maybe something like a teapot, and placing multiple copies of it around a circle. The object at a point $(cos(theta), sin(theta))$ on the circle will have orientation $alpha(theta)$. As alpha is continuous, adjacent objects will have almost the same orientation, and as you go around the circle the orientation of the objects will smoothly change.

== Visualisation

#sketch("./sketches/paths-of-rotations/paths-of-rotations.js", "sketch:paths-of-rotations", "./sketches/template/placeholder.png")