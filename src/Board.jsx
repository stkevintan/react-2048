import React, { Component } from 'react'
import styled, { css } from 'react-emotion'
import Color from 'color'
const lightColor = 'rgb(238, 228, 218)'
const darkColor = 'rgb(238, 228, 218)'

export default class Board extends Component {
  render() {
    const keys = [0, 1, 2, 3]
    return (
      <Box>
        {
          this.props.grids.map((grid, index) => (
            <BoxRow key={keys[index]}>
              {
                grid.map((gridItem, index) => (
                  <Grid key={keys[index]} >
                    {gridItem === 0 ? null :
                      <div className={`tile tile-${gridItem}`}>{gridItem}</div>}
                  </Grid>
                ))
              }
            </BoxRow>
          ))
        }
      </Box>
    )
  }
}

const Box = styled.div`
  background: #BBADA1;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: cneter;
`;

const BoxRow = styled.div`
  display:flex;
  justify-content: space-around;
  align-items: center;
`;

const Grid = styled.div`
  width: 100px;
  height: 100px;
  font-size: 55px;
  color: #776e65;
  border-radius: 2px;
  background: rgba(238, 228, 218, 0.35);
  line-height: 100px;
  margin: 5px;
`

