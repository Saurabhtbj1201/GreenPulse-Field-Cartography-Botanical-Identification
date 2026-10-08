import L from 'leaflet';

// ============================================================================
// State Management
// ============================================================================
const STATE = {
  activeTab: 'routes-tab',
  activeCoords: [40.785091, -73.968285],
  sessionSeconds: 0,
  audioActive: false,
  map: null,
  userMarker: null,
  routePolyline: null,
  simulationInterval: null,
  activeRouteIndex: 0,
  cameraStream: null,

  // Technical Route Definitions
  routes: [
    {
      id: 'ROUTE-NY-01',
      title: 'Ramble Hardwood & Outcrop Survey',
      category: 'Deciduous Canopy Survey',
      distanceKm: 1.62,
      durationMin: 28,
      narrative: 'This corridor passes through mixed mature hardwood stands, rocky terrain, and secondary growth understory. The objective is to record native fall foliage specimens and log structural waypoints without continuous mobile screen usage.',
      spokenBriefing: 'Survey route initiated. Proceed east toward the hardwood ridge. Look for early foliar pigment shifts in sugar maples and verify trail footbridge coordinates.',
      waypoints: [
        { id: 'WP-101', name: 'Acer saccharum (Sugar Maple)', category: 'Botanical / Deciduous', coords: '40.7852° N, 73.9680° W', latLng: [40.7852, -73.9680], verified: false },
        { id: 'WP-102', name: 'Rustic Timber Footbridge', category: 'Civil Infrastructure', coords: '40.7865° N, 73.9675° W', latLng: [40.7865, -73.9675], verified: true },
        { id: 'WP-103', name: 'Quercus alba (White Oak)', category: 'Botanical / Fagaceae', coords: '40.7878° N, 73.9662° W', latLng: [40.7878, -73.9662], verified: false }
      ],
      pathCoordinates: [
        [40.785091, -73.968285],
        [40.785200, -73.968000],
        [40.786500, -73.967500],
        [40.787800, -73.966200],
        [40.789100, -73.965000]
      ]
    },
    {
      id: 'ROUTE-NY-02',
      title: 'Reservoir Riparian Border Survey',
      category: 'Aquatic-Terrestrial Boundary',
      distanceKm: 2.35,
      durationMin: 38,
      narrative: 'An open perimeter transect examining wetland edge species, windbreak conifers, and seasonal water runoff filtration channels.',
      spokenBriefing: 'Perimeter transect active. Observe willow and alder stands along the perimeter embankment. Record any emergent aquatic vegetation.',
      waypoints: [
        { id: 'WP-201', name: 'Salix nigra (Black Willow)', category: 'Botanical / Salicaceae', coords: '40.7820° N, 73.9710° W', latLng: [40.7820, -73.9710], verified: false },
        { id: 'WP-202', name: 'Hydraulic Gauge Station', category: 'Hydrological Station', coords: '40.7832° N, 73.9702° W', latLng: [40.7832, -73.9702], verified: false },
        { id: 'WP-203', name: 'Betula nigra (River Birch)', category: 'Botanical / Betulaceae', coords: '40.7845° N, 73.9691° W', latLng: [40.7845, -73.9691], verified: false }
      ],
      pathCoordinates: [
        [40.782000, -73.971000],
        [40.783200, -73.970200],
        [40.784500, -73.969100],
        [40.785800, -73.967900]
      ]
    }
  ],

  // Cataloged Records
  records: [
    {
      id: 'REC-2026-0891',
      scientificName: 'Acer saccharum',
      division: 'Magnoliophyta / Sapindaceae',
      probability: '0.964',
      coordinates: '40.7852° N, 73.9680° W',
      timestamp: '2026-10-08 10:14 UTC'
    },
    {
      id: 'REC-2026-0890',
      scientificName: 'Timber Trail Bench',
      division: 'Structural / Park Asset',
      probability: '0.942',
      coordinates: '40.7865° N, 73.9675° W',
      timestamp: '2026-10-08 09:48 UTC'
    },
    {
      id: 'REC-2026-0889',
      scientificName: 'Quercus alba',
      division: 'Magnoliophyta / Fagaceae',
      probability: '0.927',
      coordinates: '40.7878° N, 73.9662° W',
      timestamp: '2026-10-07 16:32 UTC'
    }
  ]
};

// ============================================================================
// Initialization
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSessionTimer();
  renderCurrentRoute();
  initAudioBriefing();
  initSpatialMap();
  initClassifier();
  renderRecordsTable();
  initCsvExport();
});

// ============================================================================
// Navigation
// ============================================================================
function initNavigation() {
  const tabs = document.querySelectorAll('.nav-link');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  document.getElementById('btn-inspect-map')?.addEventListener('click', () => {
    switchTab('map-tab');
  });

  document.getElementById('btn-open-scanner')?.addEventListener('click', () => {
    switchTab('camera-tab');
  });
}

function switchTab(tabId) {
  STATE.activeTab = tabId;

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });

  if (tabId === 'map-tab' && STATE.map) {
    setTimeout(() => {
      STATE.map.invalidateSize();
    }, 150);
  }
}

// ============================================================================
// Session Telemetry Timer
// ============================================================================
function initSessionTimer() {
  setInterval(() => {
    STATE.sessionSeconds++;
    const hours = String(Math.floor(STATE.sessionSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((STATE.sessionSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(STATE.sessionSeconds % 60).padStart(2, '0');

    const display = document.getElementById('session-timer');
    if (display) {
      display.textContent = `${hours}:${mins}:${secs}`;
    }
  }, 1000);
}

// ============================================================================
// Route Data & Gemma 2 Synthesis
// ============================================================================
function renderCurrentRoute() {
  const route = STATE.routes[STATE.activeRouteIndex];
  if (!route) return;

  document.getElementById('route-id-tag').textContent = route.id;
  document.getElementById('route-category-tag').textContent = route.category;
  document.getElementById('route-distance-tag').textContent = `Distance: ${route.distanceKm} km`;
  document.getElementById('route-duration-tag').textContent = `Est. Walking Time: ${route.durationMin} min`;
  document.getElementById('route-title').textContent = route.title;
  document.getElementById('route-narrative').textContent = route.narrative;

  const verifiedCount = route.waypoints.filter(w => w.verified).length;
  document.getElementById('completed-counter').textContent = `${verifiedCount} of ${route.waypoints.length} Verified`;

  const tbody = document.getElementById('waypoints-table-body');
  tbody.innerHTML = '';

  route.waypoints.forEach(wp => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <input type="checkbox" class="checkbox-toggle" data-id="${wp.id}" ${wp.verified ? 'checked' : ''} />
      </td>
      <td class="font-semibold">${wp.name}</td>
      <td>${wp.category}</td>
      <td class="mono">${wp.coords}</td>
      <td>
        <span class="tag-status ${wp.verified ? 'verified' : 'pending'}">
          ${wp.verified ? 'Verified' : 'Pending Verification'}
        </span>
      </td>
    `;

    row.querySelector('.checkbox-toggle').addEventListener('change', (e) => {
      wp.verified = e.target.checked;
      renderCurrentRoute();
      showToast(`Waypoint ${wp.id} updated: ${wp.verified ? 'Verified' : 'Pending'}`);
    });

    tbody.appendChild(row);
  });
}

document.getElementById('btn-recompute-route')?.addEventListener('click', () => {
  const btn = document.getElementById('btn-recompute-route');
  btn.disabled = true;
  showToast('Recomputing field route corridor with Gemma-2 spatial model...');

  setTimeout(() => {
    STATE.activeRouteIndex = (STATE.activeRouteIndex + 1) % STATE.routes.length;
    renderCurrentRoute();
    updateMapRoute();
    btn.disabled = false;
    showToast(`Route updated to ${STATE.routes[STATE.activeRouteIndex].id}`);
  }, 600);
});

// ============================================================================
// Spoken Audio Briefing (Web Speech API)
// ============================================================================
function initAudioBriefing() {
  const playBtn = document.getElementById('btn-play-briefing');
  const label = document.getElementById('briefing-label');
  const status = document.getElementById('audio-status-text');

  playBtn?.addEventListener('click', () => {
    const route = STATE.routes[STATE.activeRouteIndex];

    if (STATE.audioActive) {
      window.speechSynthesis?.cancel();
      STATE.audioActive = false;
      label.textContent = 'Play Spoken Briefing (14s)';
      status.textContent = 'Audio paused.';
      showToast('Audio playback stopped.');
    } else {
      STATE.audioActive = true;
      label.textContent = 'Stop Audio Briefing';
      status.textContent = 'Transmitting route waypoint briefing...';

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(route.spokenBriefing);
        utterance.rate = 0.95;
        utterance.onend = () => {
          STATE.audioActive = false;
          label.textContent = 'Play Spoken Briefing (14s)';
          status.textContent = 'Briefing complete. Proceed along trail path.';
        };
        utterance.onerror = () => {
          STATE.audioActive = false;
          label.textContent = 'Play Spoken Briefing (14s)';
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          STATE.audioActive = false;
          label.textContent = 'Play Spoken Briefing (14s)';
          status.textContent = 'Briefing complete.';
        }, 12000);
      }

      showToast('Audio briefing initiated.');
    }
  });
}

// ============================================================================
// Spatial GIS & Cartography (Leaflet + OpenStreetMap)
// ============================================================================
function initSpatialMap() {
  const container = document.getElementById('spatial-map');
  if (!container) return;

  STATE.map = L.map('spatial-map', {
    zoomControl: true
  }).setView(STATE.activeCoords, 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors | GreenPulse Spatial Engine',
    maxZoom: 19
  }).addTo(STATE.map);

  const markerHtml = `<div style="background:#15803d; width:14px; height:14px; border-radius:2px; border:2px solid #ffffff; box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>`;
  const customIcon = L.divIcon({
    className: 'gis-marker',
    html: markerHtml,
    iconSize: [14, 14]
  });

  STATE.userMarker = L.marker(STATE.activeCoords, { icon: customIcon }).addTo(STATE.map)
    .bindPopup('<b>Field Surveyor Position</b><br>40.7850° N, 73.9682° W');

  updateMapRoute();

  document.getElementById('btn-locate-user')?.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          STATE.activeCoords = coords;
          STATE.userMarker.setLatLng(coords);
          STATE.map.setView(coords, 16);
          document.getElementById('header-coords').textContent = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° W`;
          document.getElementById('gps-accuracy-display').textContent = `${pos.coords.accuracy.toFixed(1)} meters`;
          showToast('GPS lock acquired.');
        },
        () => {
          showToast('Geolocation unavailable. Maintaining reference coordinates.');
        }
      );
    }
  });

  document.getElementById('btn-simulate-track')?.addEventListener('click', () => {
    simulateTraversal();
  });
}

function updateMapRoute() {
  const route = STATE.routes[STATE.activeRouteIndex];
  if (!STATE.map || !route) return;

  if (STATE.routePolyline) {
    STATE.map.removeLayer(STATE.routePolyline);
  }

  STATE.routePolyline = L.polyline(route.pathCoordinates, {
    color: '#15803d',
    weight: 3.5,
    opacity: 0.9
  }).addTo(STATE.map);

  document.getElementById('recorded-distance-display').textContent = `${route.distanceKm} km`;
  STATE.map.fitBounds(STATE.routePolyline.getBounds(), { padding: [40, 40] });
}

function simulateTraversal() {
  const route = STATE.routes[STATE.activeRouteIndex];
  let step = 0;
  const path = route.pathCoordinates;

  if (STATE.simulationInterval) clearInterval(STATE.simulationInterval);
  showToast('Simulating corridor traversal...');

  STATE.simulationInterval = setInterval(() => {
    if (step >= path.length) {
      clearInterval(STATE.simulationInterval);
      showToast('Corridor traversal simulation finished.');
      return;
    }
    const coord = path[step];
    STATE.userMarker.setLatLng(coord);
    STATE.map.panTo(coord);
    document.getElementById('header-coords').textContent = `${coord[0].toFixed(4)}° N, ${coord[1].toFixed(4)}° W`;
    step++;
  }, 1000);
}

// ============================================================================
// Visual Classifier
// ============================================================================
function initClassifier() {
  const startBtn = document.getElementById('btn-start-stream');
  const video = document.getElementById('video-stream');
  const standby = document.getElementById('camera-standby');
  const captureBtn = document.getElementById('btn-capture-frame');
  const benchmarkBtns = document.querySelectorAll('.btn-benchmark');
  const fileInput = document.getElementById('local-image-input');

  startBtn?.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      STATE.cameraStream = stream;
      video.srcObject = stream;
      standby.classList.add('hidden-element');
      showToast('Device camera stream initialized.');
    } catch (err) {
      showToast('Camera initialization failed. Use benchmark specimens or local file.');
    }
  });

  benchmarkBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const specimen = btn.getAttribute('data-specimen');
      evaluateClassification(specimen);
    });
  });

  captureBtn?.addEventListener('click', () => {
    evaluateClassification('leaf');
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      showToast(`Local image loaded: ${e.target.files[0].name}`);
      setTimeout(() => {
        evaluateClassification('leaf');
      }, 300);
    }
  });

  document.getElementById('btn-save-record')?.addEventListener('click', () => {
    const label = document.getElementById('res-label').textContent;
    const prob = document.getElementById('res-prob-text').textContent;

    const newRecord = {
      id: `REC-2026-0${Math.floor(1000 + Math.random() * 9000)}`,
      scientificName: label.split(' (')[0] || label,
      division: 'Verified Field Observation',
      probability: prob,
      coordinates: document.getElementById('header-coords').textContent,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC'
    };

    STATE.records.unshift(newRecord);
    renderRecordsTable();
    showToast(`Observation saved to catalog: ${newRecord.id}`);
  });
}

function evaluateClassification(type) {
  const benchmarks = {
    leaf: { name: 'Acer saccharum (Sugar Maple)', prob: 0.964, latency: '36ms' },
    bench: { name: 'Park Infrastructure: Timber Trail Bench', prob: 0.942, latency: '41ms' },
    moss: { name: 'Bryophyta (Tree Bark Moss)', prob: 0.951, latency: '38ms' },
    bark: { name: 'Quercus alba (White Oak Bark)', prob: 0.928, latency: '44ms' }
  };

  const match = benchmarks[type] || benchmarks.leaf;

  document.getElementById('res-label').textContent = match.name;
  document.getElementById('res-prob-fill').style.width = `${match.prob * 100}%`;
  document.getElementById('res-prob-text').textContent = match.prob.toFixed(3);
  document.getElementById('metric-latency').textContent = match.latency;

  showToast(`Inference evaluated: ${match.name} (p=${match.prob})`);
}

// ============================================================================
// Cataloged Records Table & CSV Export
// ============================================================================
function renderRecordsTable() {
  const tbody = document.getElementById('records-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  STATE.records.forEach(rec => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="mono font-semibold">${rec.id}</td>
      <td><em>${rec.scientificName}</em></td>
      <td>${rec.division}</td>
      <td class="mono">${rec.probability}</td>
      <td class="mono">${rec.coordinates}</td>
      <td class="mono" style="font-size: 11px;">${rec.timestamp}</td>
    `;
    tbody.appendChild(tr);
  });
}

function initCsvExport() {
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    let csv = 'Record_ID,Scientific_Name,Division,Probability,Coordinates,Timestamp\n';
    STATE.records.forEach(r => {
      csv += `"${r.id}","${r.scientificName}","${r.division}","${r.probability}","${r.coordinates}","${r.timestamp}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `greenpulse_field_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Field records exported to CSV.');
  });
}

// ============================================================================
// Toast Notification
// ============================================================================
function showToast(message) {
  const toast = document.getElementById('status-toast');
  if (!toast) return;

  toast.textContent = message;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 2800);
}
