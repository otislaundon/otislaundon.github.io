#import "@local/mathyml:0.1.0" // TEST
#import mathyml: to-mathml // TEST
#import mathyml.prelude: * // TEST
#mathyml.stylesheets() // TEST

#let section(content) = {
  [
  #let colwhite(x) = text(fill: white, x) 

  //this solution for displaying math in html was janky, and not accessible.
  /*
  #show math.equation: eqblock => context {
    if target() == "html" {
      // For HTML export, wrap in an HTML frame
      // this is for a block equation
      if eqblock.block {
        html.elem("div", attrs: (class: "eqn_block"))[#html.frame(colwhite(eqblock))]
      } else {
        box(html.frame(colwhite(eqblock)))
      }
    } else {
      // For PDF export, show the equation as is
      eqblock
    }
    */

    #show math.equation: to-mathml // TEST
  //}
  
  #show align: a => context{
    if target() == "html"{
      html.elem("div", attrs: (class: "align-right"))[#a.body]
    }else{
      [#a]
    }
  }

  #let str_rl(rel_len) = {
    str(rel_len.length.pt())
  }

  #show pad: a => context{
    if target() == "html"{
      html.elem("div", attrs: (style: "padding:"+str_rl(a.top)+"pt "+str_rl(a.right)+"pt "+str_rl(a.bottom)+"pt "+str_rl(a.left)+"pt;color:red;"))[#a.body]
    }else{
      [#a]
    }
  }

  #show block: a => context{
    if target() == "html"{
      html.elem("div")[#a.body]
    }else{
      [#a]
    }
  }

  #set math.equation(numbering: "    (1)")

  #content
  ]
}

#let sidenote(elem_id) = {
  context{
    if target() == "html"{
      html.elem("div", attrs:(class: "sidenote", id: elem_id))
    }
  }
}
// The below function embeds an html canvas and javascript script that together make up an interactive visual, a "sketch". The placeholder_path points to an image that should be displayed in the non-interactive pdf version.
#let sketch(sketch_path, canvas_id, placeholder_path, controls: false) = {
    context{
    if target() == "html"{
      html.elem("div", attrs: (class: "canvas_holder", id: canvas_id))[
        #if controls{
          sidenote(canvas_id+"-controls")
        }
      ]
      html.elem("script", attrs: (src: sketch_path))
    }
    else{
      link("https://otislaundon.com/", 
      align(center, 
      image(placeholder_path, width: 80%)))
    }
    }
}
