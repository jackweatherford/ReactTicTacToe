import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
  return (
    <button
      className={`square ${props.isWinning ? "winning" : ""}`}
      onClick={props.onClick}
      disabled={props.value || props.isFocusable ? true : false}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isFocusable={this.props.winner}
        isWinning={this.props.winningLine && this.props.winningLine.includes(i)}
      />
    );
  }

  render() {
    var squares = [];
    for (var i = 0; i < 3; i++) {
      var row = [];
      for (var j = 0; j < 3; j++) {
        row.push(this.renderSquare(i * 3 + j));
      }
      squares.push(
        <div key={i} className="board-row">
          {row}
        </div>
      );
    }

    return <div>{squares}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          lastMove: -1,
        },
      ],
      stepNumber: 0,
      xIsNext: true,
      isAscending: true,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    this.setState({
      history: history.concat([
        {
          squares: squares,
          lastMove: i,
        },
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  toggleSort() {
    this.setState({
      isAscending: !this.state.isAscending,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const { winner, winningLine } = calculateWinner(current.squares);

    const moves = history.map((step, move) => {
      const col = step.lastMove % 3;
      const row = Math.floor(step.lastMove / 3);
      var desc = move
        ? `Go to move #${move} (${col}, ${row})`
        : "Go to game start";
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>
            {move === this.state.stepNumber ? <strong>{desc}</strong> : desc}
          </button>
        </li>
      );
    });

    let status;
    if (winner) {
      status = `Winner: ${winner}`;
    } else if (current.squares.includes(null)) {
      status = `Next player: ${this.state.xIsNext ? "X" : "O"}`;
    } else {
      status = `No more moves - draw!`;
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winner={winner}
            winningLine={winningLine}
          />
        </div>
        <div className="game-info">
          <div> {status} </div>
          <label>
            Current Move Sort:
            {this.state.isAscending ? " Ascending" : " Descending"}
          </label>
          {this.state.isAscending ? (
            <ol start="0">{moves}</ol>
          ) : (
            <ol start={moves.length - 1} reversed>
              {moves.reverse()}
            </ol>
          )}
          <button className="sort-button" onClick={() => this.toggleSort()}>
            Toggle Move Sort
          </button>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningLine: lines[i],
      };
    }
  }

  return {
    winner: null,
    winningLine: null,
  };
}
