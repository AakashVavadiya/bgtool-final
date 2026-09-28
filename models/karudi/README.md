# Karudi Local Model Weights

This directory hosts the local GGUF model weights for Karudi AI.
No external API keys or remote cloud endpoints are used.

## Model Details
- **File**: `karudi-instruct-q4_k_m.gguf`
- **Architecture**: Qwen 2.5 1.5B Instruct (Q4_K_M Quantized)
- **Supported Languages**: English, Gujarati, Hindi, Marathi, Bengali, Tamil, Telugu, Hinglish, Gujlish.
- **Tools**: Sub-pixel Background Removal (Ganga), Transcoding/Resize/Compression (Brahmaputra), OCR & PDF Intelligence (Narmada), PDF Security (Saraswati).

## Automatic Setup
To download or refresh the local model weights:
```bash
python training/download_model.py
```
