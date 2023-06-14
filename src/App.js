// We're importing the required modules for our app, such as styles and components.
import React from 'react';
import './App.css';
import Board from "./Board";
import Square from "./Square";
import { useState, useEffect } from 'react';
import Modal from 'react-modal';

// Here we're defining the default state for our squares. It's an array of nine null elements.
const defaultSquares = () => (new Array(9)).fill(null);

// These are the combinations that would make a player win in the game.
const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

Modal.setAppElement('#root');

// We're using the useState hook to manage the state for squares and result in our component.
function App() {
  const [squares, setSquares] = useState(defaultSquares());
  const [result, setResult] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  // This function identifies the available moves in the game. 
  // It looks at each square, if it's null, it means the square is not occupied.
  function availableMoves(squares) {
    return squares
      .map((square, index) => square === null ? index : null)
      .filter(val => val !== null);
  }

  // This function calculates the result of the game. 
  // It checks if any of the winning combinations is filled by a single player.
  function calculateResult(squares) {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    // If no more squares are available and no winner, then it's a tie
    return squares.filter(val => val === null).length ? null : 'tie';
  }

  // function used to calculate the best move for the computer player.
  // It returns an object with the best score and the move that leads to that score.
  function minimax(squares, depth, isMaximizingPlayer) {
    const result = calculateResult(squares);
    
    // Returns the score of the game after it ends
    if (result === 'x') return { score: -10 };
    if (result === 'o') return { score: 10 };
    if (result === 'tie') return { score: 0 };

    if (isMaximizingPlayer) {
      // If it's the computer's turn it tries to maximize the score.
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
  }
  // This useEffect hook runs whenever the state of squares or result changes.
  useEffect(() => {
    const isComputerTurn = squares.filter(square => square !== null).length % 2 === 1;
    const result = calculateResult(squares);
    
    
    // If there's a result, it updates the result state.
    if (result) {
      setResult(result);
      setModalIsOpen(true);
      return;
    }

    // This function will place the computer's move at the given index.
    const putComputerAt = index => {
      let newSquares = squares.slice();
      newSquares[index] = 'o';
      setSquares(newSquares);
    };

    // If it's the computer's turn and there's no result yet, it calculates the best move and makes it.
    if (isComputerTurn && !result) {
      const bestMove = minimax(squares.slice(), 0, true).move;
      putComputerAt(bestMove);
    }
  }, [squares, result]);

  // This function handles the player's move when a square is clicked.
  function handleSquareClick(index) {
    const isPlayerTurn = squares.filter(square => square !== null).length % 2 === 0;
    if (isPlayerTurn && !result) {
      let newSquares = squares.slice();
      newSquares[index] = 'x';
      setSquares(newSquares);
    }
  }
  // This function resets the game.
  function resetGame() {
    setSquares(defaultSquares());
    setResult(null);
    setModalIsOpen(false);
  }

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
        <div className={`result ${result === 'tie' ? 'yellow' : (result === 'o' ? 'red' : 'green')}`}>
          {result === 'tie' ? "It's a Draw!" : (result === 'o' ? "You LOST!" : "You WON!")}
        </div>
        <button className="play-again-button" onClick={resetGame}>Play again</button>
      </Modal>
    </main>
  );
}

export default App;


