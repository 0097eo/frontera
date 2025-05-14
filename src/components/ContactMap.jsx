import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const ContactMap = () => {
  const [mapLoaded, setMapLoaded] = useState(false);
  
  const position = [-0.117436, 34.788146];
  
  useEffect(() => {

    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(linkElement);
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    script.async = true;
    script.onload = initializeMap;
    document.body.appendChild(script);
    
    return () => {
      if (document.head.contains(linkElement)) {
        document.head.removeChild(linkElement);
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);
  
  const initializeMap = () => {
    const mapContainer = document.getElementById('location-map');
    if (!mapContainer || !window.L) return;
    
    if (mapContainer._leaflet_id) {
      mapContainer._leaflet = null;
    }
    
    const map = window.L.map('location-map').setView(position, 15);
    
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    const marker = window.L.marker(position)
      .addTo(map)
      .bindPopup('Ideal Furniture<br>Nyamasaria, Kisumu, Kenya')
      .openPopup();
    
    setMapLoaded(true);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
      <div className="p-3 bg-amber-50 border-b border-amber-100">
        <h3 className="text-lg font-bold flex items-center">
          <MapPin className="h-5 w-5 text-amber-600 mr-2" />
          Our Location
        </h3>
      </div>
      
      <div 
        id="location-map" 
        className="w-full aspect-square"
        style={{ background: '#f0f0f0' }}
      >
        {!mapLoaded && (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">Loading map...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactMap;