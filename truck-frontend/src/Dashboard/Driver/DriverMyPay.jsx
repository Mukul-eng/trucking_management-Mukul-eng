import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Table, Alert } from 'react-bootstrap';
import axiosInstance from '../../api/axiosInstance';

const DriverMyPay = () => {
  const primaryColor = "#295b52";
  const lightBackgroundColor = "rgba(94, 172, 131, 0.15)";
  const cardBg = "rgba(255, 255, 255, 0.9)";

  const [selectedMonth, setSelectedMonth] = useState('2025-11');
  const [payData, setPayData] = useState({
    summary: { totalHours: 0, grossPay: 0, status: '' },
    tickets: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch pay history when month changes
  useEffect(() => {
    fetchPayHistory();
  }, [selectedMonth]);

  // Fetch pay history
  const fetchPayHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get(`/driver/pay?month=${selectedMonth}`);
      
      if (response.data.success) {
        setPayData(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pay history');
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
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

  return (
    <Container 
      fluid 
      style={{
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: lightBackgroundColor
      }}
    >
      {/* Page Title */}
      <h2 
        style={{
          color: primaryColor,
          marginBottom: "20px",
          fontWeight: "bold"
        }}
      >
        MY PAY HISTORY
      </h2>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {/* Month Select */}
      <Card style={{ backgroundColor: cardBg, padding: "20px", borderLeft: `5px solid ${primaryColor}` }}>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label style={{ color: primaryColor, fontWeight: "bold" }}>
              Select Month:
            </Form.Label>
            <Form.Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                borderColor: primaryColor
              }}
            >
              <option value="2025-11">November 2025</option>
              <option value="2025-10">October 2025</option>
              <option value="2025-09">September 2025</option>
              <option value="2025-08">August 2025</option>
            </Form.Select>
          </Form.Group>

          {/* Summary */}
          {loading ? (
            <div className="text-center p-3">Loading...</div>
          ) : (
            <div
              style={{
                border: `1px solid ${primaryColor}`,
                borderRadius: "10px",
                padding: "15px",
                backgroundColor: "white"
              }}
            >
              <h5 style={{ color: primaryColor }}>SUMMARY</h5>
              <hr />

              <p style={{ fontSize: "16px" }}>
                <strong>Total Hours:</strong> {payData.summary?.totalHours?.toFixed(1) || 0}
              </p>
              <p style={{ fontSize: "16px" }}>
                <strong>Gross Pay:</strong> {formatCurrency(payData.summary?.grossPay || 0)}
              </p>
              <p style={{ fontSize: "16px" }}>
                <strong>Status:</strong> {payData.summary?.status || 'N/A'}
              </p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pay Tickets List */}
      <h4 
        className="mt-4" 
        style={{ color: primaryColor }}
      >
        PAY TICKETS LIST
      </h4>

      <Card style={{ backgroundColor: cardBg }}>
        <Card.Body>
          {loading ? (
            <div className="text-center p-4">Loading tickets...</div>
          ) : payData.tickets?.length > 0 ? (
            <Table bordered hover responsive>
              <thead style={{ backgroundColor: primaryColor, color: "white" }}>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Ticket#</th>
                  <th>Hours</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {payData.tickets.map((ticket, index) => (
                  <tr key={index}>
                    <td>{formatDate(ticket.date)}</td>
                    <td>{ticket.customer}</td>
                    <td>{ticket.ticket_number}</td>
                    <td>{parseFloat(ticket.hours || 0).toFixed(1)}</td>
                    <td>{formatCurrency(ticket.amount || 0)}</td>
                    <td>{ticket.status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center p-4">
              <p>No pay records found for the selected month.</p>
            </div>
          )}
        </Card.Body>
      </Card>

    </Container>
  );
};

export default DriverMyPay;
