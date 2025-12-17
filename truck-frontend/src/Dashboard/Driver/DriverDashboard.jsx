import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const primaryColor = "#295b52";
  const lightBackgroundColor = "rgba(94, 172, 131, 0.15)";
  const cardBg = "rgba(255, 255, 255, 0.9)";
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    driver: { name: '', user_id_code: '' },
    weeklySnapshot: { totalHours: 0, estimatedPay: 0 },
    recentTickets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/driver/dashboard');
        
        if (response.data.success) {
          setDashboardData(response.data.data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data');
        // Show error toast
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  const handleNewTicket = () => {
    navigate('/driver/add-ticket');
  };

  if (loading) {
    return (
      <Container fluid 
        style={{ 
          minHeight: "100vh", 
          padding: "20px",
          backgroundColor: lightBackgroundColor,
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div>Loading dashboard...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid 
        style={{ 
          minHeight: "100vh", 
          padding: "20px",
          backgroundColor: lightBackgroundColor
        }}
      >
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container fluid 
      style={{ 
        minHeight: "100vh", 
        padding: "20px",
        backgroundColor: lightBackgroundColor 
      }}
    >

      {/* Top Header */}
      <div 
        style={{
          width: "100%",
          backgroundColor: primaryColor,
          color: "white",
          padding: "15px 20px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "8px",
          fontSize: "18px"
        }}
      >
        <strong>DYNAMIC TRUCKING</strong>
        <div>User ID: <strong>{dashboardData.driver?.user_id_code || 'N/A'}</strong> | Logout</div>
      </div>

      {/* Weekly Snapshot */}
      <Card style={{ borderLeft: `5px solid ${primaryColor}`, backgroundColor: cardBg }}>
        <Card.Body>
          <h4 style={{ color: primaryColor }}>WEEKLY SNAPSHOT</h4>
          <p>This Week</p>

          <Row>
            <Col xs={12} md={6}>
              <p style={{ fontSize: "18px" }}>
                <strong>Total Hours:</strong> {dashboardData.weeklySnapshot?.totalHours?.toFixed(1) || 0}
              </p>
            </Col>
            <Col xs={12} md={6}>
              <p style={{ fontSize: "18px" }}>
                <strong>Estimated Pay:</strong> {formatCurrency(dashboardData.weeklySnapshot?.estimatedPay || 0)}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* New Ticket Button */}
      <div className="text-center mt-4">
        <Button 
          onClick={handleNewTicket}
          style={{
            backgroundColor: primaryColor,
            borderColor: primaryColor,
            width: "100%",
            padding: "15px",
            fontSize: "20px",
            fontWeight: "bold"
          }}
        >
          + NEW TICKET
        </Button>
      </div>

      {/* Recent Tickets */}
      <h4 className="mt-5" style={{ color: primaryColor }}>RECENT TICKETS</h4>

      <Card style={{ backgroundColor: cardBg }}>
        <Card.Body>
          {dashboardData.recentTickets?.length > 0 ? (
            <Table bordered hover responsive>
              <thead style={{ backgroundColor: primaryColor, color: "white" }}>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Ticket#</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentTickets.map((ticket, index) => (
                  <tr key={index}>
                    <td>{formatDate(ticket.date)}</td>
                    <td>{ticket.customer}</td>
                    <td>{ticket.hours?.toFixed(1) || 0}</td>
                    <td>{ticket.status}</td>
                    <td>{ticket.ticket_number}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p>No recent tickets found.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Bottom Navigation */}
      <div 
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          backgroundColor: "white",
          borderTop: `2px solid ${primaryColor}`,
          display: "flex",
          justifyContent: "space-around",
          padding: "10px 0",
          fontWeight: "bold",
        }}
      >
        <div style={{ color: primaryColor }}>Dashboard</div>
        <div>My Pay</div>
        <div>Profile</div>
      </div>

    </Container>
  );
};

export default DriverDashboard;