///////////////////////////////////////////////////
// Hilfsfunktionen - Anfang
///////////////////////////////////////////////////

function setSatelliteData(pointsOfInterest, name, data) {
  pointsOfInterest.forEach((d) => {
    if (d.name === name) {
      d.coordinates[0] = data.latitude;
      d.coordinates[1] = data.longitude;
    }
  });
}

function getISS(pointsOfInterest) {
  return pointsOfInterest.filter((d) => {
    if (d.name === 'iss') {
      return d;
    }
  });
}

function getPointsOfInterest(pointsOfInterest) {
  return pointsOfInterest.filter((d) => {
    if (d.name !== 'iss') {
      return d;
    }
  });
}
