import { useEffect, useRef } from "react";

export default function MapBackground() {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
  if (instanceRef.current) {
  instanceRef.current.remove();
  instanceRef.current = null;
}

    // Dynamically load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Dynamically load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.onload = () => {
      const L = window.L;

      const map = L.map(mapRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        touchZoom: false,
        keyboard: false,
        attributionControl: false,
      });

      // Light clean tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
        { maxZoom: 4 }
      ).addTo(map);

      // City markers
      const CITIES = [
        { name: "Delhi",       lat: 28.6,  lng: 77.2,  aqi: "Unhealthy",      color: "#ef4444" },
        { name: "Mumbai",      lat: 19.0,  lng: 72.8,  aqi: "Unhealthy",      color: "#ef4444" },
        { name: "Beijing",     lat: 39.9,  lng: 116.4, aqi: "Very Unhealthy", color: "#9333ea" },
        { name: "London",      lat: 51.5,  lng: -0.1,  aqi: "Moderate",       color: "#f59e0b" },
        { name: "New York",    lat: 40.7,  lng: -74.0, aqi: "Moderate",       color: "#f59e0b" },
        { name: "Tokyo",       lat: 35.7,  lng: 139.7, aqi: "Good",           color: "#10b981" },
        { name: "Sydney",      lat: -33.9, lng: 151.2, aqi: "Good",           color: "#10b981" },
        { name: "Cairo",       lat: 30.0,  lng: 31.2,  aqi: "Hazardous",      color: "#dc2626" },
        { name: "Lahore",      lat: 31.5,  lng: 74.3,  aqi: "Hazardous",      color: "#dc2626" },
        { name: "São Paulo",   lat: -23.5, lng: -46.6, aqi: "Unhealthy",      color: "#ef4444" },
        { name: "Dubai",       lat: 25.2,  lng: 55.3,  aqi: "Moderate",       color: "#f59e0b" },
        { name: "Seoul",       lat: 37.6,  lng: 126.9, aqi: "Unhealthy",      color: "#ef4444" },
        { name: "Paris",       lat: 48.9,  lng: 2.3,   aqi: "Good",           color: "#10b981" },
        { name: "Berlin",      lat: 52.5,  lng: 13.4,  aqi: "Good",           color: "#10b981" },
        { name: "Los Angeles", lat: 34.0,  lng: -118.2,aqi: "Moderate",       color: "#f59e0b" },
        { name: "Shanghai",    lat: 31.2,  lng: 121.5, aqi: "Very Unhealthy", color: "#9333ea" },
        { name: "Nairobi",     lat: -1.3,  lng: 36.8,  aqi: "Moderate",       color: "#f59e0b" },
        { name: "Moscow",      lat: 55.8,  lng: 37.6,  aqi: "Moderate",       color: "#f59e0b" },
        { name: "Kolkata",     lat: 22.6,  lng: 88.4,  aqi: "Very Unhealthy", color: "#9333ea" },
        { name: "Hyderabad",   lat: 17.4,  lng: 78.5,  aqi: "Unhealthy",      color: "#ef4444" },
      ];

      CITIES.forEach(city => {
        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              position: relative;
              width: 14px;
              height: 14px;
            ">
              <div style="
                position: absolute;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: ${city.color};
                opacity: 0.25;
                animation: pulse-ring 2s ease-out infinite;
              "></div>
              <div style="
                position: absolute;
                top: 3px; left: 3px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${city.color};
                border: 1.5px solid white;
                box-shadow: 0 0 4px ${city.color};
              "></div>
            </div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        L.marker([city.lat, city.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;padding:4px 2px;">
              <strong style="font-size:13px;">${city.name}</strong><br/>
              <span style="font-size:12px;color:${city.color};font-weight:600;">
                ${city.aqi}
              </span>
            </div>
          `, { closeButton: false });
      });

      instanceRef.current = map;
    };

    document.head.appendChild(script);

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.4; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .leaflet-container {
          background: #e8f4fd !important;
        }
      `}</style>
      <div
        ref={mapRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          opacity: 0.55,
          pointerEvents: "none",
        }}
      />
    </>
  );
}