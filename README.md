# VSM-GRU ASIC Showcase Website (Team 18 · powerhouse)

Single-page, presentation-grade interactive website for the **RNN-Based Voice Stability Monitor (RTL to GDSII on a 0.18 µm library)**.
Developed for **VLSI Hackathon 2026** (Sudarshana Semiconductors, Problem PS-01).

- **Team 18:** Magesh (24BVD1048) · R Naga Arjun (24BVD1102)
- **Repository:** [https://github.com/RKNAGA18/vsm-gru-asic](https://github.com/RKNAGA18/vsm-gru-asic)

---

## 1. Quick Start (Development)

```bash
# Navigate to project directory
cd vsm-gru-showcase

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 2. Production Build & Local Preview

```bash
# Build production bundle to dist/
npm run build

# Preview build locally
npm run preview
```

---

## 3. GitHub Pages Deployment

The application is engineered with `base: './'` in `vite.config.ts`, hash-only navigation (`#step-id`), and relative asset lookups (`import.meta.env.BASE_URL`). It works out of the box on custom domains and sub-path domains like `https://RKNAGA18.github.io/vsm-gru-asic/`.

### Automated Deployment via GitHub Actions
A pre-configured GitHub Actions workflow is included at `.github/workflows/deploy.yml`.

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy VSM-GRU showcase"
   git push origin main
   ```
2. In your GitHub repository:
   - Navigate to **Settings** → **Pages**
   - Under **Build and deployment** > **Source**, select **GitHub Actions**
3. The workflow will build and publish automatically on every push to `main`.

---

## 4. Alternative Deployment: Netlify & Vercel

### Netlify
1. Connect your repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy site.

### Vercel
1. Import repository on Vercel.
2. Framework Preset: `Vite`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Deploy.

---

## 5. Adding Presentation File (`Team18_Presentation.pptx`)

The showcase includes a designated download button for the slide deck. Place your presentation file here:

```
vsm-gru-showcase/public/downloads/Team18_Presentation.pptx
```

- When the file exists, clicking **Download Presentation** downloads it directly.
- If the file is not yet dropped in, the button stays visible and gracefully displays an alert toast informing the user to place the file into `public/downloads/`.

---

## 6. Features & Highlights

- **12 Interactive Flow Steps:**
  1. Problem & Spec (PS-01) with live DSP voice stability simulator & honest compliance scorecard
  2. Algorithm & Golden Model with KaTeX-rendered fixed-point equations & pipeline map
  3. Interactive Architecture SVG Diagram with wire highlighting & block drawer
  4. Animated Cycle Sequencer & Execution Timeline (0 → 1573 cycles)
  5. RTL & Register Map with click-to-copy hex offsets
  6. RTL Verification with Cadence SimVision waveform lightbox & error bar charts
  7. Genus Synthesis with leaf cell breakdown and flop area donut chart
  8. Innovus Place & Route with 6 sub-tabs (Import, Floorplan, Power, Clock tree, Route, Antenna)
  9. Tempus Signoff with slack badge bars & SAIF power breakdown
  10. Gate-Level Simulation & SAIF-to-power workflow
  11. Limitations & Roadmap
  12. Get the Files & QR Code
- **Keyboard Shortcuts:**
  - `←` / `→` or `J` / `K`: Previous / next step
  - `F`: Toggle fullscreen
  - `P`: Presenter mode (hides metrics bar for projector view)
  - `Esc`: Close image lightbox