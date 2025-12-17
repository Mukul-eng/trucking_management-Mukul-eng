import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const primaryColor = '#295b52';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Password reset functionality would be implemented here
    // For now, just show a message
    setTimeout(() => {
      setMessage('Password reset functionality is not yet implemented. Please contact your administrator.');
      setLoading(false);
    }, 1000);
  };

  return (
    <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center px-3">
      <Card style={{ maxWidth: "500px", width: "100%" }}>
        <Card.Body className="p-5">
          <h2 className="text-center mb-4" style={{ color: primaryColor }}>Forgot Password</h2>
          
          {message && (
            <Alert variant="info" className="mb-3">
              {message}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </Form.Group>

            <Button 
              type="submit" 
              className="w-100 mb-3"
              disabled={loading}
              style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
            >
              {loading ? 'Sending...' : 'Reset Password'}
            </Button>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/login')}
                style={{ color: primaryColor }}
              >
                Back to Login
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ForgotPassword;
