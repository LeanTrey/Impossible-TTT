import React from 'react';
import './App.css';
import Board from "./Board";
import Square from "./Square";
import { useState, useEffect } from 'react';
import Modal from 'react-modal';

const defaultSquares = () => (new Array(9)).fill(null);

const lines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6], // diagonals
];

// This is for accessibility reasons. 
Modal.setAppElement('#root');

function App() {
  const [squares, setSquares] = useState(defaultSquares());
  const [result, setResult] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  function availableMoves(squares) {
    return squares
      .map((square, index) => square === null ? index : null)
      .filter(val => val !== null);
  }

  function calculateResult(squares) {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.filter(val => val === null).length ? null : 'tie';
  }

  function minimax(squares, depth, isMaximizingPlayer) {
    const result = calculateResult(squares);
    
    if (result === 'x') return { score: -10 };
    if (result === 'o') return { score: 10 };
    if (result === 'tie') return { score: 0 };

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

  useEffect(() => {
    const isComputerTurn = squares.filter(square => square !== null).length % 2 === 1;
    const result = calculateResult(squares);
    
    if (result) {
      setResult(result);
      setModalIsOpen(true);
      return;
    }

    const putComputerAt = index => {
      let newSquares = squares.slice();
      newSquares[index] = 'o';
      setSquares(newSquares);
    };

    if (isComputerTurn && !result) {
      const bestMove = minimax(squares.slice(), 0, true).move;
      putComputerAt(bestMove);
    }
  }, [squares, result]);

  function handleSquareClick(index) {
    const isPlayerTurn = squares.filter(square => square !== null).length % 2 === 0;
    if (isPlayerTurn && !result) {
      let newSquares = squares.slice();
      newSquares[index] = 'x';
      setSquares(newSquares);
    }
  }

  function resetGame() {
    setSquares(defaultSquares());
    setResult(null);
    setModalIsOpen(false);
  }

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


