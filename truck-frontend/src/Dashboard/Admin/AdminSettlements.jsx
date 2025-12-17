// src/components/Settlements.jsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert,
  Spinner,
} from 'react-bootstrap';
import { FaFileDownload, FaEnvelope } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

const AdminSettlements = () => {
  // --- Custom Colors ---
  const primaryColor = '#295b52';
  const lightBackgroundColor = 'rgba(94, 172, 131, 0.15)';
  const lightBorderColor = 'rgba(94, 172, 131, 0.8)';

  // --- State for Controls ---
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [statementData, setStatementData] = useState({
    driver: { name: '', user_id_code: '' },
    tickets: [],
    totalPay: 0,
    customer: '',        // e.g., "Aecon Construction"
    customerId: null,    // ← ADD THIS: needed for PDF download
    subtotal: 0,
    gst: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize dates on mount
  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  // Fetch drivers on mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  // Fetch settlement data when filters change
  useEffect(() => {
    if (selectedDriverId && startDate && endDate) {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);
      if (formattedStartDate && formattedEndDate) {
        fetchSettlement();
      }
    } else {
      setStatementData({
        driver: { name: '', user_id_code: '' },
        tickets: [],
        totalPay: 0,
        customer: '',
        customerId: null,
        subtotal: 0,
        gst: 0,
        total: 0,
      });
    }
  }, [selectedDriverId, startDate, endDate]);

  // Fetch drivers list
  const fetchDrivers = async () => {
    try {
      const response = await axiosInstance.get('/admin/drivers');
      if (response.data.success) {
        setDrivers(response.data.data);
        if (response.data.data.length > 0 && !selectedDriverId) {
          setSelectedDriverId(response.data.data[0].id.toString());
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load drivers');
    }
  };

  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  const fetchSettlement = async () => {
    const formattedStartDate = formatDateForAPI(startDate);
    const formattedEndDate = formatDateForAPI(endDate);

    if (!formattedStartDate || !formattedEndDate || !selectedDriverId) {
      setError('Please select valid dates and a driver');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const driverIdParam = String(selectedDriverId).trim();
      if (!driverIdParam) {
        setError('Please select a driver');
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        driverId: driverIdParam,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      const response = await axiosInstance.get(`/admin/settlements/generate?${params.toString()}`);
      
      if (response.data.success) {
        // ✅ Expecting: customerId, customer, subtotal, gst, total, tickets, driver
        setStatementData(response.data.data);
        setSuccess('Settlement generated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate settlement';
      setError(errorMessage);
      console.error('Settlement fetch error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!startDate || !endDate || !statementData.customerId) {
      setError('Customer data not available. Cannot download invoice.');
      return;
    }
  
    if (!statementData.tickets || statementData.tickets.length === 0) {
      setError('No tickets available to download');
      return;
    }
  
    setDownloading(true);
    setError('');
  
    try {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);
  
      const params = new URLSearchParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
  
      // ✅ ADD CACHE-BUSTING PARAMETER TO AVOID 304
      params.append('t', Date.now()); // Forces unique URL
  
      const downloadUrl = `/admin/invoices/download/${statementData.customerId}?${params.toString()}`;
  
      console.log('Downloading invoice PDF:', downloadUrl);
  
      const response = await axiosInstance.get(downloadUrl, {
        responseType: 'blob',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
  
      const contentType = response.headers['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        const text = await new Response(response.data).text();
        let jsonData;
        try {
          jsonData = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid JSON response from server');
        }
        throw new Error(jsonData.message || 'Failed to generate PDF');
      }
  
      if (!contentType.includes('application/pdf')) {
        throw new Error(`Unexpected content type: ${contentType}`);
      }
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
  
      const customerName = (statementData.customer || 'Customer').replace(/\s+/g, '_');
      const filename = `Invoice-${customerName}-${formattedStartDate}-${formattedEndDate}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
  
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);
  
      setSuccess('Invoice PDF downloaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('PDF Download Error:', err);
      if (err.response?.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const jsonData = JSON.parse(reader.result);
            setError(jsonData.message || 'Failed to download invoice PDF');
          } catch {
            setError('Failed to download invoice PDF');
          }
        };
        reader.readAsText(err.response.data);
      } else {
        setError(err.message || 'Failed to download invoice PDF');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleEmailDriver = async () => {
    if (!selectedDriverId || !startDate || !endDate || statementData.tickets.length === 0) {
      setError('No data to email');
      return;
    }

    setEmailing(true);
    setError('');
    
    try {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);
      
      const params = new URLSearchParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      // Optional: Keep this if backend supports it, or repurpose for invoice email
      const response = await axiosInstance.post(`/admin/settlements/email/${selectedDriverId}?${params.toString()}`);
      
      if (response.data.success) {
        setSuccess('Email sent successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Email feature not implemented');
      } else {
        setError(err.response?.data?.message || 'Failed to send email');
      }
    } finally {
      setEmailing(false);
    }
  };

  return (
    <Container fluid className="p-4" style={{ backgroundColor: lightBackgroundColor }}>
      <h1 className="mb-4" style={{ color: primaryColor }}>Invoices (Customer Billing)</h1>
      
      {error && <Alert variant="danger" className="mb-3" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" className="mb-3" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row>
        {/* Controls */}
        <Col md={5} className="mb-4">
          <Card style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            borderLeft: `4px solid ${primaryColor}`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <Card.Body>
              <Card.Title as="h5" style={{ color: primaryColor }}>Generate Customer Invoice</Card.Title>
              <Form>
                <Form.Group className="mb-3" controlId="selectDriver">
                  <Form.Label style={{ color: primaryColor, fontWeight: '500' }}>Select Driver (to load customer)</Form.Label>
                  <Form.Select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    style={{ borderColor: lightBorderColor }}
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} ({driver.user_id_code})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <Form.Group controlId="startDate">
                      <Form.Label style={{ color: primaryColor, fontWeight: '500' }}>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ borderColor: lightBorderColor }}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="endDate">
                      <Form.Label style={{ color: primaryColor, fontWeight: '500' }}>End Date</Form.Label>
                      <Form.Control
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ borderColor: lightBorderColor }}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Preview */}
        <Col md={7}>
          <Card className="bg-white shadow-sm" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            borderLeft: `4px solid ${primaryColor}`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
          }}>
            <Card.Body>
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status" style={{ color: primaryColor }} />
                  <p className="mt-2">Generating invoice...</p>
                </div>
              ) : statementData.tickets.length > 0 ? (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h2 className="fw-bold" style={{ color: primaryColor }}>CUSTOMER INVOICE</h2>
                      <p className="mb-0" style={{ color: primaryColor }}>
                        Period: {startDate} to {endDate}
                      </p>
                    </div>
                    <div className="text-end">
                      <strong style={{ color: primaryColor }}>Bill To:</strong>
                      <p className="mb-0">{statementData.customer || 'N/A'}</p>
                      <p className="text-muted">Via Driver: {statementData.driver?.name || 'N/A'}</p>
                    </div>
                  </div>

                  <Table striped bordered responsive>
                    <thead style={{ backgroundColor: primaryColor, color: 'white' }}>
                      <tr>
                        <th>Date</th>
                        <th>Ticket #</th>
                        <th>Job Type</th>
                        <th>Truck</th>
                        <th className="text-end">Qty</th>
                        <th className="text-end">Bill Rate</th>
                        <th className="text-end">Total Bill</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statementData.tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>{new Date(ticket.date).toLocaleDateString()}</td>
                          <td>{ticket.ticket_number}</td>
                          <td>{ticket.job_type || '-'}</td>
                          <td>{ticket.truck_number || '-'}</td>
                          <td className="text-end">{parseFloat(ticket.quantity).toFixed(1)}</td>
                          <td className="text-end">${parseFloat(ticket.bill_rate).toFixed(2)}</td>
                          <td className="text-end">${parseFloat(ticket.total_bill).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  <Row className="justify-content-end mt-3">
                    <Col md="5">
                      <Table borderless size="sm">
                        <tbody>
                          <tr>
                            <td>Subtotal:</td>
                            <td className="text-end">${(statementData.subtotal || 0).toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>GST (5%):</td>
                            <td className="text-end">${(statementData.gst || 0).toFixed(2)}</td>
                          </tr>
                          <tr className="fw-bold fs-5" style={{ color: primaryColor }}>
                            <td>Total:</td>
                            <td className="text-end">${(statementData.total || 0).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>

                  <div className="text-end mt-4">
                    <Button 
                      style={{ backgroundColor: primaryColor, border: "none" }} 
                      className="me-2"
                      onClick={handleEmailDriver}
                      disabled={emailing}
                    >
                      {emailing ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaEnvelope className="me-2" /> Email Invoice
                        </>
                      )}
                    </Button>
                    <Button 
                      style={{ backgroundColor: primaryColor, border: "none" }}
                      onClick={handleDownloadPdf}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FaFileDownload className="me-2" /> Download Invoice PDF
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <Alert 
                  variant="info" 
                  className="text-center"
                  style={{ backgroundColor: lightBackgroundColor, borderColor: lightBorderColor }}
                >
                  {selectedDriverId && startDate && endDate
                    ? `No billing data found for this period.`
                    : 'Select a driver and date range to generate invoice.'}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminSettlements;