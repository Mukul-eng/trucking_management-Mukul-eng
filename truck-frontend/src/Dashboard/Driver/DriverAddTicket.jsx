import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

const DriverAddTicket = () => {
  const navigate = useNavigate();
  const primaryColor = "#295b52";
  const lightBackgroundColor = "rgba(94, 172, 131, 0.15)";
  const cardBg = "rgba(255,255,255,0.95)";

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    truck_number: "",
    customer: "",
    job_type: "",
    ticket_number: "",
    quantity: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load customers for dropdown
  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/driver/customers');
        if (response.data.success) {
          setCustomers(response.data.data);
          if (response.data.data.length > 0) {
            setFormData(prev => ({ ...prev, customer: response.data.data[0].name }));
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load customers');
        // Show error toast
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('date', formData.date);
      formDataToSend.append('truck_number', formData.truck_number);
      formDataToSend.append('customer', formData.customer);
      formDataToSend.append('job_type', formData.job_type);
      formDataToSend.append('ticket_number', formData.ticket_number);
      formDataToSend.append('quantity', formData.quantity.toString());
      
      // Add photo if provided
      if (photo) {
        formDataToSend.append('photo', photo);
      }

      const response = await axiosInstance.post('/driver/tickets', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        setSuccess("Ticket created successfully!");
        // Reset form
        setFormData({
          date: new Date().toISOString().split('T')[0],
          truck_number: "",
          customer: customers.length > 0 ? customers[0].name : "",
          job_type: "",
          ticket_number: "",
          quantity: "",
        });
        setPhoto(null);
        setPhotoPreview(null);
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          navigate('/driver/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create ticket. Please try again.");
      // Show error toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container
      fluid
      style={{
        minHeight: "100vh",
        padding: "20px",
        backgroundColor: lightBackgroundColor,
      }}
    >
      {/* HEADER ROW */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: primaryColor,
          fontWeight: "bold",
        }}
      >
        <span
          style={{ cursor: "pointer", color: primaryColor }}
          onClick={() => navigate('/driver/dashboard')}
        >
          ← Back
        </span>

        <span style={{ fontSize: "20px" }}>NEW TICKET</span>
      </div>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {success && <Alert variant="success" className="mb-3">{success}</Alert>}

      {/* CARD WRAPPER */}
      <Card
        style={{
          padding: "20px",
          backgroundColor: cardBg,
          borderLeft: `5px solid ${primaryColor}`,
          borderRadius: "10px",
          maxWidth: "1100px",
          margin: "auto",
        }}
      >
        <Card.Body>
          {/* FORM START */}
          <Form onSubmit={handleSubmit}>
            {/* DATE */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: primaryColor, fontWeight: "600" }}>
                DATE: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {/* TRUCK NUMBER */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: primaryColor, fontWeight: "600" }}>
                TRUCK NUMBER: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                name="truck_number"
                value={formData.truck_number}
                onChange={handleInputChange}
                placeholder="Enter truck number"
                required
              />
            </Form.Group>

            {/* CUSTOMER */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: primaryColor, fontWeight: "600" }}>
                CUSTOMER: <span className="text-danger">*</span>
              </Form.Label>
              {loading ? (
                <Form.Control type="text" value="Loading customers..." disabled />
              ) : (
                <Form.Select
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.name}>
                      {customer.name}
                    </option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>

            {/* JOB TYPE */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: primaryColor, fontWeight: "600" }}>
                JOB TYPE: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="job_type"
                value={formData.job_type}
                onChange={handleInputChange}
                placeholder="e.g., Tri Endump Demo"
                required
              />
            </Form.Group>

            {/* TICKET NUMBER */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: primaryColor, fontWeight: "600" }}>
                TICKET NUMBER: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="text" 
                name="ticket_number"
                value={formData.ticket_number}
                onChange={handleInputChange}
                placeholder="e.g., 9109"
                required
              />
            </Form.Group>

            {/* QUANTITY */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: primaryColor, fontWeight: "600" }}>
                QUANTITY (Hours/Tons): <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control 
                type="number" 
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="e.g., 9.0"
                step="0.1"
                min="0"
                required
              />
            </Form.Group>

            {/* PHOTO PROOF */}
            <Form.Group className="mb-3">
              <Form.Label style={{ color: primaryColor, fontWeight: "600" }}>
                PHOTO PROOF: (Optional)
              </Form.Label>

              <div
                onClick={() => document.getElementById("fileInput").click()}
                style={{
                  border: `2px dashed ${primaryColor}`,
                  background: "white",
                  borderRadius: "10px",
                  padding: "30px",
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                {!photoPreview ? (
                  <>
                    <div style={{ color: primaryColor }}>
                      Click to Upload Photo
                    </div>
                    <div style={{ fontSize: "12px", color: "#777" }}>
                      or Use Webcam
                    </div>
                  </>
                ) : (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: "200px", borderRadius: "8px" }}
                  />
                )}
              </div>

              <input
                id="fileInput"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoChange}
              />
            </Form.Group>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                backgroundColor: primaryColor,
                borderColor: primaryColor,
                padding: "12px",
                marginTop: "15px",
                fontWeight: "bold",
              }}
            >
              {submitting ? "Submitting..." : "SUBMIT TICKET"}
            </Button>

          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default DriverAddTicket;
