// We're importing the required modules for our app, such as styles and components.
import './App.css';
import Board from "./Board";
import Square from "./Square";
import { useState, useEffect } from 'react';

// Here we're defining the default state for our squares. It's an array of nine null elements.
const defaultSquares = () => (new Array(9)).fill(null);

// These are the combinations that would make a player win in the game.
const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

function App() {
  // We're using the useState hook to manage the state for squares and result in our component.
  const [squares, setSquares] = useState(defaultSquares());
  const [result, setResult] = useState(null);

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
    // If no more squares are available and no winner, then it's a tie.
    return squares.filter(val => val === null).length ? null : 'tie';
  }

  // The minimax function is a recursive function used to calculate the best move for the computer player.
  // It returns an object with the best score and the move that leads to that score.
  function minimax(squares, depth, isMaximizingPlayer) {
    const result = calculateResult(squares);
    
    // If the game has ended, it returns the score of the game.
    if (result === 'x') return { score: -10 }; // if player wins
    if (result === 'o') return { score: 10 }; // if computer wins
    if (result === 'tie') return { score: 0 }; // if it's a tie

    if (isMaximizingPlayer) {
      // If it's the computer's turn it tries to maximize the score.
      let bestScore = -Infinity;
      let move;
      for (let i = 0; i < squares.length; i++) {
        if (!squares[i]) {
          squares[i] = 'o'; // tries a move
          let score = minimax(squares, depth + 1, false).score;
          squares[i] = null; // undoes the move
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
          squares[i] = 'x'; // tries a move
          let score = minimax(squares, depth + 1, true).score;
          squares[i] = null; // undoes the move
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

  // This function resets the game to the initial state.
  function resetGame() {
    setSquares(defaultSquares());
    setResult(null);
  }

  // Here we're rendering our Board and Squares and some interactive buttons.
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
      {!!result && result === 'o' && (
        <div className="result red">
          You LOST!
        </div>
      )}
      {!!result && result === 'tie' && (
        <div className="result yellow">
          It's a DRAW!
        </div>
      )}
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
    </main>
  );
}

export default App;
