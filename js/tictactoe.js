// tictactoe.js

'use strict';

if (!window.jQuery) {
    throw Error('jQuery is not loaded.');
}

const TICTACTOE_SIZE = 3;

const STATE_FOLDED = 'folded';
const STATE_RED = 'red';
const STATE_GREEN = 'green';

const PLAYER_STATE = STATE_RED;
const ENEMY_STATE = STATE_GREEN;

function reload() {
    $('#game .case')
        .removeClass(PLAYER_STATE)
        .removeClass(ENEMY_STATE)
        .addClass(STATE_FOLDED)
        .off('click').on('click', caseOnClick);
    $('#game').removeClass('busy ended');
    $('.result').removeClass('show');
}

function caseOnClick(event) {
    $(event.target)
        .removeClass(STATE_FOLDED)
        .addClass(PLAYER_STATE)
        .off('click');
    playTurn();
}

function playTurn() {
    $('#game').addClass('busy');
    if (hasWon(PLAYER_STATE)) {
        $('.player-win').addClass('show');
        $('#game').addClass('ended');
    }
    else if ($('.case.folded').length === 0) {
        $('.tie').addClass('show');
        $('#game').addClass('ended');
    }
    else {
        $(computerDecision(readBoard(), 1, 0))
            .removeClass(STATE_FOLDED)
            .addClass(ENEMY_STATE)
            .off('click');

        if (hasWon(ENEMY_STATE)) {
            $('.enemy-win').addClass('show');
            $('#game').addClass('ended');
        }
    }
    $('#game').removeClass('busy');
}

function hasWon(state) {
    // Check row & columns
    for (var i = 1; i <= TICTACTOE_SIZE; i++) {
        if ($(`.r${i} .case`).length === $(`.r${i} .case.${state}`).length) {
            return true;
        }
        if ($(`.c${i}`).length === $(`.c${i}.${state}`).length) {
            return true;
        }
    }

    // Check diagonals
    var indexes = Array.from(Array(TICTACTOE_SIZE + 1).keys()).splice(1); // [1, 2, 3]
    var selector = indexes.map(i => `.r${i} .c${i}`).join(',');
    var selectorUnfold = indexes.map(i => `.r${i} .c${i}.${state}`).join(',');
    if ($(selector).length === $(selectorUnfold).length) {
        return true;
    }
    var selectorInv = indexes.map(i => `.r${i} .c${1 + TICTACTOE_SIZE - i}`).join(',');
    var selectorUnfoldInv = indexes.map(i => `.r${i} .c${1 + TICTACTOE_SIZE - i}.${state}`).join(',');
    if ($(selectorInv).length === $(selectorUnfoldInv).length) {
        return true;
    }
    return false;
}

var computerDecision;

function readBoard() {
    const board = [...Array(TICTACTOE_SIZE)].map(row => Array(TICTACTOE_SIZE));
    for (var i = 0; i < TICTACTOE_SIZE; i++) {
        for (var j = 0; j < TICTACTOE_SIZE; j++) {
            board[i][j] = {
                [STATE_FOLDED]: 0,
                [PLAYER_STATE]: -1,
                [ENEMY_STATE]: 1
            }[$(`.r${i + 1} .c${j + 1}`).attr('class').split(' ')[2]];
        }
    }
    return board;
}

var randomAlgo = function () {
    var available = $(`.case.${STATE_FOLDED}`);
    return available[Math.floor(Math.random() * available.length)];
}

var basicAlgo = function (board) {
    throw Error('Not yet implemented.');
}

var minimaxAlgo = function (board, player, depth) {
    if (algoHasWon(1, board)) {
        return 1;
    }
    if (algoHasWon(-1, board)) {
        return -1;
    }

    var move = null;
    var score = player * - Infinity;

    for (var i = 0; i < TICTACTOE_SIZE; i++) {
        for (var j = 0; j < TICTACTOE_SIZE; j++) {
            if (board[i][j] == 0) {
                board[i][j] = player;
                var newScore = minimaxAlgo(board, -player, depth + 1);
                board[i][j] = 0;
                if (depth % 2 === 0) { // maximizing
                    if (newScore > score) {
                        score = newScore;
                        if (depth === 0) move = `.r${i+1} .c${j+1}`;
                    }
                }
                else { // minimizing
                    if (newScore < score) {
                        score = newScore;
                        if (depth === 0) move = `.r${i+1} .c${j+1}`;
                    }
                }
            }
        }
    }

    return depth === 0 ? move : (Math.abs(score) == Infinity ? 0 : score);
}

function algoHasWon(player, board) {
    // Hard-coded because I'm tired and screw this
    // TODO: make it better
    return (
        (board[0][0] == player && board[0][1] == player && board[0][2] == player) ||
        (board[1][0] == player && board[1][1] == player && board[1][2] == player) ||
        (board[2][0] == player && board[2][1] == player && board[2][2] == player) ||
        (board[0][0] == player && board[1][0] == player && board[2][0] == player) ||
        (board[0][1] == player && board[1][1] == player && board[2][1] == player) ||
        (board[0][2] == player && board[1][2] == player && board[2][2] == player) ||
        (board[0][0] == player && board[1][1] == player && board[2][2] == player) ||
        (board[0][2] == player && board[1][1] == player && board[2][0] == player)
    );
}

$(document).ready(() => {
    $('#difficulty').on('change', () => {
        reload();
        switch ($('#difficulty').val()) {
            case 'easy':
                return computerDecision = randomAlgo;

            case 'normal':
                return computerDecision = basicAlgo;

            case 'impossible':
                return computerDecision = minimaxAlgo;

            default:
                return computerDecision = () => { throw Error('No difficulty set.'); };
        }
    }).change();
});