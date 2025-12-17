import React from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const primaryColor = '#295b52';

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center px-3">
      <Card style={{ maxWidth: "500px", width: "100%" }}>
        <Card.Body className="p-5">
          <h2 className="text-center mb-4" style={{ color: primaryColor }}>Sign Up</h2>
          <p className="text-center text-muted mb-4">
            Driver accounts are created by administrators only. Please contact your administrator to get access.
          </p>
          <div className="text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/login')}
              style={{ color: primaryColor }}
            >
              Back to Login
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Signup;
