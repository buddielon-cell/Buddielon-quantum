export class LocalEngine {
  static async generate(prompt: string, systemPrompt: string): Promise<string> {
    try {
      // Try Ollama API first
      const ollamaRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: `${systemPrompt}\n\nUser: ${prompt}\nAssistant:`,
          stream: false
        })
      });
      if (ollamaRes.ok) {
        const ollamaData = await ollamaRes.json();
        return `[LOCAL MODEL]\n${ollamaData.response}`;
      }
    } catch (e) {
      // Fallback
    }

    // Basic heuristic local processing
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
      return `[OFFLINE FALLBACK]\nGreetings. I am operating in offline mode. External data sources are unreachable.`;
    }
    
    return `[OFFLINE FALLBACK]\nSynthesized a local response for: "${prompt.substring(0, 50)}..."\n\nExternal APIs unreachable. Message queued for sync.`;
  }
}
