// src/components/TicketInbox.jsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Button,
  Modal,
  InputGroup,
  Alert,
} from 'react-bootstrap';
import { FaFilter, FaSearch, FaImage } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

const AdminTicketInbox = () => {
  // --- Custom Colors ---
  const primaryColor = '#295b52';
  const lightBackgroundColor = 'rgba(94, 172, 131, 0.15)';
  const lightBorderColor = 'rgba(94, 172, 131, 0.8)';

  // --- State Management ---
  const [tickets, setTickets] = useState([]);
  const [filters, setFilters] = useState({
    month: '',
    customer: 'All',
    driver: 'All',
    status: '',
  });
  const [searchTicket, setSearchTicket] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalPhotoUrl, setModalPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Fetch tickets when filters change
  useEffect(() => {
    fetchTickets();
  }, [filters.month, filters.customer, filters.driver, filters.status]);

  // Fetch tickets from API
  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.customer && filters.customer !== 'All') params.append('customer', filters.customer);
      if (filters.driver && filters.driver !== 'All') params.append('driver', filters.driver);
      if (filters.status) params.append('status', filters.status);
      if (searchTicket) params.append('search', searchTicket);

      const response = await axiosInstance.get(`/admin/tickets?${params.toString()}`);
      
      if (response.data.success) {
        setTickets(response.data.data);
        const uniqueCustomers = [...new Set(response.data.data.map(t => t.customer))];
        const uniqueDrivers = [...new Set(response.data.data.map(t => t.driver_name).filter(Boolean))];
        setCustomers(uniqueCustomers);
        setDrivers(uniqueDrivers);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  // Update ticket status
  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const response = await axiosInstance.put(`/admin/tickets/${ticketId}/status`, {
        status: newStatus,
      });
      if (response.data.success) {
        fetchTickets();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    }
  };

  // Update ticket rates
  const handleRateChange = async (ticketId, field, value) => {
    const numValue = parseFloat(value) || 0;
    try {
      const updateData = { [field]: numValue };
      const response = await axiosInstance.put(`/admin/tickets/${ticketId}`, updateData);
      if (response.data.success) {
        fetchTickets();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket');
    }
  };

  // --- Derived State ---
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = ticket.ticket_number
        ?.toLowerCase()
        .includes(searchTicket.toLowerCase());
      return matchesSearch;
    });
  }, [tickets, searchTicket]);

  const totals = useMemo(() => {
    return filteredTickets.reduce(
      (acc, ticket) => {
        acc.totalBill += parseFloat(ticket.total_bill) || 0;
        acc.totalPay += parseFloat(ticket.total_pay) || 0;
        return acc;
      },
      { totalBill: 0, totalPay: 0 }
    );
  }, [filteredTickets]);

  // --- Event Handlers ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTicket(e.target.value);
  };

  const handleShowPhoto = (photoPath) => {
    if (photoPath) {
      let photoUrl;
      if (photoPath.startsWith('http')) {
        photoUrl = photoPath;
      } else {
        const backendUrl = axiosInstance.defaults.baseURL?.replace('/api', '') || window.location.origin;
        photoUrl = `${backendUrl}${photoPath}`;
      }
      setModalPhotoUrl(photoUrl);
      setShowModal(true);
    }
  };

  const handleClosePhoto = () => {
    setShowModal(false);
    setModalPhotoUrl('');
  };

  return (
    <Container fluid className="p-4" style={{ backgroundColor: lightBackgroundColor }}>
      <h1 className="mb-4" style={{ color: primaryColor }}>Ticket Inbox</h1>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

      {/* --- Top Bar: Filters and Search --- */}
      <Row className="g-3 mb-4 p-3 rounded shadow-sm align-items-end" 
           style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderLeft: `4px solid ${primaryColor}` }}>
        <Col md={3}>
          <Form.Group controlId="filterMonth">
            <Form.Label style={{ color: primaryColor, fontWeight: '500' }}>Month</Form.Label>
            <Form.Select 
              name="month" 
              value={filters.month} 
              onChange={handleFilterChange}
              style={{ borderColor: lightBorderColor }}
            >
              <option value="">All Months</option>
              <option value="2025-11">Nov 2025</option>
              <option value="2025-10">Oct 2025</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="filterCustomer">
            <Form.Label style={{ color: primaryColor, fontWeight: '500' }}>Customer</Form.Label>
            <Form.Select 
              name="customer" 
              value={filters.customer} 
              onChange={handleFilterChange}
              style={{ borderColor: lightBorderColor }}
            >
              <option value="All">All</option>
              {customers.map((cust) => (
                <option key={cust} value={cust}>
                  {cust}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="filterDriver">
            <Form.Label style={{ color: primaryColor, fontWeight: '500' }}>Driver Name</Form.Label>
            <Form.Select 
              name="driver" 
              value={filters.driver} 
              onChange={handleFilterChange}
              style={{ borderColor: lightBorderColor }}
            >
              <option value="All">All</option>
              {drivers.map((driver) => (
                <option key={driver} value={driver}>
                  {driver}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <InputGroup>
            <InputGroup.Text style={{ backgroundColor: primaryColor, color: 'white', border: 'none' }}>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search Ticket #"
              value={searchTicket}
              onChange={handleSearchChange}
              style={{ borderColor: lightBorderColor, borderLeft: 'none' }}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* --- The Grid --- */}
      <Row>
        <Col>
          {loading ? (
            <div className="text-center p-4">Loading tickets...</div>
          ) : (
            <div className="table-responsive shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '5px' }}>
              <Table striped bordered hover className="mb-0" style={{ fontSize: '0.95rem' }}>
                <thead style={{ backgroundColor: primaryColor, color: 'white' }}>
                  <tr>
                    <th style={{ minWidth: '90px' }}>Date</th>
                    <th style={{ minWidth: '80px' }}>Truck #</th>
                    <th style={{ minWidth: '120px' }}>Customer</th>
                    <th style={{ minWidth: '120px' }}>Driver</th>
                    {/* <th style={{ minWidth: '120px' }}>Subcontractor</th> */}
                    <th style={{ minWidth: '140px' }}>Description</th>
                    <th style={{ minWidth: '100px' }}>Ticket #</th>
                    <th style={{ minWidth: '70px' }}>Photo</th>
                    <th style={{ minWidth: '60px' }}>Qty</th>
                    <th style={{ minWidth: '110px' }}>Bill Rate</th>
                    <th style={{ minWidth: '110px' }}>Pay Rate</th>
                    <th style={{ minWidth: '100px' }}>Total Bill</th>
                    <th style={{ minWidth: '100px' }}>Total Pay</th>
                    <th style={{ minWidth: '130px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.date}</td>
                      <td>{ticket.truck_number}</td>
                      <td>{ticket.customer}</td>
                      <td>{ticket.driver_name}</td>
                      {/* <td>{ticket.subcontractor || '-'}</td> */}
                      <td>{ticket.job_type || ticket.description || '-'}</td>
                      <td>{ticket.ticket_number}</td>
                      <td className="text-center">
                        {ticket.photo_path ? (
                          <Button 
                            variant="link" 
                            onClick={() => handleShowPhoto(ticket.photo_path)}
                            style={{ color: primaryColor, fontSize: '1.4rem' }}
                          >
                            <FaImage />
                          </Button>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td>{parseFloat(ticket.quantity || 0).toFixed(1)}</td>
                      <td>
                        <Form.Control
                          type="number"
                          value={ticket.bill_rate || 0}
                          onChange={(e) => handleRateChange(ticket.id, 'bill_rate', e.target.value)}
                          size="sm"
                          className="w-100"
                          style={{ 
                            borderColor: lightBorderColor,
                            minWidth: '90px',
                            padding: '2px 6px',
                            fontSize: '0.95rem'
                          }}
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="number"
                          value={ticket.pay_rate || 0}
                          onChange={(e) => handleRateChange(ticket.id, 'pay_rate', e.target.value)}
                          size="sm"
                          className="w-100"
                          style={{ 
                            borderColor: lightBorderColor,
                            minWidth: '90px',
                            padding: '2px 6px',
                            fontSize: '0.95rem'
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: '500' }}>${parseFloat(ticket.total_bill || 0).toFixed(2)}</td>
                      <td style={{ fontWeight: '500' }}>${parseFloat(ticket.total_pay || 0).toFixed(2)}</td>
                      <td>
                        <Form.Select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                          size="sm"
                          className="w-100"
                          style={{ 
                            borderColor: lightBorderColor,
                            minWidth: '110px',
                            color: ticket.status === 'Approved' ? '#28a745' : 
                                   ticket.status === 'Rejected' ? '#dc3545' : primaryColor,
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            padding: '2px 8px'
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot style={{ backgroundColor: lightBackgroundColor }}>
                  <tr>
                    <td colSpan="11" className="fw-bold">Totals</td>
                    <td className="fw-bold">${totals.totalBill.toFixed(2)}</td>
                    <td className="fw-bold">${totals.totalPay.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          )}
        </Col>
      </Row>

      {/* --- Photo Modal --- */}
      <Modal show={showModal} onHide={handleClosePhoto} size="lg" centered>
        <Modal.Header closeButton style={{ backgroundColor: primaryColor, color: 'white' }}>
          <Modal.Title>Ticket Photo</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <img 
            src={modalPhotoUrl} 
            alt="Ticket" 
            style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '5px',
              objectFit: 'contain'
            }} 
            onError={() => setModalPhotoUrl('')} 
          />
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
          <Button 
            variant="secondary" 
            onClick={handleClosePhoto}
            style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminTicketInbox;