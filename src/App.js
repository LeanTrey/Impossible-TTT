/*
  The app compiles and runs properly, but when building, you can see some helpful errors in the terminal from eslint which should probably be addressed!
  In our vTestify repos, we have automated systems which prevent merging any PRs with outstanding eslint warnings. Terminal output:

    Compiled with warnings.

    [eslint]
    src/App.js
      Line 30:12:  'availableMoves' is defined but never used                                                                                                                                                                                                     no-unused-vars
      Line 119:6:  React Hook useEffect has missing dependencies: 'minimax', 'result', and 'score'. Either include them or remove the dependency array. You can also do a functional update 'setScore(s => ...)' if you only need 'score' in the 'setScore' call  react-hooks/exhaustive-deps

    Search for the keywords to learn more about each warning.
    To ignore, add // eslint-disable-next-line to the line before.
*/

// We're importing the required modules for our app, such as styles and components.
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Better to consolidate imports from the same package, moved these into the import above
// import { useState, useEffect } from 'react';

import './App.css';
import Board from "./Board";
import Square from "./Square";
import Modal from 'react-modal';

// Here we're defining the default state for our squares. It's an array of nine null elements.
const defaultSquares = () => (new Array(9)).fill(null);

// These are the combinations that would make a player win in the game.
const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

Modal.setAppElement('#root');

// We're using the useState hook to manage the state for squares and result in our component.
function App() {
  const [squares, setSquares] = useState(defaultSquares());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [score, setScore] = useState({ wins: 0, ties: 0, losses: 0 });

  // One of the eslint warnings was that this function isn't used.
  // I've commented it out but it could be removed.
  // function availableMoves(squares) {
  //   return squares
  //     .map((square, index) => square === null ? index : null)
  //     .filter(val => val !== null);
  // }

  // This function calculates the result of the game. 
  // It checks if any of the winning combinations is filled by a single player.
  // * Root-level functions not wrapped in `useCallback` will be redeclared every render, causing reduced performance.
  const calculateResult = useCallback((squares) => {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
     // If no more squares are available and no winner, then it's a tie
    return squares.filter(val => val === null).length ? null : 'tie';
  }, []);
  
  // function used to calculate the best move for the computer player.
  // It returns an object with the best score and the move that leads to that score.
  const minimax = useCallback((squares, depth, isMaximizingPlayer) => {
    const result = calculateResult(squares);
    
    // Returns the score of the game after it ends
    if (result === 'x') return { score: -10 };
    if (result === 'o') return { score: 10 };
    if (result === 'tie') return { score: 0 };

    // If it's the computer's turn it tries to maximize the score.
    if (isMaximizingPlayer) {
      let bestScore = -Infinity;
      let move;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'o';
          let score = minimax(squares, depth + 1, false).score;
          squares[i] = null;
          if (score > bestScore) {
            bestScore = score;
            move = i;
          }
        }
      }
      return { score: bestScore, move: move };
    } else {
       // If it's the player's turn it tries to minimize the score.
      let bestScore = Infinity;
      let move;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'x';
          let score = minimax(squares, depth + 1, true).score;
          squares[i] = null;
          if (score < bestScore) {
            bestScore = score;
            move = i;
          }
        }
      }
      return { score: bestScore, move: move };
    }
  }, [calculateResult]);

  /**
   * The section below (large useEffect) could be made more efficient & less complicated
   * by splitting up responsibility for calculating different states:
   **/

  // Anytime `squares` is updated, this code will run once and store `true` or `false` in `isPlayerTurn`.
  // If we want to know whether it's the computer's turn we can just use `!isPlayerTurn`
  const isPlayerTurn = useMemo(
    () =>
      // Cool filter trick I learned from @LukasBarry, selects only truthy values (rejecting null or undefined)
      squares.filter(Boolean).length % 2 === 0,
    [squares]
  );

  // Anytime a value in the dependency array `[squares]` changes,
  // re-run `calculateResult` one time and store the result in this memoized `result` variable.
  const result = useMemo(() => calculateResult(squares), [calculateResult, squares]);

  // Handle taking the computer's turn
  useEffect(() => {
    if (isPlayerTurn) return; // Do nothing if it's not the computer's turn
    if (result) return; // Do nothing if the game is over

    const bestMove = minimax(squares.slice(), 0, true).move;
    const newSquares = squares.slice();
    newSquares[bestMove] = 'o';
    setSquares(newSquares);
  }, [isPlayerTurn, result, squares, minimax]);

  // Handle the game ending (show modal & update score)
  useEffect(() => {
    if (!result) return;
    
    setModalIsOpen(true);

    // Updating state based on previous state can cause errors unless you set the state using a function param.
    // Refactored based on details here: https://react.dev/reference/react/useState#updating-state-based-on-the-previous-state
    if (result === 'x') setScore(score => ({ ...score, wins: score.wins + 1 }));
    else if (result === 'o') setScore(score => ({ ...score, losses: score.losses + 1 }));
    else if (result === 'tie') setScore(score => ({ ...score, ties: score.ties + 1 }));
  }, [result, isPlayerTurn]);

  // This function handles the player's move when a square is clicked.
  // * The functions below should all be wrapped in `useCallback` as well, with dependencies set accordingly:
  const handleSquareClick = useCallback((index) => {
    if (!isPlayerTurn || result) return;

    // Avoid calculating this until absolutely needed by checking it after the two things above
    const squareIsFree = squares[index] === null;
    if (!squareIsFree) return;

    // Play into square if it is the player's turn and there is no game result
    if (isPlayerTurn && !result) {
      let newSquares = squares.slice();
      newSquares[index] = 'x';
      setSquares(newSquares);
    }
  }, [result, squares, isPlayerTurn]);
  // This function resets the score
  const resetScore = useCallback(() => {
    setScore({ wins: 0, ties: 0, losses: 0 });
  }, []);
  // This function resets the game
  const resetGame = useCallback(() => {
    setSquares(defaultSquares());
    setModalIsOpen(false);
  }, []);

  // Agree with @LukasBarry about the nested ternaries. Here's one way to make that code easier to read,
  // even if it's a little verbose/repetitive. In a real project I'd probably extract the modal into its own component/JS file.
  const resultModalUi = useMemo(() => {
    switch(result) {
      case 'tie': return (
        <div className="result yellow">Tie!</div>
      );
      case 'o': return (
        <div className="result red">You Lose!</div>
      );
      default: return (
        <div className="result green">You Win!</div>
      );
    }
  }, [result]);

  // Here we're rendering our Board, Squares, and some buttons.
  return (
    <main>
      <Board>
        {squares.map((square, index) => (
          <Square
            x={square === 'x' ? 1 : 0}
            o={square === 'o' ? 1 : 0}
            onClick={() => handleSquareClick(index)}
            key={index}
          />
        ))}
      </Board>
      <div className='scoreboard'>
        Wins: {score.wins} Ties: {score.ties} Losses: {score.losses}
      </div>
      <button className="reset-score-button" onClick={resetScore}>
        Reset Score
      </button>
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={resetGame}
        contentLabel="Result Modal"
        className="ReactModal__Content"
        overlayClassName="ReactModal__Overlay"
      >
        <h2>Game Over</h2>
        {resultModalUi}
        <button className='play-again-btn' onClick={resetGame}>Play Again</button>
      </Modal>
    </main>
  );
}

export default App;
