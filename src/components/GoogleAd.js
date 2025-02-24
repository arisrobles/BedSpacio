import React, { useEffect, useState } from 'react';

const GoogleAd = ({ slot, format = "auto", responsive = true }) => {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsLoading(false);
      }
    } catch (e) { 
      setIsError(true);
      setIsLoading(false);
      console.error('AdSense error:', e);
    }
  }, []);

  if (isError) return null; // Or a fallback ad
  
  return (
    <>
      {isLoading && <div className="ad-loading">Loading ad...</div>}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-YOUR_PUBLISHER_ID"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </>
  );
};

export default GoogleAd; 