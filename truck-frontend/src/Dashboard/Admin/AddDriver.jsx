import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Modal, Toast, Table, Alert } from 'react-bootstrap';
import { FaUserPlus, FaDollarSign, FaPhoneAlt, FaPlus, FaTrash, FaTimes, FaEdit } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

// --- Your Custom Color Scheme ---
const primaryColor = '#295b52';
const lightBackgroundColor = 'rgba(94, 172, 131, 0.15)';
const lightBorderColor = 'rgba(94, 172, 131, 0.8)';
const dangerColor = '#dc3545';
const warningColor = '#ffc107';

// --- Helper Component for Required Labels ---
const RequiredLabel = ({ htmlFor, children }) => (
  <Form.Label htmlFor={htmlFor}>
    {children} <span className="text-danger">*</span>
  </Form.Label>
);

function AddDriver() {
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showDeleteToast, setShowDeleteToast] = useState(false);
  const [showEditToast, setShowEditToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [driverToEdit, setDriverToEdit] = useState(null);

  const [formData, setFormData] = useState({
    user_id_code: '',
    name: '',
    phone: '',
    default_pay_rate: '',
    pin: '',
  });

  // Fetch drivers on component mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  // Fetch all drivers
  const fetchDrivers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.get('/admin/drivers');
      if (response.data.success) {
        setDrivers(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load drivers');
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
    // Clear error for the current field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Function to validate the form
  const validateForm = () => {
    let newErrors = {};
    if (!formData.user_id_code) newErrors.user_id_code = 'User ID is required.';
    if (!formData.name) newErrors.name = 'Driver name is required.';
    if (!formData.default_pay_rate) newErrors.default_pay_rate = 'Pay rate is required.';
    if (!formData.pin) {
      newErrors.pin = 'PIN is required.';
    } else if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
      newErrors.pin = 'PIN must be a 4-digit number.';
    }
    return newErrors;
  };

  // Handle form submission (Create Driver)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axiosInstance.post('/admin/drivers', formData);
      
      if (response.data.success) {
        setShowToast(true);
        handleCloseModal();
        fetchDrivers(); // Reload drivers list
        setFormData({
          user_id_code: '',
          name: '',
          phone: '',
          default_pay_rate: '',
          pin: '',
        });
        setTimeout(() => setShowToast(false), 5000);
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create driver' });
      // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete driver
  const handleDeleteDriver = async () => {
    if (!driverToDelete) return;
    
    setIsLoading(true);
    
    try {
      const response = await axiosInstance.delete(`/admin/drivers/${driverToDelete.id}`);
      
      if (response.data.success) {
        setShowDeleteToast(true);
        handleCloseDeleteModal();
        fetchDrivers(); // Reload drivers list
        setTimeout(() => setShowDeleteToast(false), 5000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete driver');
      // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit driver
  const handleEditDriver = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const updateData = { ...formData };
      // Don't send PIN if it's empty (to keep current PIN)
      if (!updateData.pin) {
        delete updateData.pin;
      }

      const response = await axiosInstance.put(`/admin/drivers/${driverToEdit.id}`, updateData);
      
      if (response.data.success) {
        setShowEditToast(true);
        handleCloseEditModal();
        fetchDrivers(); // Reload drivers list
        setTimeout(() => setShowEditToast(false), 5000);
      }
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to update driver' });
      // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      user_id_code: '',
      name: '',
      phone: '',
      default_pay_rate: '',
      pin: '',
    });
    setErrors({});
  };

  const handleShowModal = () => setShowModal(true);

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDriverToDelete(null);
  };

  const handleShowDeleteModal = (driver) => {
    setDriverToDelete(driver);
    setShowDeleteModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setDriverToEdit(null);
    setFormData({
      user_id_code: '',
      name: '',
      phone: '',
      default_pay_rate: '',
      pin: '',
    });
    setErrors({});
  };

  const handleShowEditModal = (driver) => {
    setDriverToEdit(driver);
    setFormData({
      user_id_code: driver.user_id_code,
      name: driver.name,
      phone: driver.phone || '',
      default_pay_rate: driver.default_pay_rate,
      pin: '', // Don't show PIN
    });
    setShowEditModal(true);
  };

  return (
    <div className="page-wrapper" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '2rem' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12}>
            <div className="drivers-table-container" style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '1.5rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              marginTop: '2rem'
            }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="table-header" style={{ color: primaryColor, fontWeight: 600 }}>Manage Drivers</h2>
                <Button variant="primary" className="btn-add-driver" onClick={handleShowModal} style={{
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                  padding: '0.6rem 1.5rem',
                  fontWeight: 500
                }}>
                  <FaPlus className="me-2" /> Add Driver
                </Button>
              </div>

              {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

              {loading ? (
                <div className="text-center p-4">Loading drivers...</div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Driver Name</th>
                      <th>Phone</th>
                      <th>Default Pay Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drivers.map(driver => (
                      <tr key={driver.id}>
                        <td>{driver.user_id_code}</td>
                        <td>{driver.name}</td>
                        <td>{driver.phone || '-'}</td>
                        <td>${parseFloat(driver.default_pay_rate || 0).toFixed(2)}</td>
                        <td>
                          <Button 
                            variant="link" 
                            className="btn-edit p-1 me-2" 
                            onClick={() => handleShowEditModal(driver)}
                            title="Edit driver"
                            style={{ color: warningColor }}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="link" 
                            className="btn-delete p-1" 
                            onClick={() => handleShowDeleteModal(driver)}
                            title="Delete driver"
                            style={{ color: dangerColor }}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* Add Driver Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: primaryColor, color: 'white' }}>
          <Modal.Title><FaUserPlus className="me-2" />Create New Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">Fields marked with <span className="text-danger">*</span> are required.</p>
          {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
          <Form onSubmit={handleSubmit} noValidate>
            <Row>
              <Col md={6} className="mb-3">
                <RequiredLabel htmlFor="user_id_code">User ID</RequiredLabel>
                <Form.Control
                  id="user_id_code"
                  type="text"
                  name="user_id_code"
                  value={formData.user_id_code}
                  onChange={handleChange}
                  placeholder="e.g., DRV001"
                  isInvalid={!!errors.user_id_code}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.user_id_code}
                </Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <RequiredLabel htmlFor="name">Driver Name</RequiredLabel>
                <Form.Control
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label htmlFor="phone"><FaPhoneAlt className="me-1" /> Phone (Optional)</Form.Label>
                <Form.Control
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., 555-0102"
                />
              </Col>
              <Col md={6} className="mb-3">
                <RequiredLabel htmlFor="default_pay_rate"><FaDollarSign className="me-1" /> Default Pay Rate</RequiredLabel>
                <Form.Control
                  id="default_pay_rate"
                  type="number"
                  name="default_pay_rate"
                  value={formData.default_pay_rate}
                  onChange={handleChange}
                  placeholder="e.g., 25.50"
                  step="0.01"
                  min="0"
                  isInvalid={!!errors.default_pay_rate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.default_pay_rate}
                </Form.Control.Feedback>
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <RequiredLabel htmlFor="pin">4-Digit PIN</RequiredLabel>
                <Form.Control
                  id="pin"
                  type="password"
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  isInvalid={!!errors.pin}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.pin}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  This PIN will be used by the driver to log in.
                </Form.Text>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} onClick={handleSubmit} style={{ backgroundColor: primaryColor }}>
            {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Create Driver'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Driver Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered size="lg">
        <Modal.Header closeButton style={{ backgroundColor: warningColor }}>
          <Modal.Title><FaEdit className="me-2" />Update Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">Fields marked with <span className="text-danger">*</span> are required.</p>
          {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}
          <Form onSubmit={handleEditDriver} noValidate>
            <Row>
              <Col md={6} className="mb-3">
                <RequiredLabel htmlFor="edit_user_id_code">User ID</RequiredLabel>
                <Form.Control
                  id="edit_user_id_code"
                  type="text"
                  name="user_id_code"
                  value={formData.user_id_code}
                  onChange={handleChange}
                  placeholder="e.g., DRV001"
                  isInvalid={!!errors.user_id_code}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.user_id_code}
                </Form.Control.Feedback>
              </Col>
              <Col md={6} className="mb-3">
                <RequiredLabel htmlFor="edit_name">Driver Name</RequiredLabel>
                <Form.Control
                  id="edit_name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., John Doe"
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label htmlFor="edit_phone"><FaPhoneAlt className="me-1" /> Phone (Optional)</Form.Label>
                <Form.Control
                  id="edit_phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g., 555-0102"
                />
              </Col>
              <Col md={6} className="mb-3">
                <RequiredLabel htmlFor="edit_default_pay_rate"><FaDollarSign className="me-1" /> Default Pay Rate</RequiredLabel>
                <Form.Control
                  id="edit_default_pay_rate"
                  type="number"
                  name="default_pay_rate"
                  value={formData.default_pay_rate}
                  onChange={handleChange}
                  placeholder="e.g., 25.50"
                  step="0.01"
                  min="0"
                  isInvalid={!!errors.default_pay_rate}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.default_pay_rate}
                </Form.Control.Feedback>
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label htmlFor="edit_pin">4-Digit PIN</Form.Label>
                <Form.Control
                  id="edit_pin"
                  type="password"
                  name="pin"
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder="Enter new 4-digit PIN or leave blank to keep current"
                  maxLength={4}
                  isInvalid={!!errors.pin}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.pin}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Leave blank to keep current PIN.
                </Form.Text>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} onClick={handleEditDriver} style={{ backgroundColor: primaryColor }}>
            {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Update Driver'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton style={{ backgroundColor: dangerColor, color: 'white' }}>
          <Modal.Title><FaTrash className="me-2" />Delete Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {driverToDelete && (
            <p>Are you sure you want to delete <strong>{driverToDelete.name}</strong> (User ID: {driverToDelete.user_id_code})? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            <FaTimes className="me-1" /> Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteDriver} disabled={isLoading}>
            {isLoading ? <Spinner as="span" animation="border" size="sm" /> : <><FaTrash className="me-1" /> Delete</>}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Toast Notifications */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1050 }}>
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={5000} autohide>
          <Toast.Header style={{ backgroundColor: primaryColor, color: 'white' }}>
            <strong className="me-auto">Success!</strong>
          </Toast.Header>
          <Toast.Body>
            Driver <strong>{formData.name}</strong> (User ID: {formData.user_id_code}) has been created successfully.
          </Toast.Body>
        </Toast>
        
        <Toast show={showDeleteToast} onClose={() => setShowDeleteToast(false)} delay={5000} autohide>
          <Toast.Header style={{ backgroundColor: dangerColor, color: 'white' }}>
            <strong className="me-auto">Deleted!</strong>
          </Toast.Header>
          <Toast.Body>
            Driver <strong>{driverToDelete?.name}</strong> (User ID: {driverToDelete?.user_id_code}) has been deleted successfully.
          </Toast.Body>
        </Toast>
        
        <Toast show={showEditToast} onClose={() => setShowEditToast(false)} delay={5000} autohide>
          <Toast.Header style={{ backgroundColor: warningColor, color: 'black' }}>
            <strong className="me-auto">Updated!</strong>
          </Toast.Header>
          <Toast.Body>
            Driver <strong>{formData.name}</strong> (User ID: {formData.user_id_code}) has been updated successfully.
          </Toast.Body>
        </Toast>
      </div>
    </div>
  );
}

export default AddDriver;
