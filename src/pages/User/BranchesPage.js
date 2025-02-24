import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/BranchesPage.css';
import GoogleAd from '../../components/GoogleAd';

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showAds, setShowAds] = useState({
    top: true,
    left: true,
    right: true,
    bottom: true
  });

  // Track ad impressions and clicks
  const [adMetrics, setAdMetrics] = useState({
    impressions: 0,
    clicks: 0
  });

  const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000" // Development API
    : "https://your-production-backend.com"; // Production API

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${API_URL}/rental/getBranches`);
        if (!response.ok) {
          throw new Error('Failed to fetch branches');
        }
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setLoading(false);
      }
    };

    // Load multiple ad networks
    const loadAdNetworks = () => {
      // Google AdSense
      const adSenseScript = document.createElement('script');
      adSenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      adSenseScript.async = true;
      adSenseScript.crossOrigin = 'anonymous';
      adSenseScript.setAttribute('data-ad-client', 'ca-pub-YOUR_PUBLISHER_ID');
      document.head.appendChild(adSenseScript);

      // Media.net (Optional)
      const mediaNetScript = document.createElement('script');
      mediaNetScript.src = '//contextual.media.net/dmedianet.js?cid=YOUR_MEDIANET_ID';
      mediaNetScript.async = true;
      document.head.appendChild(mediaNetScript);
    };

    fetchBranches();
    loadAdNetworks();

    // Track viewport for lazy loading ads
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setAdMetrics(prev => ({
            ...prev,
            impressions: prev.impressions + 1
          }));
        }
      });
    });

    // Observe ad containers
    document.querySelectorAll('.ad-container').forEach(ad => {
      observer.observe(ad);
    });

    return () => observer.disconnect();
  }, []);

  const getImagePath = (imageName) => {
    try {
      return require(`../../assets/images/branches/${imageName}`);
    } catch (error) {
      console.error(`Image not found: ${imageName}`);
      return null;
    }
  };

  const handleSeeProperty = (branchId) => {
    navigate(`/property/${branchId}`);
  };

  const handleCloseAd = (position) => {
    setShowAds(prev => ({
      ...prev,
      [position]: false
    }));
  };

  const handleAdClick = () => {
    setAdMetrics(prev => ({
      ...prev,
      clicks: prev.clicks + 1
    }));
  };

  // Rotate ads periodically
  useEffect(() => {
    const adRotationInterval = setInterval(() => {
      // Implement ad rotation logic here
      // This could involve cycling through different ad networks or placements
    }, 30000); // Rotate every 30 seconds

    return () => clearInterval(adRotationInterval);
  }, []);

  return (
    <>
      {/* Top Advertisement Banner with A/B Testing */}
      {showAds.top && (
        <div className="ad-banner-top">
          <div className="ad-container" onClick={handleAdClick}>
            <div className="ad-header">
              <p className="ad-label">Sponsored Content</p>
              <button 
                className="ad-close-btn"
                onClick={() => handleCloseAd('top')}
                aria-label="Close advertisement"
              >
                ×
              </button>
            </div>
            {/* Responsive Ad Unit */}
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                data-ad-slot="YOUR_AD_SLOT_ID"
                data-ad-format="auto"
                data-full-width-responsive="true">
            </ins>
            {/* Fallback Ad Content */}
            <div className="native-ad-fallback" style={{ display: 'none' }}>
              <img src="/path/to/fallback-ad.jpg" alt="Advertisement" />
            </div>
          </div>
        </div>
      )}

      <div className="branches-section">
        <div className="section-header">
          <h2>Our Properties</h2>
          <p>Discover premium apartments in prime locations. Find your perfect home today.</p>
        </div>

        <div className="branches-content">
          {/* Left Sidebar Native Ad */}
          {showAds.left && (
            <div className="ad-sidebar-left">
              <div className="ad-header">
                <p className="ad-label">Featured Partners</p>
                <button 
                  className="ad-close-btn"
                  onClick={() => handleCloseAd('left')}
                  aria-label="Close advertisement"
                >
                  ×
                </button>
              </div>
              <div className="native-ad-content" onClick={handleAdClick}>
                {/* Custom Native Ad Content */}
                <div className="sponsored-content">
                  <img src="/path/to/native-ad.jpg" alt="Sponsored" />
                  <h4>Premium Living Spaces</h4>
                  <p>Discover luxury apartments in your area</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="main-content">
            {loading ? (
              <p>Loading properties...</p>
            ) : branches.length > 0 ? (
              <ul className="branches-list">
                {branches.map((branch) => (
                  <li key={branch.id} className="branch-item">
                    <div className="branch-details">
                    <img
                      src={getImagePath(branch.image)}
                      alt={branch.name}
                      className="branch-image"
                    />
                      <div className="branch-info">
                        <h3>{branch.name}</h3>
                        <p><strong>Address:</strong> {branch.address}</p>
                        <p><strong>Contact:</strong> {branch.contact}</p>
                        <p><strong>Operating Hours:</strong> {branch.hours}</p>
                        <p>
                          <span
                            className="see-property-text-btn"
                            onClick={() => handleSeeProperty(branch.id)}
                          >
                            See Property
                          </span>
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No properties found.</p>
            )}

            {/* In-Content Ad */}
            {branches.length > 3 && (
              <div className="in-content-ad" onClick={handleAdClick}>
                <div className="ad-header">
                  <p className="ad-label">Recommended</p>
                </div>
                <ins className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-format="fluid"
                    data-ad-layout-key="-fb+5w+4e-db+86">
                </ins>
              </div>
            )}

            <div className="why-choose-us">
              <h3>Why Choose Us?</h3>
              <p>
                We offer premium apartments with modern amenities and prime locations
                to suit your lifestyle. Enjoy:
              </p>
              <ul>
                <li>24/7 customer support</li>
                <li>Affordable pricing</li>
                <li>Pet-friendly properties</li>
                <li>Convenient payment options</li>
              </ul>
              <img
                src="https://cdn.thecoolist.com/wp-content/uploads/2016/05/Carmel-Place-micro-apartment.jpg"
                alt="Apartments overview"
                className="additional-image"
              />
            </div>
          </div>

          {/* Right Sidebar Premium Ad Space */}
          {showAds.right && (
            <div className="ad-sidebar-right">
              <div className="ad-header premium-ad">
                <p className="ad-label">Premium Partners</p>
                <button 
                  className="ad-close-btn"
                  onClick={() => handleCloseAd('right')}
                  aria-label="Close advertisement"
                >
                  ×
                </button>
              </div>
              <div className="premium-ad-space" onClick={handleAdClick}>
                {/* Premium Ad Content */}
                <div className="premium-sponsored-content">
                  <img src="/path/to/premium-ad.jpg" alt="Premium Sponsor" />
                  <h4>Exclusive Offers</h4>
                  <p>Special deals for our visitors</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Smart Banner Ad */}
      {showAds.bottom && (
        <div className="ad-banner-bottom">
          <div className="ad-container smart-banner" onClick={handleAdClick}>
            <div className="ad-header">
              <p className="ad-label">Smart Recommendations</p>
              <button 
                className="ad-close-btn"
                onClick={() => handleCloseAd('bottom')}
                aria-label="Close advertisement"
              >
                ×
              </button>
            </div>
            {/* Smart Banner Ad Unit */}
            <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
                data-ad-slot="YOUR_AD_SLOT_ID"
                data-ad-format="auto"
                data-full-width-responsive="true">
            </ins>
          </div>
        </div>
      )}
    </>
  );
};

export default Branches;
