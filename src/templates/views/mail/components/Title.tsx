import React from 'react';

import Grid from './Grid';

const style = {

  wrapper: {
    width: 'auto',
    margin: '0 auto',
  },

};

const Title = ({ children }: any) => {
  return (
    <Grid style={style.wrapper}>
      <h1 css={`
        font-size: 24px,
        font-weight: bold,
        margin-top: 5px,
        margin-bottom: 10px,
      `} >
        {children}
      </h1>
    </Grid>
  );
}

export default Title;

