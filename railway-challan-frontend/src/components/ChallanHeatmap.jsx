import React from 'react'
import { MapContainer, TileLayer, useMap,  } from 'react-leaflet';
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

const Heatmap = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const heatLayer = L.heatLayer(
      points.map(p => [p.latitude, p.longitude, p.count || 1]),
      { radius: 25, blur: 15, maxZoom: 17 }
    ).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const ChallanHeatmap = ({ challansByLocation ,loading , error }) => {
  if (loading)
    return (
      <div className="bg-white p-8 rounded-xl text-blue-700 text-center font-semibold min-h-[120px]">Loading map...</div>
    );

  if (error)
    return (
      <div className="bg-white p-8 rounded-xl text-red-700 text-center font-semibold min-h-[120px]">{error}</div>
    );
    
  return (
    <div className="bg-white p-4 shadow rounded-xl">
      <h2 className="text-xl font-semibold mb-4">Challan Heatmap (by Location)</h2>
      <MapContainer
        center={[19.076, 72.8777]}
        zoom={11}
        style={{ height: 300, width: '100%' }}
        minZoom={6}
        maxBounds={[[8, 68], [37, 98]]} // Rough bounds covering India
        maxBoundsViscosity={1.0} // Prevent panning outside
      >
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Heatmap points={challansByLocation} />

      </MapContainer>
    </div>
  )
}

export default ChallanHeatmap