import React, { Component } from "react";
import Node from "./Node/Node";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";
import { useState } from "react";
import "react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css";
import RangeSlider from "react-bootstrap-range-slider";

import "./PathFindingViz.css";

// const START_NODE_ROW = 10;
// const START_NODE_COL = 0;
// const FINISH_NODE_ROW = 10;
// const FINISH_NODE_COL = this.state.TotalCol;

export default class pathFindingVizz extends Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
      mouseIsPressed: false,
      processRunning: false,
      TotalCol: 25,
      START_NODE_ROW: 10,
      START_NODE_COL: 0,
      FINISH_NODE_ROW: 10,
      FINISH_NODE_COL: 25,
    };
  }

  // START_NODE_ROW = 10;
  // START_NODE_COL = 0;
  // FINISH_NODE_ROW = 10;
  // FINISH_NODE_COL = this.state.TotalCol;

  componentDidMount() {
    this.setState({ FINISH_NODE_COL: this.state.TotalCol });
    const grid = getInitialGrid(
      this.state.TotalCol,
      this.state.START_NODE_COL,
      this.state.START_NODE_ROW,
      this.state.FINISH_NODE_COL,
      this.state.FINISH_NODE_ROW
    );
    this.setState({ grid });
  }

  handleMouseDown(row, col) {
    if (!this.state.processRunning) {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleMouseEnter(row, col) {
    if (!this.state.processRunning) {
      if (!this.state.mouseIsPressed) return;
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    }
  }

  handleMouseUp() {
    if (!this.processRunning) {
      this.setState({ mouseIsPressed: false });
    }
  }

  animateDijkstra(visitedNodesInOrder, getNodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(getNodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  }

  animateShortestPath(getNodesInShortestPathOrder) {
    for (let i = 0; i < getNodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = getNodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
    }
    this.setState({ processRunning: false });
  }

  sliderComponent = () => {
    const [value, setValue] = useState(25);
    // this.setState({ TotalCol: setValue });
    console.log(this.state.FINISH_NODE_COL + "totalcol");
    return (
      <RangeSlider
        value={value}
        min={10}
        max={40}
        size={"lg"}
        onChange={(changeEvent) => (
          setValue(changeEvent.target.value),
          this.setState({
            TotalCol: changeEvent.target.value,
            FINISH_NODE_COL: changeEvent.target.value - 1,
            grid: getInitialGrid(
              changeEvent.target.value,
              this.state.START_NODE_COL,
              this.state.START_NODE_ROW,
              changeEvent.target.value - 1,
              this.state.FINISH_NODE_ROW
            ),
          })
        )}
      />
    );
  };

  visualizeDijkstra() {
    this.setState({ processRunning: true });
    console.log(this.state.processRunning);
    const { grid } = this.state;
    const startNode =
      grid[this.state.START_NODE_ROW][this.state.START_NODE_COL];
    const finishNode =
      grid[this.state.FINISH_NODE_ROW][this.state.FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
    // this.setState({ processRunning: false });
  }

  reset() {
    // const grid = getInitialGrid(this.state.TotalCol);
    // this.setState({ grid });
    window.location.reload(false);
  }

  render() {
    const { grid, mouseIsPressed } = this.state;

    // const { nodes } = this.state;
    // console.log(nodes);
    // const [value, setValue] = useState(0);
    return (
      <>
        <button onClick={() => this.visualizeDijkstra()}>
          Visualize Dijkstra's Algorithm
        </button>
        <button onClick={() => this.reset()}>Reset Grid</button>
        <div className="slider">
          <this.sliderComponent></this.sliderComponent>
        </div>

        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall } = node;
                  {
                    console.log(
                      mouseIsPressed + " " + this.state.processRunning
                    );
                  }
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) =>
                        !this.state.processRunning
                          ? this.handleMouseDown(row, col)
                          : null
                      }
                      onMouseEnter={(row, col) =>
                        !this.state.processRunning
                          ? this.handleMouseEnter(row, col)
                          : null
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = (TotalCol, startCol, startRow, endCol, endRow) => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < TotalCol; col++) {
      currentRow.push(createNode(col, row, startCol, startRow, endCol, endRow));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row, startCol, startRow, endCol, endRow) => {
  console.log("createNode" + endCol);
  return {
    col,
    row,
    isStart: row === startRow && col === startCol,
    isFinish: row === endRow && col === endCol,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
