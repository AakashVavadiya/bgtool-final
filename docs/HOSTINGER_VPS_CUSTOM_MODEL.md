# Deploying Your Own Karudi LLM on Hostinger VPS

This guide shows how to run your own open-weights model on your **Hostinger VPS** and connect it to Karudi AI without using OpenAI or Google Gemini.

---

## 1. Recommended Open Model for Karudi

For tool calling, document intelligence, and multilingual tasks (Hindi, Gujarati, English), the recommended models are:
- **`qwen2.5:7b-instruct`** (Strong multilingual understanding + structured tool calling, ~4.5GB VRAM/RAM with Q4 quantization).
- **`llama3.3:8b-instruct`** or **`mistral:7b-instruct`**.

---

## 2. Setting Up the Model Engine on Hostinger VPS

SSH into your Hostinger VPS:

```bash
ssh root@your-vps-ip
```

### Option A: Using Ollama (Easiest & Fastest, Recommended)

1. **Install Ollama**:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Allow Ollama to listen on all interfaces**:
   Edit the systemd service:
   ```bash
   sudo systemctl edit ollama.service
   ```
   Add:
   ```ini
   [Service]
   Environment="OLLAMA_HOST=0.0.0.0:11434"
   ```
   Save, exit, and reload:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart ollama
   ```

3. **Pull your model**:
   ```bash
   ollama pull qwen2.5:7b-instruct
   ```

4. **Verify the endpoint works**:
   ```bash
   curl http://localhost:11434/v1/models
   ```
   Ollama exposes an **OpenAI-compatible `/v1` endpoint** by default.

---

### Option B: Using vLLM or Docker (For High-Performance / GPU VPS)

If your Hostinger VPS has a dedicated GPU:
```bash
docker run -d --name karudi-llm \
  -p 11434:8000 \
  --ipc=host \
  vllm/vllm-openai:latest \
  --model Qwen/Qwen2.5-7B-Instruct \
  --max-model-len 8192
```

---

## 3. Connecting Karudi to your Hostinger VPS

Open your `.env` file in the Karudi project root and add:

```env
AI_PROVIDER=custom
AI_BASE_URL=http://your-vps-ip:11434/v1
AI_MODEL=qwen2.5:7b-instruct
```

If you configured basic auth or a token through an Nginx reverse proxy on your VPS, you can also set:
```env
AI_API_KEY=your_secret_vps_token
```

---

## 4. Testing the Connection

Start your Karudi development server or send a message in the chat:
```bash
npm run dev
```

Karudi will send tool definitions, document context, and user messages directly to your private Hostinger VPS instance. No requests will go to OpenAI or Google.
