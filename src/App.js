import React, { Component } from 'react';
import logo from './logo.svg';
import styled, { css } from 'react-emotion'
import './App.css';
import Board from './Board'


const keyMap = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      score: 0,
      grids: this.getInitialGrids(),
      isGameOver: false,
    }
  }

  getInitialGrids = () => {
    const grids = []
    for (let i = 0; i < 4; i++) {
      const grid = []
      for (let j = 0; j < 4; j++) {
        grid.push(0)
      }
      grids.push(grid)
    }
    this.generateOneGrid(grids);
    this.generateOneGrid(grids);
    return grids
  }

  componentDidMount() {
    document.addEventListener('keyup', e => {
      const dir = keyMap[e.keyCode]
      if (!dir) return
      switch (dir) {
        default: return
        case 'up': return this.handleUpCommand()
        case 'down': return this.handleDownCommand()
        case 'left': return this.handleLeftCommand()
        case 'right': return this.handleRightCommand()
      }
    })
  }

  updateGrids = (grids, action, score) => {
    if (action.length) {
      const act = this.generateOneGrid(grids)
      action.push({ type: 'create', ...act })
    }
    if (grids === null) this.setState({ isGameOver: true })
    else this.setState(state => ({ grids, score: score + state.score }))
  }

  canMerge(target, src) {
    if (target === 0 && src !== 0) return 2
    if (target && src && target === src) return 1
    return 0
  }

  handleUpCommand = () => {
    const { grids } = this.state
    const action = []
    let status
    let score = 0
    for (let i = 0; i < 4; i++) {
      let hasMerged = false
      for (let j = 0; j < 3; j++) {
        let cur = j
        while (cur >= 0 && (status = this.canMerge(grids[cur][i], grids[cur + 1][i]))) {
          if (status === 1 && hasMerged) break
          grids[cur][i] = grids[cur + 1][i] + grids[cur][i]
          grids[cur + 1][i] = 0
          if (status === 1) score += grids[i][cur]
          cur--
          if (status === 1) {
            hasMerged = true
            break
          }
        }
        if (cur !== j) {
          action.push({
            type: 'move',
            from: [j, i],
            to: [cur, i]
          })
        }
      }
    }
    this.updateGrids(grids, action, score)
  }

  handleDownCommand = () => {
    const { grids } = this.state
    const action = []
    let score = 0
    let status
    for (let i = 0; i < 4; i++) {
      let hasMerged = false
      for (let j = 3; j > 0; j--) {
        let cur = j
        while (cur < 4 && (status = this.canMerge(grids[cur][i], grids[cur - 1][i]))) {
          if (status === 1 && hasMerged) break
          grids[cur][i] = grids[cur][i] + grids[cur - 1][i]
          grids[cur - 1][i] = 0
          if (status === 1) score += grids[i][cur]
          cur++
          if (status === 1) {
            hasMerged = true
            break
          }
        }
        if (cur !== j) {
          action.push({
            type: 'move',
            from: [j, i],
            to: [cur, i]
          })
        }
      }
    }
    this.updateGrids(grids, action, score)
  }

  handleLeftCommand = () => {
    const { grids } = this.state
    const action = []
    let score = 0
    let status
    for (let i = 0; i < 4; i++) {
      let hasMerged = false
      for (let j = 0; j < 3; j++) {
        let cur = j
        while (cur >= 0 && (status = this.canMerge(grids[i][cur], grids[i][cur + 1]))) {
          if (status === 1 && hasMerged) break
          grids[i][cur] = grids[i][cur + 1] + grids[i][cur]
          grids[i][cur + 1] = 0
          if (status === 1) score += grids[i][cur]
          cur--
          if (status === 1) {
            hasMerged = true
            break
          }
        }
        if (cur !== j) {
          action.push({
            type: 'move',
            from: [i, j],
            to: [i, cur]
          })
        }
      }
    }
    this.updateGrids(grids, action, score)
  }

  handleRightCommand = () => {
    const { grids } = this.state
    const action = []
    let status
    let score = 0
    for (let i = 0; i < 4; i++) {
      let hasMerged = false
      for (let j = 3; j > 0; j--) {
        let cur = j
        while (cur < 4 && (status = this.canMerge(grids[i][cur], grids[i][cur - 1]))) {
          if (status === 1 && hasMerged) break
          grids[i][cur] = grids[i][cur] + grids[i][cur - 1]
          grids[i][cur - 1] = 0
          if (status === 1) score += grids[i][cur]
          cur++
          if (status === 1) {
            hasMerged = true
            break
          }
        }
        if (cur !== j) {
          action.push({
            type: 'move',
            from: [i, j],
            to: [i, cur]
          })
        }
      }
    }
    this.updateGrids(grids, action, score)
  }

  generateOneGrid = (grids) => {
    const emptyGrids = []
    for (let i = 0; i < grids.length; i++) {
      for (let j = 0; j < grids.length; j++) {
        if (grids[i][j] === 0) emptyGrids.push([i, j])
      }
    }
    if (emptyGrids.length === 0) {
      return null
    }
    const randomIndex = Math.floor(Math.random() * emptyGrids.length)
    const [x, y] = emptyGrids[randomIndex]
    grids[x][y] = Math.random() > 0.2 ? 2 : 4
    return { pos: [x, y], val: grids[x][y] }
  }

  retry = () => {
    this.setState({
      isGameOver: false,
      grids: this.getInitialGrids()
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <Frame>

          {this.state.isGameOver && <Cover>
            <p>Game Over</p>
            <a onClick={this.retry} href="javascript:void(0)">Try again!</a>
          </Cover>}
          <Score>
            Score: {this.state.score}
          </Score>
          <Board grids={this.state.grids} />
        </Frame>
      </div>
    );
  }
}


const Frame = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  justify-content: center;
  width: 402px;
  margin: 20px auto;
  padding: 20px 40px;
  box-shadow: 1px 1px 1px rgba(0,0,0,0.2), -1px -1px 1px rgba(0,0,0,0.1);
`;

const Cover = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.2)
`;

const Score = styled.div`
  text-align: left;
  margin-bottom: 10px;
`;
export default App;
