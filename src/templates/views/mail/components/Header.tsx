import React from 'react';

import Grid from './Grid';
import Img from './Image';

const logoSrc = 'https://s3-eu-west-1.amazonaws.com/sentisis-images/github_public/react-emails/logo.png';

const style = {

  header: {
    margin: '10px auto 20px auto',
    width: 'auto',
  },

  img: {
    height: '35px',
  },

};

const Header = () => {
  return (
    <Grid style={style.header}>
      <Img style={style.img} src={logoSrc} alt="logo" />
    </Grid>
  );
}

export default Header;

