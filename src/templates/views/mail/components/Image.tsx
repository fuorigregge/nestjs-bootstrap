import React from 'react';

const imgStyle = {

  img: {
    outline: 'none',
    textDecoration: 'none',
    border: 'none',
    display: 'block',
  },

};

const Image = ({ src, alt, className, style = {} }: any) => {
  return (
    <img
      src={src}
      alt={alt}
      style={{ ...imgStyle.img, ...style }}
      className={className}
    />
  );
}

export default Image;
