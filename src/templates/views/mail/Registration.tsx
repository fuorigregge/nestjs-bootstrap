import { } from 'styled-components/cssprop'
import React from 'react';
import Grid from './components/Grid';
import Header from './components/Header';
import Title from './components/Title';
import Body from './components/Body';
import Footer from './components/Footer';
import { RegistrationPayload } from '../../../mail/models/registration.model';
import styled from 'styled-components';
import Button from './components/Buttom';


const Container = styled.div`
  background-color: #efefef;
  padding: 20px 0;
  font-family: sans-serif;
`

const Registration = ({ user, t }: RegistrationPayload): JSX.Element => {

  return (
    <Container>
      <Grid main={true} >
        <Header />
        <Body>
          <Title>{user.first_name}</Title>
          <Grid>            
              <p>
                {t.text}
              </p>
              <p>
                <Button primary href={`/verify/${user.auth.jwt.verification_token}`}>{t.verify_account}</Button>
              </p>
            
          </Grid>
        </Body>
        <Footer t={t} />
      </Grid>
    </Container>
  );
}

export default Registration;
