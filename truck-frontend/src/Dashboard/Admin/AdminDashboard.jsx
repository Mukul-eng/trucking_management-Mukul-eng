// src/components/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaTicketAlt, FaDollarSign, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axiosInstance from '../../api/axiosInstance';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  // Custom colors
  const primaryColor = '#295b52';
  const lightBackgroundColor = 'rgba(94, 172, 131, 0.15)';
  const lightBorderColor = 'rgba(94, 172, 131, 0.8)';

  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    unbilledTickets: 0,
    revenue: 0,
    driverPay: 0,
    estimatedProfit: 0,
    weeklyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard stats on component mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/admin/dashboard/stats');
        
        if (response.data.success) {
          setDashboardStats(response.data.data);
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

    fetchDashboardStats();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Data for the "Health Check" cards
  const healthCheckData = [
    {
      title: 'Unbilled Tickets',
      value: dashboardStats.unbilledTickets.toString(),
      icon: FaTicketAlt,
      color: 'warning',
      action: 'Click to verify',
    },
    {
      title: 'Revenue this Month',
      value: formatCurrency(dashboardStats.revenue),
      icon: FaDollarSign,
      color: 'custom-success',
    },
    {
      title: 'Driver Pay this Month',
      value: formatCurrency(dashboardStats.driverPay),
      icon: FaMoneyBillWave,
      color: 'custom-info',
    },
    {
      title: 'Estimated Profit',
      value: formatCurrency(dashboardStats.estimatedProfit),
      icon: FaChartLine,
      color: 'custom-primary',
    },
  ];

  // Prepare chart data from API response
  const chartData = {
    labels: dashboardStats.weeklyData.length > 0
      ? dashboardStats.weeklyData.map((_, index) => `Week ${index + 1}`)
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue',
        data: dashboardStats.weeklyData.length > 0
          ? dashboardStats.weeklyData.map(week => parseFloat(week.revenue) || 0)
          : [0, 0, 0, 0],
        backgroundColor: primaryColor,
        borderColor: primaryColor,
        borderWidth: 1,
      },
      {
        label: 'Driver Pay',
        data: dashboardStats.weeklyData.length > 0
          ? dashboardStats.weeklyData.map(week => parseFloat(week.pay) || 0)
          : [0, 0, 0, 0],
        backgroundColor: lightBackgroundColor,
        borderColor: lightBorderColor,
        borderWidth: 1,
      },
    ],
  };

  // Options for the Bar Chart
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Important for responsiveness
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: primaryColor, // Legend text color
        }
      },
      title: {
        display: true,
        text: 'Revenue vs. Pay Per Week',
        color: primaryColor, // Title color
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: primaryColor, // Y-axis labels color
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: primaryColor, // X-axis labels color
        }
      }
    },
  };
  
  // Example handler for the card action
  const handleCardClick = (title) => {
    if (title === 'Unbilled Tickets') {
      // Navigate to ticket inbox
      window.location.href = '/admin/ticket-inbox';
    }
  };

  if (loading) {
    return (
      <Container fluid className="p-4 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div>Loading dashboard...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="p-4">
        <div className="alert alert-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4" style={{ backgroundColor: lightBackgroundColor }}>
      <h1 className="mb-4" style={{ color: primaryColor }}>Admin Dashboard</h1>
      
      {/* Top Cards: The "Health Check" */}
      <Row className="g-4 mb-4">
        {healthCheckData.map((item, index) => (
          <Col key={index} xs={12} sm={6} lg={3}>
            <Card className="h-100 shadow-sm" style={{ 
              borderLeft: `4px solid ${primaryColor}`,
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }}>
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Title as="h6" className="text-muted" style={{ color: primaryColor }}>{item.title}</Card.Title>
                  <Card.Text as="h3" className="my-2" style={{ color: primaryColor }}>{item.value}</Card.Text>
                  {item.action && (
                    <Button 
                      variant="link" 
                      className="p-0 text-decoration-none" 
                      onClick={() => handleCardClick(item.title)}
                      style={{ color: primaryColor }}
                    >
                      {item.action}
                    </Button>
                  )}
                </div>
                <div style={{ color: primaryColor, opacity: 0.7 }}>
                  <item.icon size="3rem" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Chart */}
      <Row>
        <Col xs={12}>
          <Card className="shadow-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <Card.Body>
              <div style={{ height: '400px' }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;