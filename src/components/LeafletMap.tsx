"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LeafletMapProps {
  lat?: number;
  lng?: number;
  onSelectLocation?: (lat: number, lng: number) => void;
  height?: string;
  readonly?: boolean;
}

export function LeafletMap({ lat, lng, onSelectLocation, height = "300px", readonly = false }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const defaultLat = lat || -6.2088;
    const defaultLng = lng || 106.8456;

    const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    if (lat && lng) {
      markerRef.current = L.marker([lat, lng], { draggable: !readonly }).addTo(map);
    }

    if (!readonly && onSelectLocation) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
        } else {
          markerRef.current = L.marker([newLat, newLng], { draggable: true }).addTo(map);
        }
        onSelectLocation(newLat, newLng);

        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          onSelectLocation(pos.lat, pos.lng);
        });
      });
    }

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && lat && lng) {
      mapInstanceRef.current.setView([lat, lng], 13);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: !readonly }).addTo(mapInstanceRef.current);
      }
    }
  }, [lat, lng]);

  return <div ref={mapRef} style={{ height, width: "100%", borderRadius: "4px", zIndex: 0 }} />;
}