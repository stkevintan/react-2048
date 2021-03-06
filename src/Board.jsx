import React, { Component } from 'react'
import styled from 'react-emotion'


const grids = []

for (let i = 0; i < 4; i++) {
  grids[i] = []
  for (let j = 0; j < 4; j++) {
    grids[i].push(i * 4 + j)
  }
}

const keys = [0, 1, 2, 3]

export default class Board extends Component {

  render() {
    return (
      <Box className="grids">
        {
          grids.map((grid, index) => (
            <BoxRow key={keys[index]}>
              {
                grid.map((cell, index2) => (
                  <Grid className={`grid grid-${index}-${index2}`} key={keys[index2]} />
                ))
              }
            </BoxRow>
          ))
        }
      </Box>
    )
  }
}

const Box = styled('div')`
  position: relative;
  background: #BBADA1;
  border-radius: 2px;
  padding: 5px;
  display: inline-block;
`;

const BoxRow = styled('div')` 
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Grid = styled('div')`
  color: #776e65;
  border-radius: 2px;
  background: rgba(238, 228, 218, 0.35);
  margin: 5px;
`

