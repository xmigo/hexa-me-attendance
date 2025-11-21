/**
 * Geofencing utility functions
 * Handles point-in-polygon and distance calculations
 */

interface Point {
  lat: number;
  lng: number;
}

interface CircleZone {
  centerLat: number;
  centerLng: number;
  radius: number; // in meters
}

interface PolygonZone {
  coordinates: Point[];
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) *
      Math.cos(toRadians(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is within a circle zone
 */
export function isPointInCircle(point: Point, zone: CircleZone, bufferDistance: number = 0): boolean {
  const distance = calculateDistance(point, {
    lat: zone.centerLat,
    lng: zone.centerLng
  });
  return distance <= (zone.radius + bufferDistance);
}

/**
 * Check if a point is within a polygon zone using ray casting algorithm
 */
export function isPointInPolygon(point: Point, polygon: PolygonZone): boolean {
  const { lat, lng } = point;
  let inside = false;

  for (let i = 0, j = polygon.coordinates.length - 1; i < polygon.coordinates.length; j = i++) {
    const xi = polygon.coordinates[i].lng;
    const yi = polygon.coordinates[i].lat;
    const xj = polygon.coordinates[j].lng;
    const yj = polygon.coordinates[j].lat;

    const intersect =
      yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Find the nearest work zone to a point
 */
export function findNearestZone(
  point: Point,
  zones: Array<{ id: string; zoneType: string; centerLat?: number; centerLng?: number; radius?: number; coordinates?: string; bufferDistance: number }>
): { zoneId: string; distance: number } | null {
  let nearest: { zoneId: string; distance: number } | null = null;
  let minDistance = Infinity;

  for (const zone of zones) {
    let distance: number;

    if (zone.zoneType === 'circle' && zone.centerLat && zone.centerLng) {
      distance = calculateDistance(point, {
        lat: zone.centerLat,
        lng: zone.centerLng
      });
      distance = Math.max(0, distance - (zone.radius || 0)); // Distance to edge
    } else if (zone.zoneType === 'polygon' && zone.coordinates) {
      const polygon = JSON.parse(zone.coordinates) as Point[];
      // Find minimum distance to polygon edge
      distance = distanceToPolygon(point, polygon);
    } else {
      continue;
    }

    if (distance < minDistance) {
      minDistance = distance;
      nearest = { zoneId: zone.id, distance };
    }
  }

  return nearest;
}

/**
 * Calculate distance from a point to the nearest edge of a polygon
 */
function distanceToPolygon(point: Point, polygon: Point[]): number {
  let minDistance = Infinity;

  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const distance = distanceToLineSegment(point, p1, p2);
    minDistance = Math.min(minDistance, distance);
  }

  return minDistance;
}

/**
 * Calculate distance from a point to a line segment
 */
function distanceToLineSegment(point: Point, lineStart: Point, lineEnd: Point): number {
  const A = point.lng - lineStart.lng;
  const B = point.lat - lineStart.lat;
  const C = lineEnd.lng - lineStart.lng;
  const D = lineEnd.lat - lineStart.lat;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) param = dot / lenSq;

  let xx: number, yy: number;

  if (param < 0) {
    xx = lineStart.lng;
    yy = lineStart.lat;
  } else if (param > 1) {
    xx = lineEnd.lng;
    yy = lineEnd.lat;
  } else {
    xx = lineStart.lng + param * C;
    yy = lineStart.lat + param * D;
  }

  const dx = point.lng - xx;
  const dy = point.lat - yy;
  return Math.sqrt(dx * dx + dy * dy) * 111000; // Approximate conversion to meters
}

/**
 * Validate if a location is within allowed work zones
 */
export function validateLocation(
  point: Point,
  zones: Array<{
    id: string;
    zoneType: string;
    centerLat?: number;
    centerLng?: number;
    radius?: number;
    coordinates?: string;
    isRestricted: boolean;
    bufferDistance: number;
  }>
): {
  isValid: boolean;
  isInRestrictedZone: boolean;
  nearestZone?: { id: string; distance: number };
  violationReason?: string;
} {
  // Check restricted zones first
  for (const zone of zones) {
    if (!zone.isRestricted) continue;

    let isInZone = false;
    if (zone.zoneType === 'circle' && zone.centerLat && zone.centerLng) {
      isInZone = isPointInCircle(point, {
        centerLat: zone.centerLat,
        centerLng: zone.centerLng,
        radius: zone.radius || 0
      }, zone.bufferDistance);
    } else if (zone.zoneType === 'polygon' && zone.coordinates) {
      const polygon = JSON.parse(zone.coordinates) as Point[];
      isInZone = isPointInPolygon(point, { coordinates: polygon });
    }

    if (isInZone) {
      return {
        isValid: false,
        isInRestrictedZone: true,
        violationReason: `Location is within restricted zone: ${zone.id}`
      };
    }
  }

  // Check allowed zones
  let isInAllowedZone = false;
  let nearestZone: { id: string; distance: number } | null = null;

  for (const zone of zones) {
    if (zone.isRestricted) continue;

    let isInZone = false;
    if (zone.zoneType === 'circle' && zone.centerLat && zone.centerLng) {
      isInZone = isPointInCircle(point, {
        centerLat: zone.centerLat,
        centerLng: zone.centerLng,
        radius: zone.radius || 0
      }, zone.bufferDistance);
    } else if (zone.zoneType === 'polygon' && zone.coordinates) {
      const polygon = JSON.parse(zone.coordinates) as Point[];
      isInZone = isPointInPolygon(point, { coordinates: polygon });
    }

    if (isInZone) {
      isInAllowedZone = true;
      break;
    }
  }

  if (!isInAllowedZone) {
    nearestZone = findNearestZone(
      point,
      zones.filter(z => !z.isRestricted)
    );
  }

  return {
    isValid: isInAllowedZone,
    isInRestrictedZone: false,
    nearestZone: nearestZone || undefined,
    violationReason: isInAllowedZone
      ? undefined
      : `Location is outside allowed work zones. Nearest zone: ${nearestZone?.distance.toFixed(0)}m away`
  };
}


