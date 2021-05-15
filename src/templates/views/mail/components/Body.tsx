import React from 'react';

import Grid from './Grid';

const style = {

  content: {
    backgroundColor: 'white',
    padding: '20px',
  },

};

const Body = ({ children }: any) => {
  return (
    <Grid>
      <Grid.Cell style={style.content}>
        {children}
      </Grid.Cell>
    </Grid>
  );
}

export default Body;

