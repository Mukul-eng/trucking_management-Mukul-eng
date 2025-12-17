import React from 'react';
import { Container, Card } from 'react-bootstrap';

const DriverProfile = () => {
  const primaryColor = "#295b52";
  const lightBackgroundColor = "rgba(94, 172, 131, 0.15)";
  const cardBg = "rgba(255, 255, 255, 0.9)";

  // Get user info from localStorage
  const userName = localStorage.getItem('userName') || 'Driver';
  const userEmail = localStorage.getItem('userEmail') || '';
  const userId = localStorage.getItem('userId') || '';
  const userRole = localStorage.getItem('userRole') || 'DRIVER';

  return (
    <Container 
      fluid 
      style={{
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: lightBackgroundColor
      }}
    >
      <h2 
        style={{
          color: primaryColor,
          marginBottom: "20px",
          fontWeight: "bold"
        }}
      >
        MY PROFILE
      </h2>

      <Card style={{ backgroundColor: cardBg, padding: "20px", borderLeft: `5px solid ${primaryColor}` }}>
        <Card.Body>
          <div style={{ marginBottom: "20px" }}>
            <h5 style={{ color: primaryColor }}>Driver Information</h5>
            <hr />
            <p style={{ fontSize: "16px" }}>
              <strong>Name:</strong> {userName}
            </p>
            <p style={{ fontSize: "16px" }}>
              <strong>Email:</strong> {userEmail || 'N/A'}
            </p>
            <p style={{ fontSize: "16px" }}>
              <strong>User ID:</strong> {userId}
            </p>
            <p style={{ fontSize: "16px" }}>
              <strong>Role:</strong> {userRole}
            </p>
          </div>

          <div>
            <p className="text-muted">
              Profile management features can be added here in the future.
            </p>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DriverProfile;
