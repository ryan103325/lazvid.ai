<div align="center">

# 🎬 LazVid.ai

**您的 AI 影片翻譯、摘要與閱讀助手**  
Your AI-powered assistant for video translation, summarization, and reading.

[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?style=flat-square&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🌐 繁體中文](#-繁體中文) | [🇺🇸 English](#-english)

---

![App Screenshot](https://via.placeholder.com/800x450?text=LazVid.ai+Preview)

</div>

<a id="-繁體中文"></a>

## 🌟 專案簡介 (Introduction)

**LazVid.ai** 是一個基於 **Google Gemini 2.5 Flash** 的現代化 Web 應用程式。它是為了打破語言隔閡而生，能將 YouTube/Instagram 連結或任何外語影音檔案，轉換為：
1.  **精確的逐字稿** (含時間軸)
2.  **流暢的全文文章** (Markdown 格式)
3.  **專業的新聞級摘要** (重點筆記)

---

## ✨ 核心功能 (Features)

### 1. 🛠️ 智慧下載與上傳流程
受限於瀏覽器安全規範，我們採用「先下載，後上傳」的最佳流程：
*   **智慧連結偵測**：貼上 YT/IG 連結，自動推薦下載工具。
    *   🚀 **Cobalt** (推薦)：開源、無廣告、高速。
    *   🐢 **TurboScribe** (備用)：免費且無限制。
*   **多格式支援**：MP4, MOV, MP3, M4A, WAV。

### 2. 🧠 Google Gemini AI 驅動
*   **BYOK (Bring Your Own Key)**：使用您個人的 API Key，隱私安全且用量完全可控。
*   **多模態分析**：同時讀取「視覺」與「聽覺」資訊，亦可僅處理音訊。
*   **多語翻譯**：支援 中、英、日、韓、法、德、西 等多國語言互轉。

### 3. 📚 三種智慧閱讀模式
| 模式 | 說明 | 特色 |
| :--- | :--- | :--- |
| **📝 逐字稿** | 顯示精確時間戳記 `[MM:SS]` | **點擊即播**：點擊文字自動跳轉影片時間。 |
| **📖 全文** | 將口語轉為結構化 Markdown 文章 | **按需生成**、支援 .md 下載或列印 PDF。 |
| **💡 重點筆記** | 模擬資深記者視角 (倒金字塔結構) | 包含導言、關鍵細節、背景與總結。 |

---

## 🚀 快速開始 (Quick Start)

### 安裝與啟動

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發環境
npm run dev

# 3. 建置生產版本
npm run build
```

### 操作指南

1.  **輸入 Key**：首次使用需輸入 Google Gemini API Key (僅儲存於本地)。
2.  **取得素材**：貼上連結 -> 使用推薦工具下載 (長影片建議載 **MP3**)。
3.  **上傳**：將檔案拖曳至網頁。
4.  **翻譯與生成**：選擇語言後點擊「開始翻譯」，並可切換分頁生成全文或摘要。

---

## ⚠️ 限制與小撇步

> [!TIP]
> **長影片 (>10分鐘) 強烈建議下載為 MP3 音訊檔！**
> 這樣可以大幅減少檔案大小 (影片通常很大)，加快上傳與處理速度，並避免瀏覽器記憶體不足。

*   **檔案限制**：單檔建議 < **60MB**。
*   **瀏覽器**：建議使用 Chrome, Edge 或 Safari。

---

<br>

<a id="-english"></a>

## 🇺🇸 English Introduction

**LazVid.ai** is a modern web application powered by **Google Gemini 2.5 Flash**, designed to break down language barriers. It converts YouTube/Instagram links or local media files into:
1.  **Accurate Transcripts** (with timestamps)
2.  **Fluent Full-Text Articles**
3.  **Professional Summaries**

---

## ✨ Key Features

### 1. Smart Workflow
Due to browser CORS restrictions, we use a "Download then Upload" workflow:
*   **Link Detection**: Auto-recommends tools like **Cobalt** (Recommended) or **TurboScribe**.
*   **Format Support**: MP4, MOV, MP3, M4A, WAV.

### 2. Powered by Gemini AI
*   **BYOK**: Use your own API Key for privacy.
*   **Multimodal**: Analyzes both video and audio.
*   **Multi-language**: Translates between English, Chinese, Japanese, Korean, and more.

### 3. Intelligent Reading Modes
| Mode | Description | Feature |
| :--- | :--- | :--- |
| **📝 Transcript** | Precise timestamps `[MM:SS]` | **Interactive**: Click text to seek video. |
| **📖 Full Text** | Structured Markdown article | **Export**: Download .md or PDF. |
| **💡 Summary** | Journalist-style summary | Inverted pyramid structure with key details. |

---

## 🚀 Tech Stack

*   **Framework**: React 19 + Vite
*   **Styling**: Tailwind CSS
*   **AI**: Google GenAI SDK (`@google/genai`)
*   **Icons**: Lucide React

## 📄 License

MIT License