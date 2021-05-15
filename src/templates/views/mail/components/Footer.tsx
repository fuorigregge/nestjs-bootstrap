import React from 'react';

import Grid from './Grid';

const style = {

  footer: {
    margin: '20px 0',
  },

  p: {
    fontSize: 14,
    lineHeight: 1.5,
    margin: 0,
    color: '#607D8B',
    textAlign: 'center' as const,
  },

  a: {
    color: '#00a1ef',
  },

};

const Footer = ({t}: any): JSX.Element => {
  return (    
    <Grid style={style.footer}>
      <Grid.Cell >
        <p style={style.p}>
          {t.footer_p_1}
        </p>
        <p style={style.p}>
          {t.footer_p_2}&nbsp;
          <a style={style.a} href="https://github.com/sentisis/react-emails">here</a>
        </p>
      </Grid.Cell>
    </Grid>
  );
}

export default Footer;

