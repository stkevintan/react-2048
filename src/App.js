import React, { Component } from 'react';
import styled, { css } from 'react-emotion'
import './App.css';
import Board from './Board'
import animate, { easeInCubic } from './animate';
import ReactSwipeEvents from './ReactSwipeEvents'
import debounce from 'debounce'
const keyMap = {
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down'
}

class App extends Component {
  constructor(props) {
    super(props)
    this.grids = this.getInitialGrids()
    this.state = {
      score: 0,
      isGameOver: false,
    }
    this.handleCommand = debounce(this.handleCommand, 150, true)
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
    return grids
  }


  componentDidMount() {
    this.wrapEl = document.querySelector('.grids')
    const action = []
    for (let i = 0; i < 2; i++) {
      action.push({ type: 'create', ...this.generateOneGrid() })
    }
    this.dispatch(action)
    document.addEventListener('keyup', e => {
      const dir = keyMap[e.keyCode]
      if (!dir) return
      console.log(dir)
      this.handleCommand(dir)
    })
    const x = window.matchMedia('(max-width: 520px)')
    this.adjustTilePos(x)
    x.addListener(this.adjustTilePos)
  }
  handleCommand = (dir) => {
    switch (dir) {
      default: return
      case 'up': return this.handleUpCommand()
      case 'down': return this.handleDownCommand()
      case 'left': return this.handleLeftCommand()
      case 'right': return this.handleRightCommand()
    }
  }

  adjustTilePos = (x) => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const el = this.wrapEl.querySelector(`.tile-${i}-${j}`)
        if (el) {
          const grid = this.wrapEl.querySelector(`.grid-${i}-${j}`)
          const rect = this.getRelativeRect(grid, i, j)
          console.log(rect)
          el.style.left = `${rect.x}px`
          el.style.top = `${rect.y}px`
        }
      }
    }
  }


  get wrapRect() {
    return this.wrapEl ? this.wrapEl.getBoundingClientRect() : {}
  }

  clearTiles = () => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const els = this.wrapEl.querySelectorAll(`.tile-${i}-${j}`)
        if (els.length > 1) {
          let hasKeeped = false
          for (let k = 0; k < els.length; k++) {
            if (!hasKeeped && +els[k].textContent === this.grids[i][j]) {
              hasKeeped = true
            } else {
              this.remove(els[k])
            }
          }
        }
      }
    }
  }

  dispatch = async (action) => {
    console.log(action)
    const asyncCreateTask = []
    const asyncMoveTask = []
    for (let i = 0; i < action.length; i++) {
      if (action[i].type === 'create') asyncCreateTask.push(this.dispatchCreate(action[i]))
      if (action[i].type === 'move') asyncMoveTask.push(this.dispatchMove(action[i]))
    }
    await Promise.all(asyncMoveTask)
    await Promise.all(asyncCreateTask)
    console.log('all animate done! now clean')
    this.clearTiles()
  }
  calcPos = (i, j, width, height) => {
    return {
      x: 10 * (j + 1) + j * width,
      y: 10 * (i + 1) + i * height,
    }
  }
  getRelativeRect = (el, i, j) => {
    const rect = el.getBoundingClientRect()
    return {
      ...this.calcPos(i, j, rect.width, rect.height),
      width: rect.width,
      height: rect.height,
    }
  }

  remove = (el) => {
    el.parentNode.removeChild(el)
  }

  dispatchCreate = async ({ pos, val }) => {
    const [x, y] = pos
    const el = document.querySelector(`.grid-${x}-${y}`)
    const tileEl = document.createElement('div')
    const elRect = this.getRelativeRect(el, x, y)
    tileEl.style.cssText = `
    position: absolute; 
    left:${elRect.x}px; 
    top: ${elRect.y}px;
    `
    tileEl.className = `tile tile-${val} tile-${x}-${y}`
    tileEl.textContent = val
    this.wrapEl.appendChild(tileEl)
    await animate.exec(percent => {
      tileEl.style.opacity = 1 * percent
      tileEl.style.transform = `scale(${1 * percent})`
    }, 300, easeInCubic)
  }

  dispatchMove = async ({ from, to, merged }) => {
    const [fx, fy] = from
    const [tx, ty] = to
    const fromEl = document.querySelector(`.tile-${fx}-${fy}`)
    const targetEl = document.querySelector(`.grid-${tx}-${ty}`)
    const fromRect = this.getRelativeRect(fromEl, fx, fy)
    const targetRect = this.getRelativeRect(targetEl, tx, ty)
    const deltaLeft = targetRect.x - fromRect.x
    const deltaTop = targetRect.y - fromRect.y
    // move fromEl to targetEl
    fromEl.style.zIndex = 0
    const firstAnimate = async () => {
      await animate.exec(percent => {
        if (!fromEl) return
        fromEl.style.left = `${percent * (deltaLeft) + fromRect.x}px`
        fromEl.style.top = `${percent * (deltaTop) + fromRect.y}px`
      }, 150)
    }
    const secondAnimate = async () => {
      fromEl.className = fromEl.className.replace(/\btile-\d+-\d+\b/, `tile-${tx}-${ty}`)
      if (merged) {
        const tileEl = document.createElement('div')
        tileEl.style.cssText = `
        position: absolute; 
        left:${targetRect.x}px; 
        top: ${targetRect.y}px;
        transform: scale(0)
        z-index: 10
      `
        tileEl.textContent = this.grids[tx][ty]
        tileEl.className = fromEl.className.replace(/\btile-\d+\b/, `tile-${this.grids[tx][ty]}`)
        this.wrapEl.appendChild(tileEl)
        await animate.exec(percent => {
          if (percent <= 0.5) {
            tileEl.style.transform = `scale(${1.2 * 2 * percent})`
          } else {
            tileEl.style.transform = `scale(${1.2 - 0.2 * 2 * (percent - 0.5)})`
          }
        }, 300)
      }
    }
    await Promise.all([firstAnimate(), secondAnimate()])
  }



  updateGrids = (action, score) => {
    if (action.length) {
      const act = this.generateOneGrid()
      if (act === null) {
        this.setState({ isGameOver: true })
        return
      }
      action.push({ type: 'create', ...act })
    }
    console.table(this.grids)
    this.setState(state => ({ score: score + state.score }))
    this.dispatch(action)
  }

  canMerge(target, src) {
    if (target === 0 && src !== 0) return 2
    if (target && src && target === src) return 1
    return 0
  }

  handleUpCommand = () => {
    const { grids } = this
    const action = []
    let status
    let score = 0
    for (let i = 0; i < 4; i++) {
      let border = 0
      for (let j = 0; j < 3; j++) {
        let cur = j, lastJ = -1
        while (cur >= border && (status = this.canMerge(grids[cur][i], grids[cur + 1][i]))) {
          grids[cur][i] += grids[cur + 1][i]
          grids[cur + 1][i] = 0
          lastJ = cur
          if (status === 1) {
            score += grids[cur][i]
            border = cur + 1
            break
          }
          cur--
        }
        if (lastJ !== -1 && lastJ !== j + 1) {
          action.push({
            type: 'move',
            merged: status === 1,
            from: [j + 1, i],
            to: [lastJ, i]
          })
        }
      }
    }
    this.updateGrids(action, score)
  }

  handleDownCommand = () => {
    const { grids } = this
    const action = []
    let score = 0
    let status
    for (let i = 0; i < 4; i++) {
      let border = 3
      for (let j = 3; j > 0; j--) {
        let cur = j, lastJ = -1
        while (cur <= border && (status = this.canMerge(grids[cur][i], grids[cur - 1][i]))) {
          grids[cur][i] += grids[cur - 1][i]
          grids[cur - 1][i] = 0
          lastJ = cur
          if (status === 1) {
            score += grids[cur][i]
            border = cur - 1
            break
          }
          cur++
        }
        if (lastJ !== -1 && lastJ !== j - 1) {
          action.push({
            type: 'move',
            merged: status === 1,
            from: [j - 1, i],
            to: [lastJ, i]
          })
        }
      }
    }
    this.updateGrids(action, score)
  }

  handleLeftCommand = () => {
    const { grids } = this
    const action = []
    let score = 0
    let status
    for (let i = 0; i < 4; i++) {
      let border = 0
      for (let j = 0; j < 3; j++) {
        let cur = j, lastJ = -1
        while (cur >= border && (status = this.canMerge(grids[i][cur], grids[i][cur + 1]))) {
          grids[i][cur] += grids[i][cur + 1]
          grids[i][cur + 1] = 0
          lastJ = cur
          if (status === 1) {
            score += grids[i][cur]
            border = cur + 1
            break
          }
          cur--
        }
        if (lastJ !== -1 && lastJ !== j + 1) {
          action.push({
            type: 'move',
            merged: status === 1,
            from: [i, j + 1],
            to: [i, lastJ]
          })
        }
      }
    }
    this.updateGrids(action, score)
  }

  handleRightCommand = () => {
    const { grids } = this
    const action = []
    let status
    let score = 0
    for (let i = 0; i < 4; i++) {
      let border = 3
      for (let j = 3; j > 0; j--) {
        let cur = j, lastJ = -1
        while (cur <= border && (status = this.canMerge(grids[i][cur], grids[i][cur - 1]))) {
          grids[i][cur] += grids[i][cur - 1]
          grids[i][cur - 1] = 0
          lastJ = cur
          if (status === 1) {
            score += grids[i][cur]
            border = cur - 1
            break
          }
          cur++
        }
        if (lastJ !== -1 && lastJ !== j - 1) {
          action.push({
            type: 'move',
            merged: status === 1,
            from: [i, j - 1],
            to: [i, lastJ]
          })
        }
      }
    }
    this.updateGrids(action, score)
  }

  generateOneGrid = () => {
    const emptyGrids = []
    for (let i = 0; i < this.grids.length; i++) {
      for (let j = 0; j < this.grids.length; j++) {
        if (this.grids[i][j] === 0) emptyGrids.push([i, j])
      }
    }
    if (emptyGrids.length === 0) {
      return null
    }
    const randomIndex = Math.floor(Math.random() * emptyGrids.length)
    const [x, y] = emptyGrids[randomIndex]
    this.grids[x][y] = Math.random() > 0.2 ? 2 : 4
    return { pos: [x, y], val: this.grids[x][y] }
  }

  retry = () => {
    const tiles = this.wrapEl.querySelectorAll('.tile')
    tiles.forEach(tile => this.wrapEl.removeChild(tile))
    this.grids = this.getInitialGrids()
    const action = []
    for (let i = 0; i < 2; i++) {
      action.push({ type: 'create', ...this.generateOneGrid() })
    }
    this.dispatch(action)
    this.setState({
      score: 0,
      isGameOver: false,
    })
  }

  render() {
    const handles = {
      onSwipedUp: () => this.handleCommand('up'),
      onSwipedDown: () => this.handleCommand('down'),
      onSwipedLeft: () => this.handleCommand('left'),
      onSwipedRight: () => this.handleCommand('right'),
    }
    return (
      <div className="App">
        <Frame>
          {this.state.isGameOver && <Cover>
            <p>Game Over</p>
            <a onClick={this.retry} href="javascript:void(0)">Try again!</a>
          </Cover>}
          <div className={css` display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;`}>
            <Score>
              Score: {this.state.score}
            </Score>
            <button className="btn" onClick={this.retry}>New Game</button>
          </div>
          <ReactSwipeEvents {...handles}>
            <Board grids={this.state.grids} />
          </ReactSwipeEvents>
        </Frame>
      </div>
    );
  }
}


const Frame = styled('div')`
      display: inline-block;
      position: relative;
      margin: 20px auto;
      /* padding: 20px 40px; */
      /* box-shadow: 1px 1px 1px rgba(0,0,0,0.2), -1px -1px 1px rgba(0,0,0,0.1); */
    `;

const Cover = styled('div')`
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.2);
    `;

const Score = styled('div')`
      text-align: left;
    `;




export default App;

