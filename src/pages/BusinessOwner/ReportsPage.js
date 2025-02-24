import React, { useState } from 'react';
import { 
  FaFileAlt, FaDownload, FaCalendarAlt, FaChartBar, 
  FaMoneyBillWave, FaHome, FaTools, FaUserFriends 
} from 'react-icons/fa';
import '../../assets/styles/ReportsPage.css';

const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState('financial');
  const [dateRange, setDateRange] = useState('monthly');
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample data for different reports
  const reportData = {
    financial: {
      title: "Financial Summary",
      icon: <FaMoneyBillWave />,
      metrics: [
        "Total Revenue: ₱145,000",
        "Monthly Rent Collection: ₱120,000",
        "Security Deposits Held: ₱60,000",
        "Maintenance Expenses: ₱15,000",
        "Utility Bills: ₱10,000",
        "Net Income: ₱100,000"
      ]
    },
    occupancy: {
      title: "Occupancy Analysis",
      icon: <FaHome />,
      metrics: [
        "Total Units: 15",
        "Occupied Units: 12",
        "Vacant Units: 3",
        "Occupancy Rate: 80%",
        "Average Length of Stay: 8 months",
        "Upcoming Lease Renewals: 2"
      ]
    },
    revenue: {
      title: "Revenue Breakdown",
      icon: <FaMoneyBillWave />,
      metrics: [
        "Average Rent per Unit: ₱10,000",
        "Late Payment Fees: ₱2,000",
        "Utility Charges: ₱8,000",
        "Security Deposit Interest: ₱500",
        "Additional Services: ₱4,500",
        "Total Monthly Revenue: ₱145,000"
      ]
    },
    maintenance: {
      title: "Maintenance Records",
      icon: <FaTools />,
      metrics: [
        "Open Requests: 5",
        "Completed This Month: 12",
        "Emergency Repairs: 2",
        "Scheduled Maintenance: 3",
        "Average Response Time: 24 hours",
        "Total Maintenance Cost: ₱15,000"
      ]
    },
    tenants: {
      title: "Tenant Analytics",
      icon: <FaUserFriends />,
      metrics: [
        "Total Tenants: 18",
        "New Move-ins: 3",
        "Upcoming Move-outs: 2",
        "Rent Payment Status: 95% on time",
        "Average Tenant Rating: 4.5/5",
        "Tenant Complaints: 2 active"
      ]
    }
  };

  const handleGenerateReport = (type) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const renderReportPreview = () => {
    if (isGenerating) {
      return (
        <div className="generating-indicator">
          <div className="spinner"></div>
          <p>Generating report...</p>
        </div>
      );
    }

    const currentReport = reportData[selectedReport];
    if (!currentReport) {
      return (
        <div className="report-placeholder">
          <FaCalendarAlt />
          <p>Select report type and date range to generate preview</p>
        </div>
      );
    }

    return (
      <div className="report-metrics">
        <div className="report-metrics-header">
          <div className="metric-icon">{currentReport.icon}</div>
          <h3>{currentReport.title}</h3>
        </div>
        <div className="metrics-grid">
          {currentReport.metrics.map((metric, index) => (
            <div key={index} className="metric-item">
              <p>{metric}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className='reports-page'>
      <header className="reports-header">
        <h1>Reports & Analytics</h1>
        <p>Generate and analyze detailed business reports for your rental properties</p>
      </header>

      <div className="reports-container">
        <div className="report-types">
          <h2>Available Reports</h2>
          <div className="report-buttons">
            {Object.entries(reportData).map(([key, data]) => (
              <button 
                key={key}
                className={`report-btn ${selectedReport === key ? 'active' : ''}`}
                onClick={() => setSelectedReport(key)}
              >
                {data.icon} {data.title}
              </button>
            ))}
          </div>
        </div>

        <div className="report-config">
          <div className="config-section">
            <h3>Report Period</h3>
            <div className="date-range-selector">
              <button 
                className={`range-btn ${dateRange === 'weekly' ? 'active' : ''}`}
                onClick={() => setDateRange('weekly')}
              >
                Weekly
              </button>
              <button 
                className={`range-btn ${dateRange === 'monthly' ? 'active' : ''}`}
                onClick={() => setDateRange('monthly')}
              >
                Monthly
              </button>
              <button 
                className={`range-btn ${dateRange === 'quarterly' ? 'active' : ''}`}
                onClick={() => setDateRange('quarterly')}
              >
                Quarterly
              </button>
              <button 
                className={`range-btn ${dateRange === 'yearly' ? 'active' : ''}`}
                onClick={() => setDateRange('yearly')}
              >
                Yearly
              </button>
            </div>
          </div>

          <div className="config-section">
            <h3>Custom Date Range</h3>
            <div className="custom-date-range">
              <div className="date-input">
                <label>Start Date</label>
                <input type="date" />
              </div>
              <div className="date-input">
                <label>End Date</label>
                <input type="date" />
              </div>
            </div>
          </div>
        </div>

        <div className="report-preview">
          <div className="preview-header">
            <h3>Report Preview</h3>
            <div className="preview-actions">
              <button className="action-btn" onClick={() => handleGenerateReport('pdf')}>
                <FaFileAlt /> Generate PDF
              </button>
              <button className="action-btn" onClick={() => handleGenerateReport('excel')}>
                <FaDownload /> Export Excel
              </button>
            </div>
          </div>

          <div className="preview-content">
            {renderReportPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
