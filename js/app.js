///////////////////////////////////////////////////
// Globale Variable und Typen
///////////////////////////////////////////////////

var π = Math.PI,
  radians = π / 180,
  degrees = 180 / π;

// Enum fuer Rotation
const rotateMode = {
  none: 0,
  right: 1,
  left: 2,
  up: 4,
  down: 8,
};

// Initial kein Grid
let showGrid = false;
let showNight = true;

// Inititial keine Rotation
let rotateDirection = rotateMode.none;

const api_url = 'https://api.wheretheiss.at/v1/satellites/25544';

///////////////////////////////////////////////////
// Hauptfunktion
///////////////////////////////////////////////////
async function drawApp() {
  ///////////////////////////////////////////////////
  // Funktionen
  ///////////////////////////////////////////////////

  // für Positionierung und Skalierung
  const scale = 250;
  const cx = 400;
  const cy = 225;
  let positionActual = [0, 0];
  let positionLast = [0, 0];

  // ISS - Position aktualisieren
  const tickDuration = 3000;

  // alle Länder als geojson objects lesen
  const data = await d3.json('./data/world-geojson.json');

  // alle darzustellenden interessanten Punkte
  const pointsOfInterest = await d3.json('./data/points-of-interest.json');

  ///////////////////////////////////////////////////
  // Funktionen
  ///////////////////////////////////////////////////

  ///////////////////////////////////////////////////
  // Funktionen fuer die Darstellung der ISS
  ///////////////////////////////////////////////////

  async function updateISS() {
    // Aktualisieren der ISS Koordinaten und Darstellung der ISS
    const issData = await d3.json(api_url);
    const { latitude, longitude } = issData;
    setSatelliteData(pointsOfInterest, 'iss', issData);
    const hasPath = getPOIsVisibleState();
    drawISS('.iss', hasPath);
    //p.text(elapsed);
    //if (elapsed > ticker_value_stop) ticker.stop();
  }

  function animate(circle) {
    // Den Kreis der ISS blinkend von Farbe gelb Radius 5
    // zu Farbe orange Radius 8 animieren
    circle
      .transition()
      .duration(800)
      .attr('fill', 'yellow')
      .attr('r', 5)
      .transition()
      .duration(800)
      .attr('fill', 'orange')
      .attr('r', 8)
      .on('end', () => circle.call(animate));
  }

  function drawISS(className, hasPath) {
    // Die ISS zeichnen
    const issLon = d3
      .select('#iss-lon')
      .data(getISS(pointsOfInterest))
      .text((d) => `ISS-Lon: ${d.coordinates[0].toFixed(1)}`);
    const issLat = d3
      .select('#iss-lat')
      .data(getISS(pointsOfInterest))
      .text((d) => `ISS-Lat: ${d.coordinates[1].toFixed(1)}`);
    // Die ISS zeichen
    group
      .selectAll(className)
      .data(getISS(pointsOfInterest))

      // Ein oranger-gelber Kreis für die ISS
      .join('circle')
      .attr('class', 'iss')
      .attr('cx', (d) => getMapping('lon', d))
      .attr('cy', (d) => getMapping('lat', d))
      .attr('r', 10)
      .style('display', (d, i) => (hasPath[2] ? 'inline' : 'none'))
      .attr('fill', 'orange')
      .call(animate);
    // Eine Grafik fuer die ISS
    /* .join('svg:image')
      .attr('class', 'iss')
      .attr('xlink:href', './assets/images/space-station.png')
      .attr('x', (d) => getMapping('lon', d) - 15)
      .attr('y', (d) => getMapping('lat', d) - 15)
      .attr('height', 30)
      .attr('width', 30)
      .style('display', (d, i) => (hasPath[2] ? 'inline' : 'none')); */
  }

  ///////////////////////////////////////////////////
  // Funktion fuer die Darstellung weiterer
  // interessante Punkte (hier beispielhaft
  // die Universität Bremen
  // und die Stadt Johannesburg in Südafrika)
  ///////////////////////////////////////////////////
  function drawPointsOfInterest(className, hasPath) {
    group
      .selectAll(className)
      .data(getPointsOfInterest(pointsOfInterest))
      .join('circle')
      .attr('class', 'point')
      .attr('cx', (d) => getMapping('lon', d))
      .attr('cy', (d) => getMapping('lat', d))
      .attr('r', 8)
      .style('display', (d, i) => (hasPath[i] ? 'inline' : 'none'))
      .attr('fill', 'red');
  }

  /////////////////////////////////////////////////////////////////////////////////////
  // Handler fuer mouse down auf Land, um den nächste Ueberflug der ISS anzuzeigen
  /////////////////////////////////////////////////////////////////////////////////////
  function onMouseDown(e, datum) {
    const [centerX, centerY] = pathGenerator.centroid(datum);
    const earthCoordinates = projection.invert(d3.pointer(e));

    // local service
    const url = `http://localhost:8080/satellite/iss-passes/?lat=${earthCoordinates[0]}&lon=${earthCoordinates[1]}&alt=1650&n=1`;
    // foreign service
    //const url = `http://api.open-notify.org/iss/v1/?lat=${earthCoordinates[0]}&lon=${earthCoordinates[1]}&alt=1650&n=1`;

    fetch(url, { method: 'GET' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Bad status code from server.');
        }
        return response.json();
      })
      .then((data) => {
        if (data.message === 'success') {
          var date = new Date(data.response[1].risetime * 1000);
          console.log(data.response[0].risetime);
          console.log(date.getTime());
          console.log(date);
          console.log(date.getDate());
          nextPass = data.response[0].risetime;
        }

        var tag = date.getDate();
        var monat = date.getMonth() + 1;
        var jahr = date.getFullYear();
        var stunde = date.getHours();
        var minute = date.getMinutes();
        var sekunde = date.getSeconds();
        var millisek = date.getMilliseconds();

        var uhrzeit = `${tag}.${monat}.${jahr} ${stunde}:${minute}`;
        const infoText = `${datum.properties.NAME}: ${uhrzeit}`;

        /* <text font-family='sans-serif' font-size='40px' fill='cornflowerblue'>
            <tspan x='50' y='50'>
              Hallo SVG
            </tspan>
            <tspan x='50' y='100'>
              Alles absolut
            </tspan>
          </text>; */

        countryData.push(infoText);
        const hoveredRectangle = group
          .selectAll('.next-pass')
          .data(countryData)
          .join('text')
          .attr('class', 'next-pass')
          .attr('font-size', '25px')
          .attr('x', centerX)
          .attr('y', centerY)
          .attr('stroke', 'orange')
          .text((d) => d);

        const t = d3.timer(() => {
          countryData.pop();
          group
            .selectAll('.next-pass')
            .data(countryData)
            .join('text')
            .attr('class', 'next-pass')
            .attr('x', centerX)
            .attr('y', centerY)
            .attr('stroke', 'orange')
            .text((d) => d);
          t.stop();
        }, 5000);
      });
  }

  function getPOIsVisibleState() {
    // Pruefen, ob ein Punkt sichtbar ist oder ob er sich auf der Rückseite
    // der Erdkugel befindet
    const hasPath = [false, false, false];
    pointsOfInterest.forEach(function (d, i) {
      lon_lat = [d.coordinates[0], d.coordinates[1]];
      hasPath[i] =
        path({
          type: 'Point',
          coordinates: lon_lat,
        }) != undefined;
    });
    return hasPath;
  }

  ///////////////////////////////////////////////////
  // Ereignishandler für die Buttons zum rotieren
  ///////////////////////////////////////////////////
  const buttonRotateRight = d3
    .select('#button-rotate-right')
    .on('mousedown touchstart', function () {
      rotateDirection = rotateMode.right;
    })
    .on('mouseup touchend', function () {
      rotateDirection = rotateMode.none;
    });

  const buttonRotateLeft = d3
    .select('#button-rotate-left')
    .on('mousedown touchstart', function () {
      rotateDirection = rotateMode.left;
    })
    .on('mouseup touchend', function () {
      rotateDirection = rotateMode.none;
    });

  const buttonRotateDown = d3
    .select('#button-rotate-down')
    .on('mousedown touchstart', function () {
      rotateDirection = rotateMode.down;
    })
    .on('mouseup touchend', function () {
      rotateDirection = rotateMode.none;
    });

  const buttonRotateUp = d3
    .select('#button-rotate-up')
    .on('mousedown touchstart', function () {
      rotateDirection = rotateMode.up;
    })
    .on('mouseup touchend', function () {
      rotateDirection = rotateMode.none;
    });

  // Optionale Dartstellung eines Grids Laengen und Breitengrade
  const inputGrid = d3.select('#grid-input').on('change', function () {
    showGrid = this.checked;
    graticule.attr('stroke-opacity', `${showGrid ? '0.7' : '0.0'}`);
  });

  // Optionale Dartstellung eines Grids Laengen und Breitengrade
  const inputNightshow = d3
    .select('#nightshow-input')
    .on('change', function () {
      showNight = this.checked;
      if (showNight) {
        showAndRefreshNight(group, pathGenerator);
      } else {
        hideNight(group);
      }
    });

  async function rotate(now) {
    // Rotation der Erde durchfuehren
    if (rotateDirection !== rotateMode.none) {
      if (rotateDirection === rotateMode.right) {
        let newRotation = positionActual[0];
        if (positionActual[0] >= 360) {
          newRotation = positionActual[0] - 360;
        }
        positionActual[0] = newRotation + 0.8;
      } else if (rotateDirection === rotateMode.left) {
        let newRotation = positionActual[0];
        if (positionActual[0] <= 0) {
          newRotation = positionActual[0] + 360;
        }
        positionActual[0] = newRotation - 0.8;
      } else if (rotateDirection === rotateMode.down) {
        let newRotation = positionActual[1];
        if (positionActual[1] <= 0) {
          newRotation = positionActual[1] + 360;
        }
        positionActual[1] = newRotation - 0.8;
      } else if (rotateDirection === rotateMode.up) {
        let newRotation = positionActual[1];
        if (positionActual[1] >= 360) {
          newRotation = positionActual[1] - 360;
        }
        positionActual[1] = newRotation + 0.8;
      }

      projection.rotate(positionActual);

      group.select('.earth').attr('d', pathGenerator(sphere));

      group.select('.graticule').attr('d', pathGenerator(graticuleJson));

      /////// ACHTUNG AUF SCHALTER LEGEN
      /* group.select('.graticule').remove(); */

      // Länder neu
      /* group.selectAll('path').attr('d', pathGenerator); */
      group.selectAll('.country').attr('d', pathGenerator);

      group.select('.night').attr('d', pathGenerator);

      const hasPath = getPOIsVisibleState();

      drawPointsOfInterest('.point', hasPath);
      drawISS('.iss', hasPath);
      timeLast = timeActual;
      const positionX = d3
        .select('#position-x')
        .data(positionActual)
        .text(
          `X/Y: ${positionActual[0].toFixed(1)}/${positionActual[1].toFixed(1)}`
        );
    } else {
      timeLast = now;
    }
  }

  function getMapping(coordName, d) {
    // Ermittelt die Abbildung von Lon, Lat
    const [x, y, z] = projection(d.coordinates);
    if (coordName === 'lon') {
      return x;
    } else if (coordName === 'lat') {
      return y;
    }
    return z;
  }

  //
  //
  ///////////////////////////////////////////////////
  // Die Projektion der Erde als Kugel
  ///////////////////////////////////////////////////

  const projection = d3
    .geoOrthographic()
    .scale(scale)
    .translate([cx, cy])
    .rotate(positionActual); // Erde als Kugel

  const path = d3.geoPath().projection(projection);
  /* .pointRadius(function (d) {
      return 6;
    }); */

  // Den Container für die svg Grafik selektieren
  const wrapper = d3.select('#wrapper');

  // Einen svg - tag hinzufuegen
  const svgContainer = wrapper.append('svg').attr('viewBox', '0 0 800 450');

  // Eine Gruppe g-tag für die Zusammenfassung aller
  // darzustellenden Elemente in dem svgContainer
  // hinzufügen
  const group = svgContainer.append('g');

  // Den Pfadgenerator erstellen
  const pathGenerator = d3.geoPath().projection(projection);

  const sphere = { type: 'Sphere' };
  const earth = group
    .append('path')
    .attr('class', 'earth')
    .attr('d', pathGenerator(sphere));

  // Das Grid erzeugen
  const graticuleJson = d3.geoGraticule10();

  // Das grid darstellen
  // Opacity wird abhaengig #grid-input 0 (nicht sichtbar) bzw. 0.7 (sichtbar)
  const graticule = group
    .append('path')
    .attr('class', 'graticule')
    .attr('d', pathGenerator(graticuleJson))
    .attr('stroke-opacity', `${showGrid ? '0.7' : '0.0'}`);

  /* // Einen blauen Kreis für die Erde zeichen
  const background = group
    .append('circle')
    .attr('cx', cx)
    .attr('cy', cy)
    .attr('r', scale)
    .style('fill', 'blue'); */

  // Die Pfade für die Länder zeichnen
  const countries = group
    .selectAll('.country')
    .data(data.features)
    .join('path')
    .attr('class', 'country')
    .attr('d', (feature) => pathGenerator(feature));

  const tooltip = d3.select('#tooltip');
  const countryData = [];
  countries?.on('mousedown', onMouseDown); //.on('mouseup', onMouseLeave);

  const hasPath = getPOIsVisibleState();
  drawPointsOfInterest('.point', hasPath);

  await updateISS();

  // Die Rotation durchführen
  const timeRotation = 30000; //30s per rotation
  let timeActual;

  let timeLast = 0;

  //let positionLastX = 0;
  d3.timer(rotate);

  let ticker = d3.interval(async function (elapsed) {
    await updateISS();
  }, tickDuration);

  showAndRefreshNight(group, pathGenerator);
}

// Funktion aufrufen
drawApp();
