<div align="center">
  <img src="icons/icon128.png" alt="YT Hand Control Logo" width="128" />
  <h1>🖐️ YouTube Hand Control</h1>
  
  <p>Control YouTube playback with a wave of your hand, powered by <b>MediaPipe</b> and <b>Computer Vision</b>.</p>

<a href="#features">Features</a> •
<a href="#installation">Installation</a> •
<a href="#gestures">Gestures</a> •
<a href="#architecture">Architecture</a>

</div>

---

## 🌟 Overview

**YouTube Hand Control** is a next-generation Google Chrome extension that allows you to control YouTube video playback, volume, speed, and seeking entirely hands-free. Using Google's state-of-the-art **MediaPipe Hands** library running completely locally on your machine, it processes your webcam feed in real-time, matching your hand movements to playback controls.

Whether your hands are dirty from eating, covered in paint, or you simply want to feel like a Jedi, this extension brings magic to your video viewing experience.

## ✨ Features

- **Pinch-to-Volume**: Dynamically change the volume by pinching your index finger and thumb. The distance controls the volume level in real-time.
- **Midas Touch Defense**: A built-in 600ms _Dwell Time_ mechanism guarantees you don't accidentally pause or speed up the video when moving your hand naturally.
- **Zero Latency & Privacy First**: All machine learning processing (using MediaPipe WebAssembly) runs 100% locally through an _Offscreen Document_. No video feeds are sent to any server.
- **Ultra-Smooth UI Engine**: Injects a glassy, non-obtrusive dynamic overlay right onto the YouTube player to provide clear visual feedback of the gestures you make.
- **Smart Power Sleep**: Operates intelligently using Manifest V3 Service Workers to preserve battery and only spin up the camera when absolutely needed.

## 🎯 Supported Gestures

| Gesture        | Icon | Action                  | Description                                                 |
| :------------- | :--: | :---------------------- | :---------------------------------------------------------- |
| **Pinch**      |  🤏  | **Continuous Volume**   | Hold index and thumb close to adjust volume smoothly.       |
| **Open Palm**  |  ✋  | **Play / Pause**        | Hold a flat open palm to toggle video playback.             |
| **Thumbs Up**  |  👍  | **Speed Up (+0.25x)**   | Point thumb up with other fingers closed to increase speed. |
| **Peace Sign** |  ✌️  | **Mute / Unmute**       | Hold up your index and middle fingers to toggle mute.       |
| **Fist**       |  ✊  | **Seek Backward (-5s)** | Show a closed fist to rewind the video by 5 seconds.        |

## 🚀 Installation (Developer Mode)

Since this extension is in active development, you can load it directly into Chrome using Developer Mode.

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/yt-hand-control.git
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button.
5. Select the cloned `yt-hand-control` directory.
6. The extension is now installed! You can pin it to your toolbar for easy access.

## ⚙️ How It Works (Architecture)

Built on the latest **Manifest V3** standard, the extension utilizes a tripartite architecture:

- **`background.js` (Service Worker)**: Acts as the central hub, managing the camera state and ensuring the Offscreen Document stays alive with a `KEEP_ALIVE` heartbeat.
- **`offscreen.js` (Offscreen Document)**: The heavy-lifting engine. Captures the camera stream, loads the MediaPipe WebAssembly library, and runs the complex landmark math asynchronously at ~30 FPS for silky-smooth tracking.
- **`content.js` (Content Script)**: Injected directly into YouTube. Listens for validated gesture commands from the Offscreen Document and manipulates the HTML5 `<video>` target, rendering the custom glass-morphism overlay.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check [issues page](https://github.com/your-username/yt-hand-control/issues).

---

<div align="center">
  <i>"A touchless future for your multimedia."</i>
</div>
# YT-Hand-Controller
