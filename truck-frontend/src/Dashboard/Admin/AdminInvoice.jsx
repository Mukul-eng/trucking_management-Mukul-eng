// src/components/Invoicing.jsx

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
import { FaFileDownload } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

const AdminInvoice = () => {
  // --- Custom Colors ---
  const primaryColor = '#295b52';
  const lightBackgroundColor = 'rgba(94, 172, 131, 0.15)';
  const lightBorderColor = 'rgba(94, 172, 131, 0.8)';

  // --- State for Controls ---
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customers, setCustomers] = useState([]);
  const [invoiceData, setInvoiceData] = useState({
    customer: '',
    tickets: [],
    subtotal: 0,
    gst: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
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

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch invoice data when filters change
  useEffect(() => {
    if (selectedCustomerId && startDate && endDate) {
      fetchInvoice();
    } else {
      // Reset invoice data if filters are incomplete
      setInvoiceData({
        customer: '',
        tickets: [],
        subtotal: 0,
        gst: 0,
        total: 0,
      });
    }
  }, [selectedCustomerId, startDate, endDate]);

  // Fetch customers list
  const fetchCustomers = async () => {
    try {
      const response = await axiosInstance.get('/admin/customers');
      if (response.data.success) {
        setCustomers(response.data.data);
        if (response.data.data.length > 0 && !selectedCustomerId) {
          setSelectedCustomerId(response.data.data[0].id.toString());
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
    }
  };

  // Format date to YYYY-MM-DD
  const formatDateForAPI = (dateString) => {
    if (!dateString) return '';
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Convert from other formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  // Fetch invoice data
  const fetchInvoice = async () => {
    const formattedStartDate = formatDateForAPI(startDate);
    const formattedEndDate = formatDateForAPI(endDate);

    if (!formattedStartDate || !formattedEndDate) {
      setError('Please select valid start and end dates');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const params = new URLSearchParams({
        customerId: selectedCustomerId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });
      const response = await axiosInstance.get(`/admin/invoices/generate?${params.toString()}`);
      
      if (response.data.success) {
        setInvoiceData(response.data.data);
        setSuccess('Invoice generated successfully');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  // Handle download PDF
  const handleDownloadPdf = async () => {
    if (!selectedCustomerId || !startDate || !endDate) {
      setError('Please select customer and date range before downloading');
      return;
    }

    if (invoiceData.tickets.length === 0) {
      setError('No tickets available to download');
      return;
    }

    setDownloading(true);
    setError('');
    
    try {
      const formattedStartDate = formatDateForAPI(startDate);
      const formattedEndDate = formatDateForAPI(endDate);
      
      const params = new URLSearchParams({
        customerId: selectedCustomerId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      const response = await axiosInstance.get(`/admin/invoices/download/${selectedCustomerId}?${params.toString()}`, {
        responseType: 'blob',
      });
      
      // Check if response is actually a blob (PDF) or JSON error
      const contentType = response.headers['content-type'] || '';
      
      if (contentType.includes('application/json')) {
        // Backend returned JSON (error or placeholder)
        const text = await response.data.text();
        const jsonData = JSON.parse(text);
        throw new Error(jsonData.message || 'Failed to generate PDF');
      }

      // Create blob URL and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const customerName = invoiceData.customer || 'Customer';
      const invoiceId = selectedCustomerId;
      const filename = `INV-${invoiceId}-${formattedStartDate}-${formattedEndDate}.pdf`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 100);
      
      setSuccess('PDF downloaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Handle blob error parsing
      if (err.response?.data) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const jsonData = JSON.parse(reader.result);
            setError(jsonData.message || 'Failed to download invoice PDF');
          } catch (parseErr) {
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

  return (
    <Container fluid className="p-4" style={{ backgroundColor: lightBackgroundColor }}>
      <h1 className="mb-4" style={{ color: primaryColor }}>Invoicing (Customer Reports)</h1>
      
      {error && <Alert variant="danger" className="mb-3" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" className="mb-3" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row>
        {/* --- Left Column: Controls --- */}
        <Col md={5} className="mb-4">
          <Card style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            borderLeft: `4px solid ${primaryColor}`,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <Card.Body>
              <Card.Title as="h5" style={{ color: primaryColor }}>Generate Invoice</Card.Title>
              <Form>
                <Form.Group className="mb-3" controlId="selectCustomer">
                  <Form.Label style={{ color: primaryColor, fontWeight: '500' }}>Select Customer</Form.Label>
                  <Form.Select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    style={{ borderColor: lightBorderColor }}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((cust) => (
                      <option key={cust.id} value={cust.id}>
                        {cust.name}
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

        {/* --- Right Column: Invoice Preview --- */}
        <Col md={7}>
          <Card className="bg-white shadow-sm" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            borderLeft: `4px solid ${primaryColor}`,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
          }}>
            <Card.Body>
              {loading ? (
                <div className="text-center p-4">
                  <Spinner animation="border" role="status" style={{ color: primaryColor }}>
                    <span className="visually-hidden">Loading invoice...</span>
                  </Spinner>
                  <p className="mt-2">Generating invoice...</p>
                </div>
              ) : invoiceData.tickets.length > 0 ? (
                <>
                  {/* Invoice Header */}
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h2 className="fw-bold" style={{ color: primaryColor }}>INVOICE</h2>
                      <p className="mb-0" style={{ color: primaryColor }}>Invoice #: INV-{selectedCustomerId}-{Date.now().toString().slice(-6)}</p>
                      <p className="text-muted">Date of Issue: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="text-end">
                      <strong style={{ color: primaryColor }}>Bill To:</strong>
                      <p className="mb-0">{invoiceData.customer}</p>
                      <p className="text-muted small">Period: {startDate} to {endDate}</p>
                    </div>
                  </div>

                  {/* Invoice Table */}
                  <Table striped bordered responsive>
                    <thead style={{ backgroundColor: primaryColor, color: 'white' }}>
                      <tr>
                        <th>Date</th>
                        <th>Ticket #</th>
                        <th>Description</th>
                        <th>Driver</th>
                        <th>Subcontractor</th>
                        <th className="text-end">Qty</th>
                        <th className="text-end">Rate</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoiceData.tickets.map((ticket) => (
                        <tr key={ticket.id}>
                          <td>{ticket.date}</td>
                          <td>{ticket.ticket_number}</td>
                          <td>{ticket.job_type || ticket.description || '-'}</td>
                          <td>{ticket.driver_name || '-'}</td>
                          <td>{ticket.subcontractor || '-'}</td>
                          <td className="text-end">{parseFloat(ticket.quantity || 0).toFixed(1)}</td>
                          <td className="text-end">${parseFloat(ticket.bill_rate || 0).toFixed(2)}</td>
                          <td className="text-end" style={{ fontWeight: '500' }}>
                            ${parseFloat(ticket.total_bill || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* Invoice Totals */}
                  <Row className="justify-content-end">
                    <Col md="5">
                      <Table borderless size="sm">
                        <tbody>
                          <tr>
                            <td>Subtotal:</td>
                            <td className="text-end">${invoiceData.subtotal.toFixed(2)}</td>
                          </tr>
                          <tr>
                            <td>GST (5%):</td>
                            <td className="text-end">${invoiceData.gst.toFixed(2)}</td>
                          </tr>
                          <tr className="fw-bold fs-5" style={{ color: primaryColor }}>
                            <td>Total:</td>
                            <td className="text-end">${invoiceData.total.toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                  </Row>

                  {/* Download Button */}
                  <div className="text-end mt-4">
                    <Button 
                      style={{backgroundColor: primaryColor, border: "none"}} 
                      onClick={handleDownloadPdf}
                      disabled={downloading || invoiceData.tickets.length === 0}
                    >
                      {downloading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" className="me-2" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FaFileDownload className="me-2" /> Download PDF
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
                  {selectedCustomerId && startDate && endDate
                    ? `No approved tickets found for the selected customer within the selected date range.`
                    : 'Please select a customer and date range to generate invoice.'}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminInvoice;
