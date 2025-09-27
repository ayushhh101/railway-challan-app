import React from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

const Heatmap = ({ points }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!points || !Array.isArray(points) || points.length === 0) return;
    
    const heatLayer = L.heatLayer(
      points.map(p => [p.latitude, p.longitude, p.count || 1]),
      { 
        radius: 25, 
        blur: 15, 
        maxZoom: 17,
        gradient: {
          0.0: '#3b82f6',
          0.5: '#10b981',
          1.0: '#ef4444'
        }
      }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const ChallanHeatmap = ({ challansByLocation, loading, error }) => {
  if (loading) {
    return (
      <div 
        className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 text-center h-[350px] sm:h-[400px] flex items-center justify-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          {/* Body Text: 16px */}
          <p className="text-base text-blue-600 font-semibold leading-normal">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 text-center h-[350px] sm:h-[400px] flex flex-col items-center justify-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        {/* Body Text: 16px */}
        <p className="text-base text-red-700 font-semibold leading-normal">{error}</p>
      </div>
    );
  }

  if (!challansByLocation || challansByLocation.length === 0) {
    return (
      <div 
        className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 text-center h-[350px] sm:h-[400px] flex flex-col items-center justify-center"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-base text-gray-500 leading-normal">No location data available</p>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 h-[350px] sm:h-[400px] flex flex-col"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Chart Header */}
      <div className="mb-4">
        {/* Subsection Headings: 18px */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight mb-2">
          Challan Heatmap
        </h3>
        {/* Secondary Text: 14px */}
        <p className="text-sm text-gray-600 leading-normal">
          Geographic distribution of hotspots
        </p>
      </div>
      
      {/* Map Container */}
      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
        <MapContainer
          center={[19.076, 72.8777]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          minZoom={6}
          maxBounds={[[8, 68], [37, 98]]}
          maxBoundsViscosity={1.0}
          zoomControl={true}
          scrollWheelZoom={false}
          doubleClickZoom={true}
          dragging={true}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Heatmap points={challansByLocation} />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          {/* Small Text: 12px */}
          <span className="text-xs text-gray-600">Low</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-600">Medium</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-xs text-gray-600">High</span>
        </div>
      </div>
    </div>
  );
};

export default ChallanHeatmap;
