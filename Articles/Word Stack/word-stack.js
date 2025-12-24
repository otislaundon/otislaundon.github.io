const bwidth = 9;
const bheight = 9;

let score_total = 0;
let high_score_today = 0;
let highscores = {};

let board = [];
let board_display_tiles = [];
let board_display_buttons = [];
let board_display_numbers = [];
let board_rows_disp = [];
let words_found = [];
let rows_completed = [];

let game_ended = false;

let collected_words_elem = document.getElementById("collected-words");
let found_words_elem = document.getElementById("found-words");
let score_counter_elem = document.getElementById("score-counter");
let highscore_counter_elem = document.getElementById("highscore-counter");
let scores_elem = document.getElementById("scores");
let gameover_elem = document.getElementById("gameover");
let board_container = document.getElementById("board-container");
let hover_info_elem = document.getElementById("hover-info");

let options = {allow_diagonal: false, show_corner_numbers: true};

document.getElementById("setting-show-numbers").addEventListener("change", (ev) =>
{options.show_corner_numbers = ev.target.checked; ev.target.blur(); render_board();});
options.show_corner_numbers = document.getElementById("setting-show-numbers").checked;

let block_cur;

gameover_elem.style.display = "none";

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
    board_container.innerHTML = "";
    board_container.style["grid-template-columns"] = "auto ".repeat(m + 1);
    board_display_tiles = [];
    board_display_buttons = [];
    board_rows_disp = [];
    for(let i = 0; i < n; i++) 
    {
        let new_marker = document.createElement("button");
        new_marker.setAttribute("class", "tile marker marker-left");
        new_marker.innerText = "" + (n-i);
        new_marker.addEventListener("mouseover", () => {select_row(i);});
        new_marker.addEventListener("mouseout", () => {hover_info_elem.innerText="";});
        new_marker.onclick = (event) => {event.target.blur(); clear_row(i);};
        board_container.appendChild(new_marker);
        board_rows_disp.push(new_marker);
        let tile_row_i = [];
        let button_row_i = [];
        let number_row_i = [];
        for(let j = 0; j < m; j++) {
            let new_board_tile = document.createElement("div");
            new_board_tile.setAttribute("class", "tile");

            let new_board_button = document.createElement("button");
            new_board_button.setAttribute("class", "tile-button");
            new_board_button.addEventListener("mouseover", () => {select_square(j, i, true); render_board();});
            new_board_button.addEventListener("mouseout", () => {select_square(j, i, false); render_board();});
            new_board_button.addEventListener("click", (event) => {
                event.target.blur(); collect_at_square(j, i); find_words(); render_board();});
            
            let number_elem = document.createElement("div");
            number_elem.setAttribute("class", "tile-corner-num");

            new_board_tile.appendChild(new_board_button);
            new_board_tile.appendChild(number_elem);
            
            board_container.appendChild(new_board_tile);
            tile_row_i.push(new_board_tile);
            button_row_i.push(new_board_button);
            number_row_i.push(number_elem);
        }
        board_display_tiles.push(tile_row_i);
        board_display_buttons.push(button_row_i);
        board_display_numbers.push(number_row_i);
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
};

let get_highscores = () => {
    if("highscores" in localStorage)
        highscores = JSON.parse(localStorage.getItem("highscores"));
    if(today_score_key() in highscores)
        high_score_today = highscores[today_score_key()];

}
let today_score_key = () => {
    let date = new Date();
    console.log(date.toISOString().split("T")[0]);
    return date.toISOString().split("T")[0];
}
let set_score = (val) => {
    score_total = val;
    get_highscores();
    if(val >= high_score_today)
        high_score_today = val;
    highscores[today_score_key()] = high_score_today;
    localStorage.setItem("highscores", JSON.stringify(highscores));
    disp_scores();
}
let disp_scores = () => {
    scores_elem.innerText = "";
    console.log(highscores);
    Object.entries(highscores).forEach((key) => {
        scores_elem.innerText += key.toString().replace(",", " : ") + "\n"});
    highscore_counter_elem.innerText = "HIGHSCORE : " + highscores[today_score_key()];
}

let freq_total = 0;
letters.map((l) => {freq_total += l.freq});

//TODO : implement daily determinism with new RNG
let randomseed = 715;
random = () => {
    
}

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
[[0,1,0],
 [0,1,1],
 [0,1,0]],
5: 
[[0,1,0],
 [0,1,0],
 [0,1,1]],
6: 
[[0,1,0],
 [0,1,0],
 [1,1,0]]
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

const alternate_placements_short = [[-1,0], [2,0], [-1, -1], [0,2], [-1,-2], [2,0], [-2,2]];
const alternate_placements_long = [[-1,0], [2,0], [-1, -1], [0,2], [-2,-1], [1,-1],[1,-1],[1,1],[-2,2],[-1,-2],[1,-1],[-1,0]];

class block {
    constructor(block_type){
        this.block_type = block_type;
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
    valid_placement = (x, y, spin) => {
        let n_after_spin = spin == 0 ? this.n : this.m;
        let m_after_spin = spin == 0 ? this.m : this.n;
        let letters_after_spin = this.letters;

        if (spin != 0)
            letters_after_spin = array_2d(n_after_spin, m_after_spin, "");
        
        // right spin
        if(spin == 1)
            for(let i = 0; i < n_after_spin; i++)
                for(let j = 0; j < m_after_spin; j++)
                    letters_after_spin[i][j] = this.letters[m_after_spin - 1 - j][i];
        // left spin
        else if (spin == -1)
            for(let i = 0; i < n_after_spin; i++)
                for(let j = 0; j < m_after_spin; j++)
                    letters_after_spin[i][j] = this.letters[j][n_after_spin - 1 - i];

        for(let i = 0; i < n_after_spin; i ++)
            for(let j = 0; j < m_after_spin; j ++){
                if(letters_after_spin[i][j] == "")
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

    transform_checked = (dx, dy, spin) => {
        // checks each position left, right, up, down until a valid position is found, if all invalid then return.
        if(!this.valid_placement(this.x + dx, this.y + dy, spin))
            if(spin != 0) {
                let alternate_placements = this.block_type == 0 ? alternate_placements_long : alternate_placements_short;

                for (let i = 0; i < alternate_placements.length; i++)
                {
                    dx += alternate_placements[i][0];
                    dy += alternate_placements[i][1];
                    if(this.valid_placement(this.x + dx, this.y + dy, spin))
                        break;
                    else if (i == alternate_placements.length - 1)
                        return false;
                }
            }
            else return false;

        this.x += dx;
        this.y += dy;
        if(spin == 1) this.spin_right();
        if(spin == -1) this.spin_left();

        render_board();
        return true;
    }

    supported = () => {
        return this.valid_placement(this.x, this.y + 1, 0);
    }

    spin_right = () => {
        if(!this.valid_placement(this.x, this.y, 1))
            return false;

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
        return true;
    }

    spin_left = () => {
        if(!this.valid_placement(this.x, this.y, -1))
            return false;

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
        return true;
    }
}

place_block = (b) => {
    if(!b.valid_placement(b.x, b.y,0))
        return false;
    for(let i = 0; i < b.n; i++) 
        for(let j = 0; j < b.m; j++) {
            if(b.letters[i][j] != "")
                board[i+b.y][j+b.x] = {letter: b.letters[i][j], words: []};
        }
    return true;
}

is_word = (maybe_word) => {
    return wordlist.includes(maybe_word);
}

select_square = (x, y, val) => {
    let selection_info = "";
    let square_score = 0;
    for(let i = 0; i < board[y][x].words.length; i++){
        board[y][x].words[i].selected = val;
        selection_info += (i > 0 ? ", " : "") + board[y][x].words[i].str + " : " + board[y][x].words[i].score.str;
        square_score += board[y][x].words[i].score.val;
    }
    selection_info += "\n" + (square_score < 0 ? "-" : "+") + square_score;
    hover_info_elem.innerText = selection_info;

    if(board[y][x].words.length == 0 || !val)
        hover_info_elem.innerText = "";
}

select_row = (y, val) => {
    for(let i = 0; i < rows_completed.length; i++)
        if(rows_completed[i].y0 == y)
        {
            let words_text = "";
            let value_total = rows_completed[i].score.val;
            rows_completed[i].words.forEach((w) => {
                words_text += ", " + w.str + " : " + w.score.str;
                value_total += w.score.val;
            });
            hover_info_elem.innerText = rows_completed[i].str + " : "  + rows_completed[i].score.str + words_text
            + "\n" + (value_total >= 0 ? "+" : "") + value_total;
            break;
        }
}

clear_row = (y) => {
    for(let i = 0; i < rows_completed.length; i++)
        if(rows_completed[i].y0 == y)
        {
            let words_to_collect = [rows_completed[i]];
            rows_completed[i].words.forEach((w) => {words_to_collect.push(w)});
            console.log(words_to_collect);
            collect_words(words_to_collect);
            break;
        }
    find_words();
    render_board();
    find_rows();
}

disp_rows = () => {
    board_rows_disp.forEach((r) => {r.setAttribute("class", "tile marker marker-left")});
    for(let i = 0; i < rows_completed.length; i++)
    {
        board_rows_disp[rows_completed[i].y0].setAttribute("class", "tile marker marker-left rowcomplete");
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
    for(let i = 0; i < words.length; i++){
        let wi = words[i];
            for(let j = 0; j < words[i].len; j++)
            {
                board[wi.y0 + wi.dy * j][wi.x0 + wi.dx * j].words.push(wi);
            }
    }
    // now that we have added words to each square, we need to make sure that the words are "closed under masking" to improve visual consistency:
    for(let x0 = 0; x0 < bwidth; x0++)
        for(let y0 = 0; y0 < bheight; y0++)
            board[y0][x0].words = mask_words(words, words_to_mask(board[y0][x0].words));

    words_found = words;
}

find_words_in_row = (i) => {
    let words_in_row = [];
    for(let x0 = 0; x0 < bwidth; x0++)
    {
        // find largest horizontal word at (x0, i)
        for(let len = bwidth - x0; len >= 3; len --){
            let str_extract = extract_word(x0, i, 1, 0, len);
            if(is_word(str_extract))
                words_in_row.push({str: str_extract, len: len, x0: x0, y0: i, dx: 1, dy: 0,score: score_word(str_extract),selected:false});
        }
    }
    return words_in_row;
}

words_to_mask = (words) => {
    let mask = array_2d(bwidth, bheight, 0);
    words.forEach((w) => {
        for(let i = 0; i < w.len; i++)
            mask[w.y0 + w.dy * i][w.x0 + w.dx * i] = 1;
    });
    return mask;
}

//this is used to find subwords once words have been found in first round.
mask_words = (words, mask) => {
    let words_masked = [];
    words.forEach((w) => {
        // loop over each letter in word, if we reach end of word without leaving array, word is masked
        let is_masked = true;
        for(let i = 0; i < w.len; i++){
            if(mask[w.y0 + w.dy * i][w.x0 + w.dx * i] == 0){
                is_masked = false;
                break;
            }
        }
        if(is_masked)
            words_masked.push(w);
    });
    return words_masked;
}

find_rows = () => {
    rows_completed = [];
    for(let i = 0; i < bheight; i++)
    {
        let row_full = true;
        let row_str = "";
        for(let j = 0; j < bwidth; j++)
        {
            if(board[i][j].letter == "")
            {
                row_full = false;
                break;
            }
            row_str += board[i][j].letter;
        }
        if(row_full)
        {
            // find and score words contained in row:
            let words_in_row = find_words_in_row(i);
            let words_in_row_mask = words_to_mask(words_in_row)[i];
            let unmasked_score = 0;
            for(let j = 0; j < bwidth; j++)
                if(words_in_row_mask[j] == 0)
                    unmasked_score -= scores[board[i][j].letter];
            rows_completed.push({
                    str: row_str, 
                    len: bwidth, 
                    x0: 0, y0: i, 
                    dx: 1, 
                    dy: 0, 
                    score: {val: unmasked_score, str: unmasked_score.toString()},
                    words: words_in_row});
        }
    }
    disp_rows();
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

disp_score = () =>{
    score_counter_elem.innerHTML = "SCORE · " + score_total;
}

collect_words = (words) => {
    hover_info_elem.innerText = "";
    let collected_mask = array_2d(bheight, bwidth, 0);
    for(let i = 0; i < words.length; i++){
        for(let j = 0; j < words[i].len; j++){
//            board[words[i].y0 + words[i].dy * j][words[i].x0 + words[i].dx * j].letter = "";
            collected_mask[words[i].y0 + words[i].dy * j][words[i].x0 + words[i].dx * j] = 1;
        }
        let score = words[i].score;
        set_score(score_total + score.val);
        disp_score();
        let new_word_elem = document.createElement("div");
        new_word_elem.innerHTML = words[i].str + " · " + score.str;
        collected_words_elem.insertBefore(new_word_elem, collected_words_elem.firstChild);
    }
    for(let y = 0; y < bheight; y++)
    for(let x = 0; x < bwidth; x++){
        if(collected_mask[y][x] == 1){
            shift_above_down(board, x, y, {letter: "", words: []});
            shift_above_down(collected_mask, x, y, 0);
        }
    }
    if(block_cur == null)
        input_confirm();
    find_rows();
}

collect_at_square = (x, y) => {
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
                board_display_buttons[i+block.y][j+block.x].innerHTML = letter_ij;
                board_display_buttons[i+block.y][j+block.x].setAttribute("class", "tile-button group");
                if(options.show_corner_numbers)
                    board_display_numbers[i+block.y][j+block.x].innerHTML = (letter_ij != "" ? scores[letter_ij] : "");
            }
        }
}

render_found_words = () => {
    for(let i = 0; i < words_found.length; i++) 
    {
        let wi = words_found[i];
        for(let j = 0; j < wi.len; j++) {
            let bdb = board_display_buttons[wi.y0 + wi.dy * j][wi.x0 + wi.dx * j];
            if(wi.selected)
                bdb.setAttribute("class", "tile-button selectedword");
            else if (bdb.getAttribute("class") != "tile-button selectedword")
                bdb.setAttribute("class", "tile-button validword");
        }
    }
}

render_board = () => {
    for(let i = 0; i < bheight; i++) 
        for(let j = 0; j < bwidth; j++) {
            let letter = board[i][j].letter;
            board_display_buttons[i][j].innerHTML = letter;
            board_display_buttons[i][j].setAttribute("class", "tile-button" + (letter != "" ? " filled" : ""));
            board_display_numbers[i][j].innerHTML = (letter != "" && options.show_corner_numbers? scores[letter] : "");
        }
    render_found_words();
    if(block_cur != null)
        render_block(block_cur);
}

gameover = () => {
    gameover_elem.style.display = "block";
    game_ended = true;
}
start_game = () => {
    game_ended = false;
    gameover_elem.style.display = "none";

    block_cur = rand_block();
    init_board(bheight, bwidth);
    create_board_display(bheight, bwidth);
    find_words();
    words_found = [];
    collected_words_elem.innerHTML = "";
    set_score(0);
    disp_score();
    render_board();
}

// START input -------------------------
input_left = () =>{
    if(block_cur == null || game_ended) return false;
    return block_cur.transform_checked(-1,0,0);
}

input_up = () =>{
    if(block_cur == null || game_ended) return false;
    return block_cur.transform_checked(0,-1,0);
}

input_down = () =>{
    if(block_cur == null || game_ended) return false;
    return block_cur.transform_checked(0,1,0);
}

input_right = () =>{
    if(block_cur == null || game_ended) return false;
    return block_cur.transform_checked(1,0,0);
}

input_spinr = () =>{
    if(block_cur == null || game_ended) return false;
    return block_cur.transform_checked(0,0,1);
}

input_spinl = () =>{
    if(block_cur == null || game_ended) return false;
    return block_cur.transform_checked(0,0,-1);
}

input_confirm = () =>{
    //if(block_cur == null || game_ended) return false;
    if(block_cur != null)
    {
    if(block_cur.supported())
        return false;
    if(place_block(block_cur) == false)
        return false;
    }

    block_cur = new block(rand_int(7));
    find_words();
    find_rows();
    render_board();
    // game is over if piece is invalid and cant be rotated to be valid
        if(!block_cur.valid_placement(block_cur.x, block_cur.y, 0))
            if(!block_cur.transform_checked(0,0,1))
                if(!block_cur.transform_checked(0,0,-1))
                if(!block_cur.transform_checked(1,0,0))
                if(!block_cur.transform_checked(0,1,0))
                if(!block_cur.transform_checked(-1,0,0))
                if(!block_cur.transform_checked(0,-1,0))
                {
                    block_cur = null;
                    render_board();
                    if(words_found.length == 0 && rows_completed.length == 0)
                    {
                        gameover();
                        return false;
                    }
                }
    
    return true;
}

input_drop = () => {
    if(block_cur == null || game_ended) return false;
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

start_game();