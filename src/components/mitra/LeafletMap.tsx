"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

interface LeafletMapProps {
  lat: number;
  lng: number;
  onMapClick: (lat: number, lng: number) => void;
}

export default function LeafletMap({ lat, lng, onMapClick }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Dynamic import leaflet to avoid SSR issues
    async function initMap() {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onMapClick(pos.lat, pos.lng);
      });

      map.on("click", (e: any) => {
        const { lat: newLat, lng: newLng } = e.latlng;
        marker.setLatLng([newLat, newLng]);
        onMapClick(newLat, newLng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    initMap().then(() => setReady(true));

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when lat/lng props change externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom());
    }
  }, [lat, lng]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-zinc-200">
      <div ref={mapRef} className="h-full w-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50">
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <MapPin className="h-8 w-8" strokeWidth={1.5} />
            <span className="text-xs font-medium">Memuat peta...</span>
          </div>
        </div>
      )}
    </div>
  );
}
