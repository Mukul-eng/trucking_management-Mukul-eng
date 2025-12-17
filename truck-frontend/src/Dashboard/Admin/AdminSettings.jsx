// src/components/AdminSettings.jsx

import React, { useState, useEffect } from 'react';
import {
  Container,
  Tabs,
  Tab,
  Table,
  Form,
  Button,
  Row,
  Col,
  InputGroup,
  Alert,
  Card
} from 'react-bootstrap';
import { FaCog, FaSave } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

const AdminSettings = () => {
  const primaryColor = '#295b52';
  const borderColor = '#7ea89b';
  const lightBg = '#f9fcfa';

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch bill rates on mount
  useEffect(() => {
    fetchBillRates();
  }, []);

  // Fetch bill rates
  const fetchBillRates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/admin/settings/bill-rates');
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bill rates');
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  // Handle customer rate change
  const handleCustomerRateChange = (id, value) => {
    const newRate = parseFloat(value) || 0;
    setCustomers(prev => prev.map(c => 
      c.id === id ? { ...c, default_bill_rate: newRate } : c
    ));
  };

  // Save all changes
  const handleSaveChanges = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const rates = customers.map(c => ({
        id: c.id,
        default_bill_rate: c.default_bill_rate,
      }));

      const response = await axiosInstance.put('/admin/settings/bill-rates', { rates });
      
      if (response.data.success) {
        setSuccess('Bill rates updated successfully!');
        setTimeout(() => setSuccess(''), 5000);
        // Show success toast
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save bill rates');
      // Show error toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: lightBg }}>
      <h2 className="mb-4" style={{ color: primaryColor, fontWeight: '600' }}>
        <FaCog className="me-2" /> Data & Rates Configuration
      </h2>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}

      <Card className="border-0 shadow-sm" style={{ borderRadius: '8px' }}>
        <Card.Body className="p-0">
          <Tabs
            defaultActiveKey="customers"
            id="admin-setup-tabs"
            className="px-4 pt-3"
            style={{ borderBottom: `1px solid ${borderColor}` }}
          >
            {/* === Customers Tab === */}
            <Tab eventKey="customers" title="Customers">
              <div className="px-4 pt-3 pb-4">
                <p className="text-muted mb-3">
                  Manage default billing rates for customers. These rates will automatically populate the Bill Rate field in the Ticket Inbox.
                </p>

                {loading ? (
                  <div className="text-center p-4">Loading customers...</div>
                ) : (
                  <Table hover responsive className="align-middle">
                    <thead>
                      <tr style={{ backgroundColor: primaryColor, color: 'white' }}>
                        <th>Company</th>
                        <th>Default Bill Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id}>
                          <td style={{ fontWeight: 500 }}>{customer.name}</td>
                          <td>
                            <InputGroup size="sm" style={{ maxWidth: '180px' }}>
                              <InputGroup.Text style={{ backgroundColor: primaryColor, color: 'white' }}>$</InputGroup.Text>
                              <Form.Control
                                type="number"
                                value={customer.default_bill_rate || 0}
                                onChange={(e) => handleCustomerRateChange(customer.id, e.target.value)}
                                step="0.01"
                                min="0"
                                style={{ borderColor }}
                              />
                            </InputGroup>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>
            </Tab>
          </Tabs>

          {/* Save Button */}
          <div className="px-4 py-3 border-top" style={{ borderColor }}>
            <div className="d-flex justify-content-end">
              <Button
                style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                onClick={handleSaveChanges}
                disabled={saving}
                className="d-flex align-items-center"
              >
                <FaSave className="me-2" /> {saving ? 'Saving...' : 'Save All Changes'}
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminSettings;
