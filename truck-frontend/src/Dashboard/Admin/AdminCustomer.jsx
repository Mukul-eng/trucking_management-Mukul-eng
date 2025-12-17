import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Modal, Table, Alert } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

const AdminCustomer = () => {
  const primaryColor = '#295b52';
  const lightBackgroundColor = 'rgba(94, 172, 131, 0.15)';
  const lightBorderColor = 'rgba(94, 172, 131, 0.8)';
  const dangerColor = '#dc3545';
  const warningColor = '#ffc107';

  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    default_bill_rate: '',
  });

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch all customers
  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/admin/customers');
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load customers');
      // Show error toast
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Validate form
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = 'Customer name is required.';
    if (!formData.default_bill_rate) newErrors.default_bill_rate = 'Default bill rate is required.';
    return newErrors;
  };

  // Handle form submission (Create Customer)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const response = await axiosInstance.post('/admin/customers', {
        name: formData.name,
        default_bill_rate: parseFloat(formData.default_bill_rate),
      });
      
      if (response.data.success) {
        setSuccess('Customer created successfully!');
        handleCloseModal();
        fetchCustomers();
        setFormData({ name: '', default_bill_rate: '' });
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create customer' });
      // Show error toast
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    
    setSubmitting(true);
    
    try {
      const response = await axiosInstance.delete(`/admin/customers/${customerToDelete.id}`);
      
      if (response.data.success) {
        setSuccess('Customer deleted successfully!');
        handleCloseDeleteModal();
        fetchCustomers();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer');
      // Show error toast
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit customer
  const handleEditCustomer = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const response = await axiosInstance.put(`/admin/customers/${customerToEdit.id}`, {
        name: formData.name,
        default_bill_rate: parseFloat(formData.default_bill_rate),
      });
      
      if (response.data.success) {
        setSuccess('Customer updated successfully!');
        handleCloseEditModal();
        fetchCustomers();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to update customer' });
      // Show error toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: '', default_bill_rate: '' });
    setErrors({});
  };

  const handleShowModal = () => setShowModal(true);

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCustomerToDelete(null);
  };

  const handleShowDeleteModal = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setCustomerToEdit(null);
    setFormData({ name: '', default_bill_rate: '' });
    setErrors({});
  };

  const handleShowEditModal = (customer) => {
    setCustomerToEdit(customer);
    setFormData({
      name: customer.name,
      default_bill_rate: customer.default_bill_rate,
    });
    setShowEditModal(true);
  };

  return (
    <Container fluid className="p-4" style={{ backgroundColor: lightBackgroundColor }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ color: primaryColor }}>Manage Customers</h1>
        <Button 
          variant="primary" 
          onClick={handleShowModal}
          style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
        >
          <FaPlus className="me-2" /> Add Customer
        </Button>
      </div>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}

      {loading ? (
        <div className="text-center p-4">Loading customers...</div>
      ) : (
        <div className="table-responsive shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '5px' }}>
          <Table striped bordered hover>
            <thead style={{ backgroundColor: primaryColor, color: 'white' }}>
              <tr>
                <th>Company Name</th>
                <th>Default Bill Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>${parseFloat(customer.default_bill_rate || 0).toFixed(2)}</td>
                  <td>
                    <Button 
                      variant="link" 
                      className="p-1 me-2" 
                      onClick={() => handleShowEditModal(customer)}
                      title="Edit customer"
                      style={{ color: warningColor }}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="link" 
                      className="p-1" 
                      onClick={() => handleShowDeleteModal(customer)}
                      title="Delete customer"
                      style={{ color: dangerColor }}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: primaryColor, color: 'white' }}>
          <Modal.Title><FaPlus className="me-2" />Create New Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">Fields marked with <span className="text-danger">*</span> are required.</p>
          {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Aecon"
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Default Bill Rate <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="default_bill_rate"
                value={formData.default_bill_rate}
                onChange={handleChange}
                placeholder="e.g., 135.00"
                step="0.01"
                min="0"
                isInvalid={!!errors.default_bill_rate}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.default_bill_rate}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" disabled={submitting} onClick={handleSubmit} style={{ backgroundColor: primaryColor }}>
            {submitting ? <Spinner as="span" animation="border" size="sm" /> : 'Create Customer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: warningColor }}>
          <Modal.Title><FaEdit className="me-2" />Update Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">Fields marked with <span className="text-danger">*</span> are required.</p>
          {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
          <Form onSubmit={handleEditCustomer} noValidate>
            <Form.Group className="mb-3">
              <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Default Bill Rate <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="default_bill_rate"
                value={formData.default_bill_rate}
                onChange={handleChange}
                step="0.01"
                min="0"
                isInvalid={!!errors.default_bill_rate}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.default_bill_rate}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button variant="primary" disabled={submitting} onClick={handleEditCustomer} style={{ backgroundColor: primaryColor }}>
            {submitting ? <Spinner as="span" animation="border" size="sm" /> : 'Update Customer'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: dangerColor, color: 'white' }}>
          <Modal.Title><FaTrash className="me-2" />Delete Customer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {customerToDelete && (
            <p>Are you sure you want to delete <strong>{customerToDelete.name}</strong>? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            <FaTimes className="me-1" /> Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCustomer} disabled={submitting}>
            {submitting ? <Spinner as="span" animation="border" size="sm" /> : <><FaTrash className="me-1" /> Delete</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminCustomer;

