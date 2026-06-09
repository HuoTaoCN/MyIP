"use client";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lon: number;
  label?: string;
}

export default function IpMap({ lat, lon, label }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let active = true;
    const el = containerRef.current;
    if (!el) return;

    import("leaflet").then((mod) => {
      const L = mod.default;
      if (!active || !containerRef.current) return;

      // Reuse existing map instance — just recenter
      if (mapRef.current) {
        mapRef.current.setView([lat, lon], 10);
        return;
      }

      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current).setView([lat, lon], 10);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      L.marker([lat, lon]).addTo(map).bindPopup(label ?? `${lat}, ${lon}`).openPopup();
    });

    return () => {
      active = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [lat, lon, label]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
