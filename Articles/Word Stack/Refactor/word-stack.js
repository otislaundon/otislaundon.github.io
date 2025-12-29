// START: Util Functions - that depend only on inputs

function array_2d(n, m, val) {
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

function today_score_key() {
    let date = new Date();
    return date.toISOString().split("T")[0];
}

function rand_int(n) {return Math.floor(Math.random() * n);}


function words_to_mask(words) {
    let mask = array_2d(bwidth, bheight, 0);
    words.forEach((w) => {
        for(let i = 0; i < w.len; i++)
            mask[w.y0 + w.dy * i][w.x0 + w.dx * i] = 1;
    });
    return mask;
}

//this is used to find subwords once words have been found in first round.
function mask_words(words, mask) {
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

function remove_nested_words(words) {
    let words_processed = [];
    let words_to_remove = [];
    words.forEach((w) =>
    {
        mask_words(words, words_to_mask([w])).forEach((v) => {
            if(!words_to_remove.includes(v) && v != w)
                words_to_remove.push(v);
        });
    });
    words.forEach((w) => {
        if(!words_to_remove.includes(w))
            words_processed.push(w);
    });
    return words_processed;
}

function shift_above_down(arr, x0, y0, def) {
    for(let y = y0; y > 0; y--){
        arr[y][x0] = arr[y-1][x0];
    }
    arr[0][x0] = def;
}

// END : Util Functions

const contentEN = {
    letters : [
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
        {letter: "Q", freq: 0.4},
        {letter: "R", freq: 6},
        {letter: "S", freq: 4},
        {letter: "T", freq: 6},
        {letter: "U", freq: 4},
        {letter: "V", freq: 2},
        {letter: "W", freq: 1.5},
        {letter: "X", freq: 0.7},
        {letter: "Y", freq: 2},
        {letter: "Z", freq: 0.7}],
    letter_scores : {
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
        "Z": 10},
        wordlist: wordlistEN
};

const game_options_default = {
    allow_diagonal: false,
};

const rendering_options_default = {
    show_corner_numbers: true,
};

class Options{
    constructor(game_opts, rend_opts, int_opts){
        this.game = game_opts;
        this.rendering = rend_opts;
        this.interaction = int_opts;
    }

    initialise_ui() {
        let settings_checkbox_elem = document.getElementById("setting-show-numbers");
        settings_checkbox_elem.addEventListener("change", (ev) =>
        {this.rendering.show_corner_numbers = ev.target.checked; ev.target.blur(); render_board();});
        this.rendering.show_corner_numbers = settings_checkbox_elem.checked;
    }
}

class GameState {
    constructor(width, height, renderer, options, content) {
        this.width = width;
        this.height = height;
        this.renderer = renderer;
        this.options = options;
        this.content = content;
        this.init();
    }
    
    rand_block() {return new Block(rand_int(7), this);}

    init() {
        this.board = array_2d(this.height, this.width, {letter: "", words: []});
        this.words_found = [];
        this.rows_completed = [];
        this.game_ended = false;

        this.freq_total = 0;
        this.content.letters.map((l) => {this.freq_total += l.freq});

        this.block_cur = this.rand_block();
    }

    gameover(){
        this.renderer.gameover_elem.style.display = "block";
        this.game_ended = true;
    }

    start() {
        this.game_ended = false;
        this.renderer.gameover_elem.style.display = "none";
        this.block_cur = this.rand_block();
        this.init();
        this.find_words();
        this.renderer.collected_words_elem.innerHTML = "";
        this.scoreManager.load_highscores();
        this.scoreManager.save_score(0);
        this.renderer.render_board();
    }

    // reads from board starting at x, y, incrementing by (dx, dy) for len steps. returns characters read in order as a string
    // returns null if any empty spaces are encountered.
    extract_str(x, y, dx, dy, len) {
        let res = "";
        for(let i = 0; i < len; i++)
        {
            if(this.board[y][x].letter == "")
                return null;
            res += this.board[y][x].letter;
            x += dx;
            y += dy;
        }
        return res;
    }

    is_word(str) {
        return this.content.wordlist.includes(str);
    }

    score_word(word) {
        let val = 0;
        for(let i = 0; i < word.length; i++){
            val += this.content.letter_scores[word[i]]; 
        }
        return {val: val, str: "" + val};
    }

    rand_letter() {
        let r = Math.random();
        for(let i = 0; i < this.content.letters.length; i++) {
            r -= this.content.letters[i].freq / this.freq_total;
            if(r <= 0)
                return this.content.letters[i].letter;
        }
    }

    valid_placement(block, x, y, spin){
        let n_after_spin = spin == 0 ? this.n : this.m;
        let m_after_spin = spin == 0 ? this.m : this.n;
        let letters_after_spin = block.letters;

        if (spin != 0)
            letters_after_spin = array_2d(n_after_spin, m_after_spin, "");

        // right spin
        if(spin == 1)
            for(let i = 0; i < n_after_spin; i++)
                for(let j = 0; j < m_after_spin; j++)
                    letters_after_spin[i][j] = block.letters[m_after_spin - 1 - j][i];
        // left spin
        else if (spin == -1)
            for(let i = 0; i < n_after_spin; i++)
                for(let j = 0; j < m_after_spin; j++)
                    letters_after_spin[i][j] = block.letters[j][n_after_spin - 1 - i];

        for(let i = 0; i < n_after_spin; i ++)
            for(let j = 0; j < m_after_spin; j ++){
                if(letters_after_spin[i][j] == "")
                    continue;
                // ensure occupied tiles are in board:
                if(j + x >= bwidth || i + y >= bheight || i + y < 0 || j + x < 0) 
                    return false;
                // ensure no overlaps with board
                if(this.board[i + y][j + x].letter != "")
                    return false;
            }
        return true;
    }

    block_supported(block) {
        return !this.valid_placement(block, block.x, block.y + 1, 0);
    }

    place_block(block) {
        if(!this.valid_placement(block, block.x, block.y, 0))
            return false;
        for(let i = 0; i < block.n; i++) 
            for(let j = 0; j < block.m; j++) {
                if(block.letters[i][j] != "")
                    this.board[i+block.y][j+block.x] = {letter: block.letters[i][j], words: []};
            }
        return true;
    }

    clear_row(y) {
        for(let i = 0; i < this.rows_completed.length; i++)
            if(this.rows_completed[i].y0 == y)
            {
                let words_to_collect = [this.rows_completed[i]];
                this.rows_completed[i].words.forEach((w) => {words_to_collect.push(w)});
                this.collect_words(words_to_collect);
                break;
            }
        this.find_words();
        this.find_rows();
        this.renderer.render_board();
    }

    find_words() {
        let words = [];
        for(let x0 = 0; x0 < this.width; x0++)
        for(let y0 = 0; y0 < this.height; y0++)
        {
            // find largest horizontal word at (x0, y0)
            for(let len = 3; len < this.width - x0; len ++){
                let str_extract = this.extract_str(x0, y0, 1, 0, len);
                if(this.is_word(str_extract))
                    words.push({str: str_extract, len: len, x0: x0, y0: y0, dx: 1, dy: 0, score: this.score_word(str_extract),selected:false});
            }
            // find largest vertical word at (x0, y0)
            for(let len = 3; len < this.height - y0; len ++){
                let str_extract = this.extract_str(x0, y0, 0, 1, len);
                if(this.is_word(str_extract))
                    words.push({str: str_extract, len: len, x0: x0, y0: y0, dx: 0, dy: 1, score: this.score_word(str_extract),selected:false});
            }

            // find largest diagonal word at (x0, y0)
            if(this.options.allow_diagonal)
            for(let len = Math.min(this.height - y0, this.width - x0); len >= 3; len --){ // maybe change this to be ++ isntead of --
                let str_extract = this.extract_str(x0, y0, 1, 1, len);
                if(this.is_word(str_extract))
                    words.push({str: str_extract, len: len, x0: x0, y0: y0, dx: 1, dy: 1, score: this.score_word(str_extract),selected:false});
            }
        }
        words = remove_nested_words(words);

        // clear words from all tiles
        for(let j = 0; j < this.width; j++)
        for(let i = 0; i < this.height; i++)
            this.board[i][j].words = [];

        // add word to list of words attached to each of its letters, so it can be selected on hover
        for(let i = 0; i < words.length; i++){
            let wi = words[i];
                for(let j = 0; j < words[i].len; j++)
                    this.board[wi.y0 + wi.dy * j][wi.x0 + wi.dx * j].words.push(wi);
        }
        this.words_found = words;
    }

    find_words_in_row(i) {
        let words_in_row = [];
        for(let x0 = 0; x0 < bwidth; x0++) {
            for(let len = bwidth - x0; len >= 3; len --){
                let str_extract = this.extract_str(x0, i, 1, 0, len);
                if(this.is_word(str_extract))
                    words_in_row.push({str: str_extract, len: len, x0: x0, y0: i, dx: 1, dy: 0, score: this.score_word(str_extract),selected:false});
            }
        }
        return remove_nested_words(words_in_row);
    }

    find_rows_completed() {
        this.rows_completed = [];
        for(let i = 0; i < this.height; i++)
        {
            let row_full = true;
            let row_str = "";
            for(let j = 0; j < this.width; j++){
                if(this.board[i][j].letter == ""){
                    row_full = false;
                    break;
                }
                row_str += this.board[i][j].letter;
            }
            if(row_full){
                // find and score words contained in row:
                let words_in_row = this.find_words_in_row(i);
                let words_in_row_mask = words_to_mask(words_in_row)[i];
                let unmasked_score = 0;
                for(let j = 0; j < this.width; j++)
                    if(words_in_row_mask[j] == 0)
                        unmasked_score -= this.content.letter_scores[this.board[i][j].letter];
                this.rows_completed.push({
                        str: row_str, 
                        len: bwidth, 
                        x0: 0, y0: i, 
                        dx: 1, dy: 0, 
                        score: {val: unmasked_score, str: unmasked_score.toString()},
                        words: words_in_row});
            }
        }
        this.renderer.disp_rows(this.rows_completed);
    }

    collect_words(words) {
        this.renderer.display_hover_info("");
        let collected_mask = array_2d(this.height, this.width, 0);
        for(let i = 0; i < words.length; i++){
            for(let j = 0; j < words[i].len; j++)
                collected_mask[words[i].y0 + words[i].dy * j][words[i].x0 + words[i].dx * j] = 1;

            let score = words[i].score;
            this.scoreManager.set_score(this.scoreManager.score_total + score.val);
            this.renderer.add_collected_word(words[i].str + " · " + score.str);
        }
        for(let y = 0; y < this.height; y++)
        for(let x = 0; x < this.width; x++){
            if(collected_mask[y][x] == 1){
                shift_above_down(this.board, x, y, {letter: "", words: []});
                shift_above_down(collected_mask, x, y, 0);
            }
        }
        if(this.block_cur == null)
        {
            //TODO: try to create a new block 
        }
        this.find_rows();
    }
    collect_at_square(x, y) {
        this.collect_words(this.board[y][x].words);
        this.hover_square(x, y, true);
        this.renderer.render_board();
    }
}


eval_input = function(event_code) {
        if(interaction.options.keymappings.hasOwnProperty(event_code))
            interaction.options.keymappings[event_code]();
}

class InteractionManager {
    setup_keybinds = function(options){
        this.options = options;
        document.addEventListener('keydown', function (event) {eval_input(event.code);});
    }

    hover_square(x, y, val) {
        let selection_info = "";
        let square_score = 0;
        for(let i = 0; i < this.game.board[y][x].words.length; i++){
            this.game.board[y][x].words[i].selected = val;
            selection_info += (i > 0 ? ", " : "") + this.game.board[y][x].words[i].str + " : " + this.game.board[y][x].words[i].score.str;
            square_score += this.board[y][x].words[i].score.val;
        }
        selection_info += "\n" + (square_score < 0 ? "-" : "+") + square_score;

        if(this.game.board[y][x].words.length == 0 || !val)
            selection_info = "";

        this.renderer.display_hover_info(selection_info);
        this.renderer.render_board();
    }

    hover_row(y) {
        for(let i = 0; i < this.game.rows_completed.length; i++)
            if(this.game.rows_completed[i].y0 == y)
            {
                let words_text = "";
                let value_total = this.game.rows_completed[i].score.val;
                this.game.rows_completed[i].words.forEach((w) => {
                    words_text += ", " + w.str + " : " + w.score.str;
                    value_total += w.score.val;
                });
                let hover_info = this.game.rows_completed[i].str + " : "  + this.game.rows_completed[i].score.str + 
                                 words_text + "\n" + 
                                 (value_total >= 0 ? "+" : "") +  value_total;
                this.renderer.display_hover_info(hover_info);
                break;
            }
    }

    input_left = function() {
        if(game.block_cur == null || game.game_ended) return false;
        return game.block_cur.transform_checked(game,-1,0,0);
    }

    input_up() {
        if(game.block_cur == null || game.game_ended) return false;
        return game.block_cur.transform_checked(game, 0,-1,0);
    }

    input_down() {
        if(game.block_cur == null || game.game_ended) return false;
        return game.block_cur.transform_checked(game,0,1,0);
    }

    input_right() {
        if(game.block_cur == null || game.game_ended) return false;
        return game.block_cur.transform_checked(game,1,0,0);
    }

    input_spinr() {
        if(game.block_cur == null || game.game_ended) return false;
        return game.block_cur.transform_checked(game,0,0,1);
    }

    input_spinl() {
        if(game.block_cur == null || game.game_ended) return false;
        return game.block_cur.transform_checked(game,0,0,-1);
    }

    input_confirm() {
        //if(block_cur == null || game_ended) return false;
        if(game.block_cur != null)
        {
        if(game.block_cur.supported())
            return false;
        if(game.place_block(block_cur) == false)
            return false;
        }

        game.block_cur = game.rand_block(); 
        game.find_words();
        game.find_rows();
        this.renderer.render_board();
        // game is over if piece is invalid and cant be rotated to be valid
            if(game.valid_placement(game.block_cur, block_cur.x, block_cur.y, 0))
                if(game.transform_checked(game.block_cur, 0,0,1))
                    if(game.transform_checked(game.block_cur, 0,0,-1))
                    if(game.transform_checked(game.block_cur, 1,0,0))
                    if(game.transform_checked(game.block_cur, 0,1,0))
                    if(game.transform_checked(game.block_cur, -1,0,0))
                    if(game.transform_checked(game.block_cur, 0,-1,0))
                    {
                        game.block_cur = null;
                        this.renderer.render_board();
                        if(game.words_found.length == 0 && game.rows_completed.length == 0){
                            game.gameover();
                            return false;
                        }
                    }
        
        return true;
    }

    input_drop() {
        if(game.block_cur == null || game.game_ended) return false;
        while(interaction.input_down() != false){}
        interaction.input_confirm();
        return true;
    }
}

class Renderer {
    constructor() {
        this.board_display_tiles = [];
        this.board_display_buttons = [];
        this.board_display_numbers = [];
        this.board_rows_disp = [];
        this.game = null;

        this.get_display_elements();
    }

    get_display_elements() {
        this.collected_words_elem = document.getElementById("collected-words");
        this.found_words_elem = document.getElementById("found-words");

        this.score_counter_elem = document.getElementById("score-counter");
        this.highscore_counter_elem = document.getElementById("highscore-counter");
        this.scores_elem = document.getElementById("scores");

        this.gameover_elem = document.getElementById("gameover");
        this.board_container_elem = document.getElementById("board-container");
        this.hover_info_elem = document.getElementById("hover-info");
    }

    create_board_display(game) {
        this.game = game;
        this.board_container_elem.innerHTML = "";
        this.board_container_elem.style["grid-template-columns"] = "auto ".repeat(game.width + 1);
        this.board_display_tiles = [];
        this.board_display_buttons = [];
        this.board_rows_disp = [];
        for(let i = 0; i < game.height; i++) 
        {
            let new_marker = document.createElement("button");
            new_marker.setAttribute("class", "tile marker marker-left");
            new_marker.innerText = "" + (game.height-i);
            new_marker.addEventListener("mouseover", () => {game.hover_row(i);});
            new_marker.addEventListener("mouseout", () => {this.hover_info_elem.innerText="";});
            new_marker.onclick = (event) => {event.target.blur(); game.clear_row(i);};
            this.board_container_elem.appendChild(new_marker);
            this.board_rows_disp.push(new_marker);
            let tile_row_i = [];
            let button_row_i = [];
            let number_row_i = [];
            for(let j = 0; j < game.width; j++) {
                let new_board_tile = document.createElement("div");
                new_board_tile.setAttribute("class", "tile");

                let new_board_button = document.createElement("button");
                new_board_button.setAttribute("class", "tile-button");
                new_board_button.addEventListener("mouseover", () => {interaction.hover_square(j, i, true); this.render_board();});
                new_board_button.addEventListener("mouseout", () => {interaction.hover_square(j, i, false); this.render_board();});
                new_board_button.addEventListener("click", (event) => {
                    event.target.blur(); game.collect_at_square(j, i);});
                
                let number_elem = document.createElement("div");
                number_elem.setAttribute("class", "tile-corner-num");

                new_board_tile.appendChild(new_board_button);
                new_board_tile.appendChild(number_elem);
                
                this.board_container_elem.appendChild(new_board_tile);
                tile_row_i.push(new_board_tile);
                button_row_i.push(new_board_button);
                number_row_i.push(number_elem);
            }
            this.board_display_tiles.push(tile_row_i);
            this.board_display_buttons.push(button_row_i);
            this.board_display_numbers.push(number_row_i);
        }
        let new_marker = document.createElement("div");
        new_marker.setAttribute("class", "tile marker marker-bottom marker-left");
        new_marker.innerText = "";
        this.board_container_elem.appendChild(new_marker);
        for(let j = 0; j < game.width; j++) {
            let new_marker = document.createElement("div");
            new_marker.setAttribute("class", "tile marker marker-bottom");
            new_marker.innerText = "" + (j + 1);
            this.board_container_elem.appendChild(new_marker);
        }
    }

    disp_rows(rows_completed) {
        this.board_rows_disp.forEach((r) => {r.setAttribute("class", "tile marker marker-left")});
        for(let i = 0; i < rows_completed.length; i++)
            this.board_rows_disp[rows_completed[i].y0].setAttribute("class", "tile marker marker-left rowcomplete");
    }

    render_block(block) {
        for(let i = 0; i < block.n; i++) 
            for(let j = 0; j < block.m; j++) {
                let letter_ij = block.letters[i][j];
                if(letter_ij != "")
                {
                    this.board_display_buttons[i+block.y][j+block.x].innerHTML = letter_ij;
                    this.board_display_buttons[i+block.y][j+block.x].setAttribute("class", "tile-button group");
                    if(this.options.show_corner_numbers)
                        this.board_display_numbers[i+block.y][j+block.x].innerHTML = (letter_ij != "" ? this.game.content.letter_scores[letter_ij] : "");
                }
            }
    }

    render_found_words(words_found) {
        for(let i = 0; i < words_found.length; i++) {
            let wi = words_found[i];
            for(let j = 0; j < wi.len; j++) {
                let bdb = this.board_display_buttons[wi.y0 + wi.dy * j][wi.x0 + wi.dx * j];
                if(wi.selected)
                    bdb.setAttribute("class", "tile-button selectedword");
                else if (bdb.getAttribute("class") != "tile-button selectedword")
                    bdb.setAttribute("class", "tile-button validword");
            }
        }
    }

    render_board(){
        for(let i = 0; i < this.game.height; i++) 
            for(let j = 0; j < this.game.width; j++) {
                let letter = this.game.board[i][j].letter;
                this.board_display_buttons[i][j].innerHTML = letter;
                this.board_display_buttons[i][j].setAttribute("class", "tile-button" + (letter != "" ? " filled" : ""));
                this.board_display_numbers[i][j].innerHTML = (letter != "" && this.options.show_corner_numbers ? this.game.content.letter_scores[letter] : "");
            }
        this.render_found_words(game.words_found);
        if(this.game.block_cur != null)
            this.render_block(game.block_cur);
    }

    disp_scores(score_manager) {
        this.score_counter_elem.innerHTML = "SCORE · " + score_manager.score_total;

        this.scores_elem.innerText = "";
        Object.entries(score_manager.highscores).forEach((key) => {
            this.scores_elem.innerText += key.toString().replace(",", " : ") + "\n"});

        this.highscore_counter_elem.innerText = "Today's Highscore: " + score_manager.highscores[today_score_key()];
    }

    display_hover_info(str){
        this.hover_info_elem.innerText = str;
    }
    
    add_collected_word(str) {
            let new_word_elem = document.createElement("div");
            new_word_elem.innerHTML = str;
            this.collected_words_elem.insertBefore(new_word_elem, this.collected_words_elem.firstChild);
    }
}

class ScoreManager {
    constructor(renderer) {
        this.score_total = 0;
        this.high_score_today = 0;
        this.highscores = {};
        this.renderer = renderer;
    }

    load_highscores() {
        if("highscores" in localStorage)
            this.highscores = JSON.parse(localStorage.getItem("highscores"));
        if(today_score_key() in this.highscores)
            this.high_score_today = this.highscores[today_score_key()];
        else
            this.high_score_today = 0;
    }

    save_score(val) {
        this.score_total = val;
        this.load_highscores();
        if(val >= this.high_score_today)
            this.high_score_today = val;
        this.highscores[today_score_key()] = this.high_score_today;
        localStorage.setItem("highscores", JSON.stringify(this.highscores));
        this.renderer.disp_scores(this);
    }
}

const BLOCKTYPE = {
    HBAR : 0,
    VBAR : 1,
    SQUARE : 2,
    HS : 3,
    HZ : 4,
    VS : 5,
    VZ : 6
};

const alternate_placements_short = [[-1,0], [2,0], [-1, -1], [0,2], [-1,-2], [2,0], [-2,2]];
const alternate_placements_long = [[-1,0], [2,0], [-1, -1], [0,2], [-2,-1], [1,-1],[1,-1],[1,1],[-2,2],[-1,-2],[1,-1],[-1,0]];

let block_patterns = {
0: 
 [[0,1,0],
  [0,1,0],
  [0,1,0],
  [0,1,0]],
1: 
[[0,1,1],
 [1,1,0]],
2: 
[[1,1,0],
 [0,1,1]],
3: 
[[1,1],
 [1,1]],
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

class Block{
    constructor(block_type, game){
        this.game = game;
        this.block_type = block_type;
        let block_pattern = block_patterns[block_type];
        this.n = block_pattern.length;
        this.m = block_pattern[0].length;
        this.x = Math.floor((this.game.width - this.m)/2);
        this.y = 0;
        this.letters = [];

        for(let i = 0; i < this.n; i ++){
            let row_i = [];
            for(let j = 0; j < this.m; j ++){
                let thischar = "";
                if(block_pattern[i][j] == 1){
                    thischar = this.game.rand_letter();
                }
                row_i.push(thischar);
            }
            this.letters.push(row_i);
        }
    }

    transform_checked = (board, dx, dy, spin) => {
        // checks each position left, right, up, down until a valid position is found, if all invalid then return.
        if(!board.valid_placement(this, this.x + dx, this.y + dy, spin))
            if(spin != 0) {
                let alternate_placements = this.block_type == 0 ? alternate_placements_long : alternate_placements_short;

                for (let i = 0; i < alternate_placements.length; i++)
                {
                    dx += alternate_placements[i][0];
                    dy += alternate_placements[i][1];
                    if(board.valid_placement(this.x + dx, this.y + dy, spin))
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

        board.renderer.render_board();
        return true;
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
        return true;
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
        return true;
    }
}

/// GAME SETUP

let renderer = new Renderer();
let interaction = new InteractionManager(renderer);

let game = new GameState(10, 10, renderer, game_options_default, contentEN);
interaction.game = game;

let interaction_options_default = {
    keymappings : {
        "ArrowLeft"  : interaction.input_left,
        "KeyH"       : interaction.input_left,
        "ArrowRight" : interaction.input_right,
        "KeyL"       : interaction.input_right,
        "ArrowUp"    : interaction.input_up,
        "KeyK"       : interaction.input_up,
        "ArrowDown"  : interaction.input_down,
        "KeyJ"       : interaction.input_down,
        "Enter"      : interaction.input_confirm,
        "KeyQ"       : interaction.input_spinl,
        "KeyE"       : interaction.input_spinr,
        "Space"      : interaction.input_drop
    }
};

renderer.options = rendering_options_default;

renderer.create_board_display(game);
interaction.setup_keybinds(interaction_options_default);
interaction.input_left();

let scoreManager = new ScoreManager(renderer);
game.scoreManager = scoreManager;

game.start();
