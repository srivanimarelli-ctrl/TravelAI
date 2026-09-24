import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { ActivitySegment, RouteLeg } from '../../types';

interface DayMapViewProps {
  activities: ActivitySegment[];
  destination?: string;
  dayNumber: number;
  legs?: RouteLeg[];
  activeLegIndex?: number;
  onSelectLeg?: (index: number) => void;
}

export const DayMapView: React.FC<DayMapViewProps> = ({ 
  activities, 
  destination, 
  dayNumber,
  legs,
  activeLegIndex = 0,
  onSelectLeg,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Filter valid coordinates or default to city coordinates if available
    const waypoints: Array<{
      name: string;
      timeOfDay: string;
      lat: number;
      lon: number;
      thumbnail?: string;
      status?: string;
      location?: string;
    }> = [];

    // Fallback coordinates for common destinations if specific lat/lon is missing
    const fallbackCoords: Record<string, [number, number]> = {
      delhi: [28.6139, 77.2090],
      goa: [15.2993, 74.1240],
      jaipur: [26.9124, 75.7873],
      mumbai: [19.0760, 72.8777],
      bengaluru: [12.9716, 77.5946],
      bangalore: [12.9716, 77.5946],
      agra: [27.1767, 78.0081],
      varanasi: [25.3176, 82.9739],
      udaipur: [24.5854, 73.7125],
      kerala: [9.9312, 76.2673],
      kochi: [9.9312, 76.2673],
      manali: [32.2432, 77.1892],
      shimla: [31.1048, 77.1734],
    };

    const destKey = (destination || '').toLowerCase().split(',')[0].trim();
    const defaultCenter = fallbackCoords[destKey] || [28.6139, 77.2090];

    activities.forEach((act, idx) => {
      let lat = act.lat;
      let lon = act.lon;

      if (!lat || !lon || lat === 0 || lon === 0) {
        // Offset slightly around destination center for visual route representation
        const offsetLat = (idx === 0 ? 0.02 : idx === 1 ? -0.015 : 0.01) + (Math.sin(dayNumber + idx) * 0.008);
        const offsetLon = (idx === 0 ? -0.015 : idx === 1 ? 0.02 : 0.015) + (Math.cos(dayNumber + idx) * 0.008);
        lat = defaultCenter[0] + offsetLat;
        lon = defaultCenter[1] + offsetLon;
      }

      waypoints.push({
        name: act.title,
        timeOfDay: act.timeOfDay,
        lat,
        lon,
        thumbnail: act.thumbnail,
        status: act.operatingStatus,
        location: act.location,
      });
    });

    if (waypoints.length === 0) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([waypoints[0].lat, waypoints[0].lon], 13);

    mapInstanceRef.current = map;

    // Dark styled OpenStreetMap tiles for luxury aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const allRoutePoints: L.LatLngTuple[] = [];

    // 1. Draw Real Street-level OSRM Road Geometry if available
    if (legs && legs.length > 0) {
      legs.forEach((leg, idx) => {
        const isSelectedLeg = idx === activeLegIndex;
        const polyCoords: L.LatLngTuple[] = leg.geometry.map((c) => [c[0], c[1]]);

        polyCoords.forEach((p) => allRoutePoints.push(p));

        if (polyCoords.length > 0) {
          // Draw outer line for selected leg highlight
          if (isSelectedLeg) {
            L.polyline(polyCoords, {
              color: '#38bdf8',
              weight: 8,
              opacity: 0.35,
              lineCap: 'round',
              lineJoin: 'round',
            }).addTo(map);
          }

          // Main road route line
          const line = L.polyline(polyCoords, {
            color: isSelectedLeg ? '#0284c7' : '#94a3b8',
            weight: isSelectedLeg ? 5 : 3.5,
            opacity: isSelectedLeg ? 0.95 : 0.65,
            dashArray: isSelectedLeg ? undefined : '6, 6',
          }).addTo(map);

          if (onSelectLeg) {
            line.on('click', () => onSelectLeg(idx));
          }
        }
      });
    } else {
      // Fallback: draw connecting path across waypoints
      const simpleCoords: L.LatLngTuple[] = waypoints.map((w) => [w.lat, w.lon]);
      simpleCoords.forEach((p) => allRoutePoints.push(p));

      if (simpleCoords.length > 1) {
        L.polyline(simpleCoords, {
          color: '#0284c7',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '8, 8',
        }).addTo(map);
      }
    }

    // 2. Add Waypoint Pin Markers
    waypoints.forEach((wp, i) => {
      allRoutePoints.push([wp.lat, wp.lon]);

      const pinColors = [
        { bg: '#0284c7', ring: '#38bdf8', label: '1', name: 'Morning' },
        { bg: '#7c3aed', ring: '#a78bfa', label: '2', name: 'Afternoon' },
        { bg: '#059669', ring: '#34d399', label: '3', name: 'Evening' },
      ];

      const pin = pinColors[i % pinColors.length];

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; background: ${pin.bg}; border: 2.5px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.4); color: #ffffff; font-weight: 700; font-size: 13px; font-family: sans-serif;">
            ${pin.label}
            <div style="position: absolute; bottom: -5px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${pin.bg};"></div>
          </div>
        `,
        iconSize: [34, 38],
        iconAnchor: [17, 38],
        popupAnchor: [0, -36],
      });

      const popupContent = `
        <div style="font-family: 'Geist', sans-serif; min-width: 180px; max-width: 240px; padding: 4px;">
          ${wp.thumbnail ? `<img src="${wp.thumbnail}" alt="${wp.name}" style="width: 100%; height: 85px; object-fit: cover; border-radius: 8px; margin-bottom: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.2);" />` : ''}
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${pin.bg}; letter-spacing: 0.05em; margin-bottom: 2px;">
            Stop ${i + 1} • ${wp.timeOfDay}
          </div>
          <div style="font-size: 12px; font-weight: 600; color: #0f172a; margin-bottom: 3px; line-height: 1.2;">
            ${wp.name}
          </div>
          ${wp.location ? `<div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">📍 ${wp.location}</div>` : ''}
          ${wp.status ? `<div style="display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; ${wp.status === 'OPEN' ? 'background: #dcfce7; color: #15803d;' : wp.status === 'CLOSED' ? 'background: #fee2e2; color: #b91c1c;' : 'background: #fef3c7; color: #b45309;'}">${wp.status}</div>` : ''}
        </div>
      `;

      L.marker([wp.lat, wp.lon], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    // 3. Fit Bounds to entire road route or active leg
    if (allRoutePoints.length > 1) {
      const bounds = L.latLngBounds(allRoutePoints);
      map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activities, destination, dayNumber, legs, activeLegIndex, onSelectLeg]);

  return (
    <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden shadow-lg border border-surface-container-highest/60">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute top-3 right-3 z-[400] bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-surface-container-highest/60 text-xs font-semibold text-on-surface shadow-md flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        <span>Day {dayNumber} Street Road Map</span>
      </div>
    </div>
  );
};
