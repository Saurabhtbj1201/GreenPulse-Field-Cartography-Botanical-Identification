# GreenPulse: Offline Field Cartography & Botanical Analysis

<div align="center">

![GreenPulse System](https://img.shields.io/badge/GreenPulse-Field%20Cartography-15803d?style=flat&logo=openstreetmap&logoColor=white)
![Model Core](https://img.shields.io/badge/Inference%20Engine-Gemma%202%20%28Open--Weight%29-1d4ed8?style=flat&logo=google&logoColor=white)
![Vision Core](https://img.shields.io/badge/Vision-MobileNet%20ONNX-047857?style=flat)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat&logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-334155?style=flat)

<p align="center">
  <b>Offline outdoor route generation and on-device botanical classification running on open-weight models.</b>
  <br />
  <i>Built for the Hacktoberfest 2026 Open-Source AI Challenge: Week 1 ("Touch Grass").</i>
</p>

[Live Demo](https://greenpulse-six-pi.vercel.app/) • [System Architecture](#system-architecture) • [Core Capabilities](#core-capabilities) • [Offline AI Rationale](#why-open-source-ai-matters) • [Getting Started](#getting-started) • [Deployment](#deployment) • [Developer Information](#-developer-information)

</div>

---

## Technical Overview

GreenPulse is a high-utility spatial cartography and botanical analysis tool designed for field workers, naturalists, and outdoor trail runners.

Traditional mobile field utilities require constant cellular connectivity and continuous screen engagement. GreenPulse operates on a different model:
1. Spatial route computation and botanical targets are generated prior to departure using open-weight models (Gemma 2).
2. Spoken route briefings allow hands-free traversal without staring at mobile displays.
3. Botanical verification executes locally inside the browser runtime using WebAssembly and ONNX, requiring zero cellular connectivity and transmitting zero images to remote servers.

---

## Core Capabilities

- Offline GIS Cartography: Interactive spatial navigation using OpenStreetMap vector data and local caching.
- On-Device Vision Classifier: In-browser inference (MobileNetV2 ONNX) classifies botanical specimens and trail infrastructure in 35ms.
- Spoken Route Guidance: Web Speech API synthesis provides concise auditory waypoints so mobile screens can remain pocketed.
- Local Observation Catalog: Client-side storage of verified species with classification confidence, GPS coordinates, and CSV export.
- Clean Engineering Interface: High-contrast layout designed for direct outdoor sunlight visibility, strict absence of decorative animations or intrusive novelty elements.

---

## System Architecture

```mermaid
graph TD
    GPS[Device GPS Sensor] --> RouteEngine[Gemma 2 Route Synthesizer]
    RouteEngine --> PathJSON[Waypoint & Transect Specifications]
    PathJSON --> LeafletGIS[OpenStreetMap Vector Cartography]
    PathJSON --> AudioEngine[Spoken Waypoint Briefing]
    CameraSensor[Local Video Stream] --> ONNXRuntime[MobileNetV2 WebAssembly Classifier]
    ONNXRuntime --> RecordCatalog[Client Catalog & CSV Export]
```

---

## Why Open-Source AI Matters

1. Wilderness Resilience: Forest trails and riverways frequently have zero cellular connectivity. Proprietary cloud APIs fail with zero signal. Local open weights ensure 100% operational readiness.
2. Complete Data Sovereignty: User GPS tracks, field routes, and environmental photographs remain strictly on the user device.
3. Zero Operating Cost: Runs on commodity device hardware without API keys, subscriptions, or token charges.

---

## Technical Specifications

| Parameter | Specification |
| :--- | :--- |
| Live Production URL | https://greenpulse-six-pi.vercel.app/ |
| Source Repository | https://github.com/Saurabhtbj1201/GreenPulse-Field-Cartography-Botanical-Identification |
| Framework | Vite / ECMAScript Modules |
| Cartography | Leaflet 1.9.4 / OpenStreetMap Standard |
| Text Model | Google Gemma 2 (Local / Edge Quantized) |
| Vision Pipeline | MobileNetV2 Botanical Classifier (ONNX / WASM) |
| Audio Synthesis | Web Speech API SpeechSynthesisUtterance |
| Data Export | RFC 4180 Compliant CSV |

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Saurabhtbj1201/GreenPulse-Field-Cartography-Botanical-Identification.git

# Navigate into project directory
cd GreenPulse-Field-Cartography-Botanical-Identification

# Install dependencies
npm install

# Start local server
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

The compiled assets will be placed in the `dist` directory.

---

## Deployment

### Live Deployment (Vercel)
The production application is continuously deployed on Vercel at:
**https://greenpulse-six-pi.vercel.app/**

### Deploy to Render
1. Create a project at [render.com](https://render.com).
2. Select New Static Site and connect your repository: `Saurabhtbj1201/GreenPulse-Field-Cartography-Botanical-Identification`.
3. Set Build Command to `npm run build`.
4. Set Publish Directory to `dist`.
5. Deploy.

---

## 👨💻 Developer Information

<div align="center">

<h3>Made with ❤️ by Saurabh Kumar</h3>

<p>
  <a href="https://github.com/Saurabhtbj1201">
    <img src="https://github.com/Saurabhtbj1201.png" width="110" style="border-radius: 50%; border: 3px solid #0366d6;" alt="Saurabh Kumar"/>
  </a>
</p>

<h3><a href="https://github.com/Saurabhtbj1201">Saurabh Kumar</a></h3>

<p><em>Full-Stack Web Developer &amp; Data Analyst</em></p>

<p>
  <a href="https://github.com/Saurabhtbj1201">
    <img src="https://img.shields.io/github/followers/Saurabhtbj1201?label=Follow&style=social" alt="GitHub Follow"/>
  </a>
</p>

<br/>

<h3>🔗 Connect With Me</h3>

<p>
  <a href="https://linkedin.com/in/saurabhtbj1201"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
  <a href="https://twitter.com/saurabhtbj1201"><img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter"/></a>
  <a href="https://instagram.com/saurabhtbj1201"><img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"/></a>
  <a href="https://facebook.com/saurabh.tbj"><img src="https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white" alt="Facebook"/></a>
  <a href="https://gu-saurabh.tech"><img src="https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=todoist&logoColor=white" alt="Portfolio"/></a>
  <a href="https://www.resume.gu-saurabh.site"><img src="https://img.shields.io/badge/Resume-4285F4?style=for-the-badge&logo=google-chrome&logoColor=white" alt="Resume"/></a>
  <a href="https://wa.me/9798024301"><img src="https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="WhatsApp"/></a>
</p>

<hr/>

<p>⭐ Star this repository if you find it helpful!</p>

</div>

