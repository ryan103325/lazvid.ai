
# 🎬 LazVid.ai

這是一個基於 **Google Gemini 2.5 Flash** 模型的現代化 Web 應用程式，專為打破語言隔閡而設計。
它能協助您將 YouTube、Instagram 連結或任何外語影片/音訊檔案，轉換為準確的逐字稿，並進一步生成流暢的全文文章與專業重點筆記。

![App Screenshot](https://via.placeholder.com/800x450?text=LazVid.ai+Preview)

## ✨ 核心功能

### 1. 🛠️ 智慧下載與上傳流程
受限於瀏覽器安全性 (CORS)，本應用程式採用「先下載後上傳」的最佳實務流程：
- **智慧連結偵測**：貼上 YouTube、Instagram 或 Facebook 連結，自動推薦合適的下載工具。
  - **Cobalt** (首選推薦)：開源、無廣告、介面乾淨且速度快。
  - **TurboScribe** (備用工具)：免費且無限制，但請注意**有版權的影片可能無法下載**。
- **支援格式**：下載後，支援拖曳上傳 **MP4, MOV, MP3, M4A, WAV** 等格式。

### 2. 🧠 Google Gemini AI 驅動
- **BYOK (Bring Your Own Key)**：您可以使用自己的 API Key，保護隱私並擁有完整的用量控制權。
- **核心模型**：Google Gemini 2.5 Flash。
- **多模態處理**：可同時分析影片畫面與音訊 (Video)，或專注於語音內容 (Audio)。
- **多語言翻譯**：
  - 支援將任何語言的內容翻譯為：
  - 繁體中文 (台灣)、英文、簡體中文、日文、韓文、西班牙文、法文、德文。

### 3. 📚 三種智慧閱讀模式
1. **📝 逐字稿 (Transcript)**
   - 顯示精確的時間戳記 `[MM:SS]`。
   - **點擊即播**：點擊任何一句字幕，播放器會自動跳轉至該時間點。
2. **📖 全文 (Full Text)**
   - 將口語化的內容轉換為結構嚴謹的 Markdown 文章。
   - **按需生成**：切換至分頁後，點擊「立即生成」即可開始轉換。
   - **下載收藏**：支援下載為 **.md** 檔或直接列印/儲存為 **PDF**。
3. **💡 重點筆記 (Summary)**
   - **記者視角**：AI 化身路透社/美聯社資深記者為您分析內容。
   - **結構化分析**：包含導言 (Lead)、關鍵細節條列、背景脈絡與總結。
   - 同樣支援 **.md** 與 **PDF** 匯出功能。

### 4. ⚙️ 專業播放器與工具
- **雙語介面**：支援繁體中文與英文介面切換 (UI Language)。
- **字幕匯出**：支援匯出 `.SRT` 或 `.VTT` 字幕檔。
- **變速播放**：提供 0.5x 至 2.0x 的播放速度控制。
- **響應式設計**：完美支援桌機與手機介面 (App-like experience)。

## 🛠️ 技術堆疊

本專案採用現代前端架構，使用 Vite 進行建置與開發。

- **Frontend Library**: React 19
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS
- **AI SDK**: Google GenAI SDK (`@google/genai`)
- **Icons**: Lucide React
- **Language**: TypeScript

## 🚀 如何使用

### 安裝與啟動

1.  **安裝依賴**：
    ```bash
    npm install
    ```

2.  **啟動開發伺服器**：
    ```bash
    npm run dev
    ```

3.  **建置生產版本**：
    ```bash
    npm run build
    ```

### 操作步驟
1.  **輸入 API Key**：首次進入時，請輸入您的 Google Gemini API Key (可於 Google AI Studio 取得)。Key 僅儲存於您的瀏覽器中。
2.  **取得素材**：
    *   **連結**：貼上 YouTube/IG 連結 -> 點擊推薦工具 (如 Cobalt) -> 下載檔案 (長影片建議下載 **MP3**)。
    *   **檔案**：若已有檔案，直接跳至步驟 3。
3.  **上傳檔案**：將檔案拖曳至網頁上傳區。
4.  **選擇語言**：選擇翻譯的目標語言 (預設為繁體中文)。
5.  **開始翻譯**：點擊「開始翻譯」，AI 將進行初步轉錄。
6.  **生成內容**：切換至「全文」或「重點筆記」分頁，點擊生成按鈕以獲得深度內容。
7.  **匯出**：可將內容匯出為字幕檔、Markdown 或 PDF。

## ⚠️ 限制與小撇步

-   **檔案大小限制**：受限於瀏覽器記憶體與 API 限制，單一檔案請保持在 **60MB** 以下。
-   **長影片處理**：若影片超過 10 分鐘，**強烈建議**先下載為 **MP3 音訊檔**再上傳。這能大幅縮減檔案大小，加快上傳與處理速度，並提高成功率。
-   **瀏覽器建議**：建議使用最新版的 Chrome, Edge 或 Safari 以獲得最佳體驗。

## 📄 授權

MIT License

---

# 🎬 LazVid.ai

A modern web application powered by the **Google Gemini 2.5 Flash** model, designed to break down language barriers.
It automatically converts YouTube/Instagram links or local media files into accurate transcripts, fluent full-text articles, and professional summaries.

![App Screenshot](https://via.placeholder.com/800x450?text=LazVid.ai+Preview)

## ✨ Key Features

### 1. 🛠️ Smart Workflow
Due to browser security restrictions (CORS), this app uses a "Download then Upload" best practice workflow:
- **Smart Link Detection**: Paste a YouTube, Instagram, or Facebook link to get tool recommendations.
  - **Cobalt** (Recommended): Open-source, ad-free, and fast.
  - **TurboScribe** (Backup): Free & unlimited (Note: Copyrighted videos may not be downloadable).
- **Format Support**: Supports drag-and-drop for **MP4, MOV, MP3, M4A, and WAV** files.

### 2. 🧠 Powered by Gemini AI
- **BYOK (Bring Your Own Key)**: Use your own API Key for privacy and full control over usage quotas.
- **Core Model**: Google Gemini 2.5 Flash.
- **Multimodal**: Analyzes both visual and audio data (Video) or strictly audio tracks.
- **Multi-language**:
  - Translates source content into:
  - English, Traditional Chinese, Simplified Chinese, Japanese, Korean, Spanish, French, German.

### 3. 📚 Intelligent Reading Modes
1. **📝 Transcript**
   - Precise timestamps `[MM:SS]`.
   - **Interactive Playback**: Click any line to seek the player to that exact moment.
2. **📖 Full Text**
   - Converts conversational speech into structured Markdown articles.
   - **Generate on Demand**: Click "Generate Now" to process the text.
   - **Export Options**: Download as **.md** or Print/Save as **PDF**.
3. **💡 Summary**
   - **Journalist Style**: AI acts as a senior reporter (Inverted Pyramid structure).
   - Generates a Lead paragraph, Key Details bullet points, Context, and Conclusion.
   - Supports **.md** and **PDF** exports.

### 4. ⚙️ Pro Tools
- **Bilingual UI**: Switch between English and Traditional Chinese interface.
- **Subtitle Export**: Download `.SRT` or `.VTT` files.
- **Playback Speed**: Adjustable speed from 0.5x to 2.0x.
- **Responsive**: Optimized for both mobile and desktop (App-like experience).

## 🛠️ Tech Stack

Built with a modern stack using Vite, React, and Tailwind CSS.

- **Frontend Library**: React 19
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS
- **AI SDK**: Google GenAI SDK (`@google/genai`)
- **Icons**: Lucide React
- **Language**: TypeScript

## 🚀 How to Use

### Installation & Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```

3.  **Build for Production**:
    ```bash
    npm run build
    ```

### Workflow
1.  **Enter API Key**: On first visit, enter your Google Gemini API Key (available from Google AI Studio). The key is stored locally in your browser.
2.  **Get Media**:
    *   **Link**: Paste YT/IG link -> Click a tool (e.g., Cobalt) -> Download file (MP3 recommended for long content).
    *   **File**: If you have a file, skip to step 3.
3.  **Upload**: Drag and drop the file into the upload area.
4.  **Language**: Select your target language.
5.  **Translate**: Click "Translate" to generate the initial transcript.
6.  **Generate**: Switch to "Full Text" or "Summary" tabs and click "Generate Now" for deeper insights.
7.  **Export**: Save your content as Subtitles, Markdown, or PDF.

## ⚠️ Limits & Tips

-   **File Size**: Keep files under **60MB** due to browser/API limits.
-   **Long Content**: For content over 10 minutes, downloading as **MP3 Audio** is **highly recommended**. It saves space and processes much faster.
-   **Browser**: Latest Chrome, Edge, or Safari recommended.

## 📄 License

MIT License
