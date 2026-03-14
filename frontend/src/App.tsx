import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import logo from './logo.svg';
import './App.css';
import { AddCandidatePage } from './pages/AddCandidatePage';

function App() {
  return (
    <div className="App">
      <Navbar bg="light" expand="sm">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img src={logo} className="App-logo d-inline-block align-top" alt="Logo" height="30" />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="app-nav" />
          <Navbar.Collapse id="app-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/add-candidate">
                Add Candidate
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <header className="App-header">
                <p>
                  Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <Link className="App-link" to="/add-candidate">
                  Add Candidate
                </Link>
              </header>
            }
          />
          <Route path="/add-candidate" element={<AddCandidatePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
