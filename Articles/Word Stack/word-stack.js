const bwidth = 9;
const bheight = 9;
let board = []
let board_disp = []
let score_total = 0;
let words_found = {};

let collected_words = document.getElementById("collected-words");
let found_words_elem = document.getElementById("found-words");
let score_counter_elem = document.getElementById("score-counter");

let options = {allow_diagonal: false};

init_board = (n, m) => {
    board = [];
    for(let i = 0; i < n; i++) 
    {
        let row_i = [];
    for(let j = 0; j < m; j++) {
        row_i.push({letter: "", words: []});
    }
    board.push(row_i);
    }
}

create_board_display = (n, m) => {
    board_container = document.getElementById("board-container");
    board_container.style["grid-template-columns"] = "auto ".repeat(m + 1);
    board_display = [];
    for(let i = 0; i < n; i++) 
    {
        let new_marker = document.createElement("div");
        new_marker.setAttribute("class", "tile marker marker-left");
        new_marker.innerText = "" + (n-i);
        board_container.appendChild(new_marker);
        let row_i = [];
        for(let j = 0; j < m; j++) {
            let new_board_tile = document.createElement("button");
            new_board_tile.setAttribute("class", "tile");
            new_board_tile.addEventListener("mouseover", () => {select_square(j, i, true); render_board();});
            new_board_tile.addEventListener("mouseout", () => {select_square(j, i, false); render_board();});
            new_board_tile.addEventListener("click", (event) => {
                event.target.blur(); collect_at_square(j, i); find_words(); render_board();});
            board_container.appendChild(new_board_tile);
            row_i.push(new_board_tile);
        }
        board_display.push(row_i);
    }
    let new_marker = document.createElement("div");
    new_marker.setAttribute("class", "tile marker marker-bottom marker-left");
    new_marker.innerText = "";
    board_container.appendChild(new_marker);
    for(let j = 0; j < m; j++) {
        let new_marker = document.createElement("div");
        new_marker.setAttribute("class", "tile marker marker-bottom");
        new_marker.innerText = "" + (j + 1);
        board_container.appendChild(new_marker);
    }
}

letters = [
    {letter: "A", freq: 9},
    {letter: "B", freq: 2},
    {letter: "C", freq: 2},
    {letter: "D", freq: 4},
    {letter: "E", freq: 12},
    {letter: "F", freq: 2},
    {letter: "G", freq: 3},
    {letter: "H", freq: 2},
    {letter: "I", freq: 9},
    {letter: "J", freq: 1},
    {letter: "K", freq: 1},
    {letter: "L", freq: 4},
    {letter: "M", freq: 2},
    {letter: "N", freq: 6},
    {letter: "O", freq: 8},
    {letter: "P", freq: 2},
    {letter: "Q", freq: 1},
    {letter: "R", freq: 6},
    {letter: "S", freq: 4},
    {letter: "T", freq: 6},
    {letter: "U", freq: 4},
    {letter: "V", freq: 2},
    {letter: "W", freq: 2},
    {letter: "X", freq: 1},
    {letter: "Y", freq: 2},
    {letter: "Z", freq: 1},
];
const scores = {
    "A": 1,
    "B": 3,
    "C": 3,
    "D": 2,
    "E": 1,
    "F": 4,
    "G": 2,
    "H": 4,
    "I": 1,
    "J": 8,
    "K": 5,
    "L": 1,
    "M": 3,
    "N": 1,
    "O": 1,
    "P": 3,
    "Q": 10,
    "R": 1,
    "S": 1,
    "T": 1,
    "U": 1,
    "V": 4,
    "W": 4,
    "X": 8,
    "Y": 4,
    "Z": 10,
}

let freq_total = 0;
letters.map((l) => {freq_total += l.freq});

rand_letter = () =>{
    let r = Math.random();
    for(let i = 0; i < letters.length; i++)
    {
        r -= letters[i].freq / freq_total;
        if(r <= 0)
            return letters[i].letter;
    }
}
rand_int = (n) => {return Math.floor(Math.random() * n);}
rand_block = () => {return new block(rand_int(7));}

const BLOCKTYPE = {
    HBAR : 0,
    VBAR : 1,
    SQUARE : 2,
    HS : 3,
    HZ : 4,
    VS : 5,
    VZ : 6
};

let block_patterns = {
0: 
 [[0,1,0],
  [0,1,0],
  [0,1,0],
  [0,1,0]],
1: 
[[1,1],
 [1,1]],
2: 
[[0,1,1],
 [1,1,0]],
3: 
[[1,1,0],
 [0,1,1]],
4: 
[[1,0],
 [1,1],
 [1,0]],
5: 
[[1,0],
 [1,0],
 [1,1]],
6: 
[[0,1],
 [0,1],
 [1,1]]
};

array_2d = (n, m, val) => {
    let arr = [];
    for(let i = 0; i < n; i++)
    {
        let row_i = [];
        for(let j = 0; j < m; j++)
            row_i.push(val);
        arr.push(row_i);
    }
    return arr;
}

class block {
    constructor(block_type){
        let block_pattern = block_patterns[block_type];
        this.n = block_pattern.length;
        this.m = block_pattern[0].length;
        this.x = Math.floor((bwidth - this.m)/2);
        this.y = 0;
        this.letters = [];
        for(let i = 0; i < this.n; i ++){
            let row_i = [];
            for(let j = 0; j < this.m; j ++){
                let thischar = "";
                if(block_pattern[i][j] == 1){
                    thischar = rand_letter();
                }
                row_i.push(thischar);
            }
            this.letters.push(row_i);
        }
    }
    valid_placement = (x, y) => {
        for(let i = 0; i < this.n; i ++)
            for(let j = 0; j < this.m; j ++){
                if(this.letters[i][j] == "")
                    continue;
                // ensure occupied tiles are in board:
                if(j + x >= bwidth || i + y >= bheight || i + y < 0 || j + x < 0) 
                    return false;
                // ensure no overlaps with board
                if(board[i + y][j + x].letter != "")
                    return false;
            }
        return true;
    }
    move = (dx, dy) => {
        if(this.valid_placement(this.x + dx, this.y + dy)){
            this.x += dx;
            this.y += dy;
            render_board();
            return true;
        } else
            return false;
    }

    supported = () => {
        return this.valid_placement(this.x, this.y + 1);
    }

    spin_right = () => {
        let temp_letters = this.letters;
        //swap n, m
        let n_prev = this.n;
        this.n = this.m;
        this.m = n_prev;
        this.letters = array_2d(this.n, this.m, "");
        for(let i = 0; i < this.n; i++)
        for(let j = 0; j < this.m; j++)
        {
            this.letters[i][j] = temp_letters[this.m - 1 - j][i];
        }
        render_board();
    }

    spin_left = () => {
        let temp_letters = this.letters;
        //swap n, m
        let n_prev = this.n;
        this.n = this.m;
        this.m = n_prev;
        this.letters = array_2d(this.n, this.m, "");
        for(let i = 0; i < this.n; i++)
        for(let j = 0; j < this.m; j++)
        {
            this.letters[i][j] = temp_letters[j][this.n - 1 - i];
        }
        render_board();
    }
}

place_block = (b) => {
    for(let i = 0; i < b.n; i++) 
        for(let j = 0; j < b.m; j++) {
            if(b.letters[i][j] != "")
                board[i+b.y][j+b.x] = {letter: b.letters[i][j], words: []};
        }
}

is_word = (maybe_word) => {
    return wordlist.includes(maybe_word);
}

select_square = (x, y, val) => {
    for(let i = 0; i < board[y][x].words.length; i++){
        board[y][x].words[i].selected = val;
    }
}

clear_words_from_tiles = () => {
    for(let x0 = 0; x0 < bwidth; x0++)
    for(let y0 = 0; y0 < bheight; y0++)
    {
        board[y0][x0].words = [];
    }
}

find_words = () => {
    clear_words_from_tiles();
    let words = [];
    for(let x0 = 0; x0 < bwidth; x0++)
    for(let y0 = 0; y0 < bheight; y0++)
    {
        // find largest horizontal word at (x0, y0)
        for(let len = bwidth - x0; len >= 3; len --){
            let str_extract = extract_word(x0, y0, 1, 0, len);
            if(is_word(str_extract))
                words.push({str: str_extract, len: len, x0: x0, y0: y0, dx: 1, dy: 0,score: score_word(str_extract),selected:false});
        }
        // find largest vertical word at (x0, y0)
        for(let len = bheight - y0; len >= 3; len --){
            let str_extract = extract_word(x0, y0, 0, 1, len);
            if(is_word(str_extract))
                words.push({str: str_extract, len: len, x0: x0, y0: y0, dx: 0, dy: 1,score: score_word(str_extract),selected:false});
        }

        // find largest diagonal word at (x0, y0)
        if(options.allow_diagonal)
        for(let len = Math.min(bheight - y0, bwidth - x0); len >= 3; len --){
            let str_extract = extract_word(x0, y0, 1, 1, len);
            if(is_word(str_extract))
                words.push({str: str_extract, len: len, x0: x0, y0: y0, dx: 1, dy: 1,score: score_word(str_extract),selected:false});
        }
    }
    // add word to list of words attached to each of its letters, so it can be selected on hover
    for(let i = 0; i < words.length; i++)
    {
        let wi = words[i];
            for(let j = 0; j < words[i].len; j++)
            {
                board[wi.y0 + wi.dy * j][wi.x0 + wi.dx * j].words.push(wi);
            }
    }
    words_found = words;
    //disp_found_words();
}
score_word = (word) => {
    let val = 0;
    for(let i = 0; i < word.length; i++){
        val += scores[word[i]]; 
    }
    return {val: val, str: "" + val};
}

shift_above_down = (arr, x0, y0, def)=>{
    for(let y = y0; y > 0; y--){
        arr[y][x0] = arr[y-1][x0];
    }
    arr[0][x0] = def;
}

collect_words = (words) => {
    let collected_mask = array_2d(bheight, bwidth, 0);
    for(let i = 0; i < words.length; i++){
        for(let j = 0; j < words[i].len; j++){
            board[words[i].y0 + words[i].dy * j][words[i].x0 + words[i].dx * j].letter = "";
            collected_mask[words[i].y0 + words[i].dy * j][words[i].x0 + words[i].dx * j] = 1;
        }
        let score = score_word(words[i].str);
        score_total += score.val;
        score_counter_elem.innerHTML = "SCORE · " + score_total;
        let new_word_elem = document.createElement("div");
        new_word_elem.innerHTML = words[i].str + " · " + score.str;
        collected_words.insertBefore(new_word_elem, collected_words.firstChild);
    }
    for(let y = 0; y < bheight; y++)
    for(let x = 0; x < bwidth; x++){
        if(collected_mask[y][x] == 1){
            shift_above_down(board, x, y, {letter: "", words: []});
            shift_above_down(collected_mask, x, y, 0);
        }
    }
}

collect_at_square = (x, y) => {
    console.log(board[y][x].words); 
    collect_words(board[y][x].words);
}

// reads from board starting at x, y, incrementing by (dx, dy) for len steps. returns characters read in order as a string
// returns null if any empty spaces are encountered.
extract_word = (x, y, dx, dy, len) => {
    let res = "";
    for(let i = 0; i < len; i++)
    {
        if(board[y][x].letter == "")
            return null;
        res += board[y][x].letter;
        x += dx;
        y += dy;
    }
    return res;
}

render_block = (block) => {
    for(let i = 0; i < block.n; i++) 
        for(let j = 0; j < block.m; j++) {
            let letter_ij = block.letters[i][j];
            if(letter_ij != "")
            {
                let disp_ij = board_display[i+block.y][j+block.x];
                disp_ij.innerHTML = letter_ij;
                disp_ij.setAttribute("class", "tile group");
            }
        }
}

render_found_words = () => {
    for(let i = 0; i < words_found.length; i++) 
    {
        let wi = words_found[i];
        for(let j = 0; j < wi.len; j++) {
            let bd = board_display[wi.y0 + wi.dy * j][wi.x0 + wi.dx * j];
            if(wi.selected)
                bd.setAttribute("class", "tile selectedword");
            else if (bd.getAttribute("class") != "tile selectedword")
                bd.setAttribute("class", "tile validword");
        }
    }
}

render_board = () => {
    for(let i = 0; i < bheight; i++) 
        for(let j = 0; j < bwidth; j++) {
        board_display[i][j].innerHTML = board[i][j].letter;
        board_display[i][j].setAttribute("class", "tile");
        }
    render_block(block_cur);
    render_found_words();
}

// START input -------------------------
input_left = () =>{
    return block_cur.move(-1,0);
}

input_up = () =>{
    return block_cur.move(0,-1);
}

input_down = () =>{
    return block_cur.move(0,1);
}

input_right = () =>{
    return block_cur.move(1,0);
}

input_spinr = () =>{
    return block_cur.spin_right();
}

input_spinl = () =>{
    return block_cur.spin_left();
}

input_confirm = () =>{
    if(block_cur.supported())
        return false;
    if(place_block(block_cur) == false)
        return false;
    block_cur = new block(rand_int(7));
    find_words();
    render_board();
    return true;
}

input_drop = () => {
    while(input_down() != false){}
    input_confirm();
    return true;
}

let keymappings = {
    "ArrowLeft"  : input_left,
    "KeyH"       : input_left,
    "ArrowRight" : input_right,
    "KeyL"       : input_right,
    "ArrowUp"    : input_up,
    "KeyK"       : input_up,
    "ArrowDown"  : input_down,
    "KeyJ"       : input_down,
    "Enter"      : input_confirm,
    "KeyQ"       : input_spinl,
    "KeyE"       : input_spinr,
    "Space"      : input_drop,
}

document.addEventListener('keydown', function(event) {
    if(keymappings.hasOwnProperty(event.code))
        keymappings[event.code]();
});
// END input -------------------------

let block_cur = rand_block();

init_board(bheight, bwidth);
create_board_display(bheight, bwidth);
render_board();

// thought: 
// generalisation is adjoint to specialisation?
// if you generalise and then specialise, you do nothing. if you specialise and then generalise you might change something?

// our dictionary is sorted alphabetically. we can leverage this to make checking against it quick. a tree structure with up to 26 branches per node could work

//ideally, we would have a datastructure that has a 26 bit mask per node (would use 32) and the memory layout would be topological wrt lexicographic ordering.

//topological memory layout! sounds appealing.

// first let's just try the dumb solution, where we have an array of length 270000 and check with "includes"

// the dumb solution seems fast enough


/*
<button onclick="input_left()">left</button>
<button onclick="input_up()">up</button>
<button onclick="input_down()">down</button>
<button onclick="input_right()">right</button>
<button onclick="input_spinr()">spin</button>
<button onclick="input_spinl()">unspin</button>
<button onclick="input_confirm()">confirm</button>
*/

        //<h2>FOUND WORDS</h2>
        //<div id="found-words" class="word-panel"></div>
        //<h3 id="highest-word">HIGHEST SCORING WORD · _ · 0</h3>