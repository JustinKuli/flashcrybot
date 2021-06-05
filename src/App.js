import './App.css';

import BotForm from './BotForm'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function App() {
  return (
    <div className="App">
      <Container>
        <Row>
          <Col sm={10} md={8}>
            <BotForm />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
