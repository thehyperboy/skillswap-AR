export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function boundingBox(lat: number, lon: number, km: number) {
  const earthRadiusKm = 6371;
  const radLat = (lat * Math.PI) / 180;

  const maxLat = lat + (km / earthRadiusKm) * (180 / Math.PI);
  const minLat = lat - (km / earthRadiusKm) * (180 / Math.PI);

  const maxLon = lon + (km / earthRadiusKm) * (180 / Math.PI) / Math.cos(radLat);
  const minLon = lon - (km / earthRadiusKm) * (180 / Math.PI) / Math.cos(radLat);

  return { minLat, maxLat, minLon, maxLon };
}
