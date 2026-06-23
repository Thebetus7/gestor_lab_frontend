'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuración de los íconos de Leaflet para resolver problemas de empaquetado en producción
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  lat: number;
  lng: number;
  radio: number;
  onChange: (lat: number, lng: number) => void;
}

export default function MapComponent({ lat, lng, radio, onChange }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicializar el mapa
    const map = L.map(mapContainerRef.current).setView([lat, lng], 16);
    mapRef.current = map;

    // Capa de losetas gratuita de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Marcador arrastrable (draggable)
    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    // Círculo de validez
    const circle = L.circle([lat, lng], {
      radius: radio,
      color: '#008cc7', // var(--accent)
      fillColor: '#008cc7',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(map);
    circleRef.current = circle;

    // Listener para cuando se arrastra el marcador
    marker.on('drag', (e) => {
      const position = (e.target as L.Marker).getLatLng();
      circle.setLatLng(position);
      onChange(position.lat, position.lng);
    });

    // Permitir hacer click en cualquier parte del mapa para reubicar
    map.on('click', (e) => {
      const position = e.latlng;
      marker.setLatLng(position);
      circle.setLatLng(position);
      onChange(position.lat, position.lng);
    });

    // Ajustar vista del mapa al tamaño del contenedor
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sincronizar el radio del círculo si cambia en el input
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radio);
    }
  }, [radio]);

  // Sincronizar posición del marcador si cambia externamente (ej: al cargar de la API)
  useEffect(() => {
    if (markerRef.current && circleRef.current && mapRef.current) {
      const currentLatLng = markerRef.current.getLatLng();
      if (currentLatLng.lat !== lat || currentLatLng.lng !== lng) {
        const newLatLng = L.latLng(lat, lng);
        markerRef.current.setLatLng(newLatLng);
        circleRef.current.setLatLng(newLatLng);
        mapRef.current.setView(newLatLng, mapRef.current.getZoom());
      }
    }
  }, [lat, lng]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: '100%', 
        height: '350px', 
        borderRadius: '12px', 
        border: '1px solid var(--outline-variant)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
        zIndex: 1 
      }} 
    />
  );
}
