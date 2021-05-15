import React from 'react';
import styled from 'styled-components';

interface IStyleButton {
    primary: boolean;
}

const StyledButton = styled.a<IStyleButton>`
  
  background: ${props => props.primary ? "palevioletred" : "white"};
  color: ${props => props.primary ? "white" : "palevioletred"};

  font-size: 1em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 2px solid palevioletred;
  border-radius: 3px;
  text-decoration: none;
`;

const Button = ({ href, children, ...rest }: any) => {

    return (
        <StyledButton href={href} {...rest}>{children}</StyledButton>
    )
}

export default Button