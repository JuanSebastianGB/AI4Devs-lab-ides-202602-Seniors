import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AddCandidateForm } from '../components/AddCandidate/AddCandidateForm';
import { Container } from 'react-bootstrap';

export function AddCandidatePage(): React.ReactElement {
  const navigate = useNavigate();

  return (
    <Container className="py-4">
      <h1>Add Candidate</h1>
      <AddCandidateForm onSuccess={() => navigate('/')} />
    </Container>
  );
}
