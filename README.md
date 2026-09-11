# NEC Box Fill Calculator

A professional, fully compliant **National Electrical Code (NEC) Article 314.16** Box Fill Calculator built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

Designed for electricians, electrical inspectors, engineers, contractors, and students to quickly verify enclosure volume capacities, conductor free-space requirements, device strap allowances, and hardware fill rules on job sites.

**Live Demo:** [https://epicsereno.github.io/nec-box-fill-calculator](https://epicsereno.github.io/nec-box-fill-calculator)

---

## ⚡ Features

### 1. Complete NEC Article 314.16 Calculation Engine
- **Insulated Conductors (NEC 314.16(B)(1))**: Volume allowance calculation for 18 AWG through 4/0 AWG conductors per **NEC Table 314.16(B)**. Supports pigtail exemption rules (0 volume allowance for conductors originating and terminating inside the box).
- **Internal Cable Clamps (NEC 314.16(B)(2))**: Adds 1 volume allowance based on the largest conductor present in the box.
- **Support Fittings / Fixture Studs (NEC 314.16(B)(3))**: Adds 1 volume allowance for fixture studs and hickeys based on the largest conductor in the box.
- **Yokes & Strap Devices (NEC 314.16(B)(4))**: Double volume allowance per gang width based on the largest conductor connected to that device (supports duplex receptacles, toggle switches, GFCI outlets, dimmers, smart switches, and multi-gang yokes).
- **Equipment Grounding Conductors (NEC 314.16(B)(5))**: Full implementation of the **NEC 2020 / 2023 rule update**:
  - 1 to 4 equipment grounding conductors (EGCs) count as **1 single volume allowance** of the largest EGC size.
  - Each additional EGC beyond 4 adds **1/4 (0.25) volume allowance** of the largest EGC size.

### 2. Standard Box Database & Custom Sizing
- **NEC Table 314.16(A) Standard Box Database**:
  - Round & Octagonal Ceiling Boxes (4" x 1-1/4", 4" x 1-1/2", 4" x 2-1/8")
  - 4-Inch Square Boxes (4" x 1-1/4", 4" x 1-1/2" 1900, 4" x 2-1/8" Deep)
  - 4-11/16 Inch Commercial Square Boxes (4-11/16" x 1-1/2", 4-11/16" x 2-1/8")
  - Single-Gang Device Boxes (3" x 2" x 2", 2-1/4", 2-1/2", 2-3/4", 3-1/2")
  - Handy & FS Surface Mount Utility Boxes (4" x 2-1/8")
  - Nonmetallic Plastic Outlet Boxes (1-Gang 18/20.3/22.5 cu in, 2-Gang 34/42 cu in, 3-Gang, 4-Gang)
- **Extension & Mud Ring Volumes**: Add plaster rings (1/4", 1/2", 5/8", 3/4", 2-Gang) or extension rings to calculate total combined enclosure capacity.
- **Custom Box Dimensions**: Calculate custom volume by entering Width x Height x Depth in inches or direct cubic volume.

### 3. Interactive Visualization & Inspection Tools
- **2D Schematic Box Diagram**: Real-time interactive schematic showing conductor layout, wire gauges, ground wires, internal clamps, fixture studs, and mounted devices.
- **Animated Fill Gauge**: Color-coded progress ring and capacity bar showing headroom or overfill warnings (Green `<80%`, Amber `80-100%`, Red `>100%`).
- **Imperial & Metric Toggle**: Instant conversion between Cubic Inches (`cu in`) & Cubic Centimeters (`cm³`).
- **Preset Wiring Templates**: One-click scenario loading for:
  - Bedroom 15A Receptacle Pass-Through (14/2 Romex)
  - Kitchen 20A GFCI Circuit (12/2 Feed & Load)
  - 3-Way Switch Box (14/2 + 14/3 Cable Feed)
  - Commercial 4" Square Splicing Box (THHN + Mud Ring)
  - Ceiling Fan / Luminaire Junction Box
- **Searchable NEC Code Library**: Built-in code reference browser for NEC 314.16 sections, Table 314.16(B) free space requirements, and an electrical inspector checklist.
- **Official Inspection Certificate Export**: Generate and print an official Jobsite Electrical Inspection Box Fill Compliance Certificate with project details, itemized volume breakdown table, and signature line.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 (Hooks, Context, Functional Components)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` styling architecture)
- **Build Tool**: Vite 8
- **Language**: TypeScript 6
- **Icons**: Lucide React
- **Animations**: Framer Motion

---

## 🚀 Getting Started

### Prerequisites

- Node.js (`>= 18.0.0`)
- npm (`>= 9.0.0`)

### Installation

```bash
# Clone repository
git clone https://github.com/epicsereno/nec-box-fill-calculator.git

# Navigate into project folder
cd nec-box-fill-calculator

# Install dependencies
npm install --legacy-peer-deps
```

### Development Server

Start local dev server with HMR:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build Production Bundle

Build TypeScript and compile Vite assets for production:

```bash
npm run build
```

The compiled output will be generated in the `dist/` directory.

### Preview Build

Preview the production build locally:

```bash
npm run preview
```

---

## 📚 NEC Article 314.16 Reference Table

Free space required inside box per conductor size (**NEC Table 314.16(B)**):

| Conductor Size (AWG) | Free Space (Cubic Inches) | Free Space (Cubic Centimeters) |
| :--- | :---: | :---: |
| **18 AWG** | 1.50 cu in | 24.6 cm³ |
| **16 AWG** | 1.75 cu in | 28.7 cm³ |
| **14 AWG** | 2.00 cu in | 32.8 cm³ |
| **12 AWG** | 2.25 cu in | 36.9 cm³ |
| **10 AWG** | 2.50 cu in | 41.0 cm³ |
| **8 AWG**  | 3.00 cu in | 49.2 cm³ |
| **6 AWG**  | 5.00 cu in | 81.9 cm³ |
| **4 AWG**  | 6.50 cu in | 106.5 cm³ |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Disclaimer: This tool is intended for reference and calculation assistance under National Electrical Code (NEC) standards. Always verify electrical installations with local authority having jurisdiction (AHJ) and latest NEC edition.*