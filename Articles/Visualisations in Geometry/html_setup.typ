#let html_boilerplate = context {
    if target() == "html"{
      html.elem("script", attrs: (src: "./lib/complex.js"))
      html.elem("script", attrs: (src: "./lib/p5/p5.min.js"))
      html.elem("script", attrs: (src: "./lib/linalg.js"))
      html.elem("script", attrs: (src: "./lib/vertex_sets.js"))
      html.elem("script", attrs: (src: "./lib/helper.js"))
      html.elem("link", attrs: (rel: "stylesheet", href: "styles/styles.css"))
      //html.elem("link", attrs: (rel: "stylesheet", href: "https://fred-wang.github.io/mathml.css/mspace.js"))
    }
}