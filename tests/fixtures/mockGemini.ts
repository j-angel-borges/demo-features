/**
 * Zentry Commercial Demo Suite - Sub-800ms Gemini 2.5 Flash Multimodal Mock
 * Emulates Vertex AI / Gemini 2.5 Flash Live bidirectional streaming session
 * with Spanish conversational voice synthesis and visual corner tools.
 */

export interface GeminiSessionConfig {
  model: 'gemini-2.5-flash';
  thinkingBudget: 0; // Low-latency requirement: zero thinking mode
  systemInstruction?: string;
  generationConfig?: {
    responseModalities?: ('TEXT' | 'AUDIO')[];
    speechConfig?: {
      voiceConfig?: {
        prebuiltVoiceConfig?: {
          voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
        };
      };
    };
  };
}

export interface TouchExplainPayload {
  touchCoordinates: { x: number; y: number };
  frameBase64: string;
  contextHint?: string;
}

export interface LandscapeEnhancePayload {
  frameBase64: string;
  style: 'enhanced' | 'comic' | 'pixel_art' | 'videogame' | 'spatial';
}

export interface SceneRedesignPayload {
  frameBase64: string;
  userPreference?: string;
}

export interface SceneRedesignOption {
  title: string;
  description: string;
  style: string;
  previewUrl: string;
}

export class MockGeminiLiveSession {
  public config: GeminiSessionConfig;
  public isConnected: boolean = false;
  public simulatedLatencyMs: number = 45; // Well within <800ms threshold
  public frameCountReceived: number = 0;
  public audioChunksDispatched: number = 0;
  public textChunksDispatched: number = 0;
  public shouldFailWithQuotaError: boolean = false;
  public shouldFailWithNetworkDrop: boolean = false;

  private listeners: Map<string, Set<Function>> = new Map();

  constructor(config: GeminiSessionConfig = { model: 'gemini-2.5-flash', thinkingBudget: 0 }) {
    if (config.thinkingBudget !== 0) {
      throw new Error(`Gemini 2.5 Flash Live requires thinkingBudget: 0 for sub-800ms low latency, got ${config.thinkingBudget}`);
    }
    this.config = config;
  }

  on(event: 'content' | 'audio' | 'turnComplete' | 'error' | 'close', callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data?: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach(cb => cb(data));
    }
  }

  async connect(): Promise<void> {
    if (this.shouldFailWithNetworkDrop) {
      const err = new Error('WebSocket connection to Gemini Live endpoint failed');
      this.emit('error', err);
      throw err;
    }
    await this.delay(this.simulatedLatencyMs);
    this.isConnected = true;
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.emit('close');
  }

  async sendRealtimeInput(chunks: Array<{ mimeType: string; data: string }>): Promise<void> {
    if (!this.isConnected) throw new Error('Cannot send realtime input: session is disconnected');
    if (this.shouldFailWithQuotaError) {
      const err = new Error('ResourceExhausted: 429 Quota exceeded on vertexai.googleapis.com');
      this.emit('error', err);
      throw err;
    }

    this.frameCountReceived += chunks.filter(c => c.mimeType.startsWith('image/')).length;
  }

  async sendTextMessage(prompt: string): Promise<string> {
    if (!this.isConnected) throw new Error('Cannot send message: session is disconnected');
    if (this.shouldFailWithQuotaError) {
      const err = new Error('ResourceExhausted: 429 Quota exceeded on vertexai.googleapis.com');
      this.emit('error', err);
      throw err;
    }

    await this.delay(this.simulatedLatencyMs);

    let spanishResponse = `Entendido. Veo tu entorno en tiempo real y sigo tus instrucciones en Zentry.`;

    if (prompt.toLowerCase().includes('hola') || prompt.toLowerCase().includes('quién eres')) {
      spanishResponse = `¡Hola! Soy tu asistente de visión Zentry impulsado por Gemini 2.5 Flash en GCP quarz-group.`;
    } else if (prompt.toLowerCase().includes('describe') || prompt.toLowerCase().includes('observas') || prompt.toLowerCase().includes('ves')) {
      spanishResponse = `Observo el espacio con iluminación clara y varios elementos visuales activos en la escena Zentry.`;
    }

    this.textChunksDispatched++;
    this.emit('content', { text: spanishResponse, isFinal: true });

    // Emit synthesized Spanish audio chunk simulation
    this.audioChunksDispatched++;
    const mockAudioPcm = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00]);
    this.emit('audio', mockAudioPcm);
    this.emit('turnComplete');

    return spanishResponse;
  }

  // F07: Landscape Enhancer / Stylizer
  async generateLandscapeStylization(payload: LandscapeEnhancePayload): Promise<{
    styleApplied: string;
    description: string;
    enhancedImageBase64: string;
  }> {
    if (this.shouldFailWithQuotaError) {
      throw new Error('ResourceExhausted: 429 Quota exceeded');
    }
    await this.delay(this.simulatedLatencyMs);

    const style = payload.style || 'enhanced';
    const styleDescriptions: Record<string, string> = {
      enhanced: 'Escena optimizada con balance dinámico de luminancia y reducción de ruido.',
      comic: 'Estilización en cómic con entintado de bordes y trama de medios tonos.',
      pixel_art: 'Transformación pixel art retro 16-bit con paleta cromática Zentry.',
      videogame: 'Renderizado 3D estilo motor de videojuego de última generación.',
      spatial: 'Interpretación espacial con mapeo de profundidad y geometría volumétrica.',
    };

    return {
      styleApplied: style,
      description: styleDescriptions[style] || `Transformación con estilo ${style}.`,
      enhancedImageBase64: payload.frameBase64,
    };
  }

  // F08: Touch-to-Explain Socratic Point
  async explainTouchPoint(payload: TouchExplainPayload): Promise<{
    coordinates: { x: number; y: number };
    identifiedObject: string;
    socraticExplanation: string;
    confidence: number;
  }> {
    if (this.shouldFailWithQuotaError) {
      throw new Error('ResourceExhausted: 429 Quota exceeded');
    }
    await this.delay(this.simulatedLatencyMs);

    const { x, y } = payload.touchCoordinates;
    let objectName = 'Elemento de la escena';
    let explanation = `En las coordenadas (${(x * 100).toFixed(0)}%, ${(y * 100).toFixed(0)}%), se detecta una superficie interactiva. ¿Sabías que su textura refleja la luz según el ángulo incidente?`;

    if (x < 0.3) {
      objectName = 'Panel de control izquierdo';
      explanation = 'Has seleccionado el Panel de control lateral. Aquí se concentran los módulos de ajuste óptico y navegación.';
    } else if (x > 0.7) {
      objectName = 'Acceso a herramientas auxiliares';
      explanation = 'Este punto corresponde al área de herramientas creativas y deliberación espacial.';
    } else if (y < 0.3) {
      objectName = 'Área superior de captura';
      explanation = 'Has pulsado cerca de la cámara principal. Este sensor captura hasta 60 cuadros por segundo.';
    }

    return {
      coordinates: { x, y },
      identifiedObject: objectName,
      socraticExplanation: explanation,
      confidence: 0.96,
    };
  }

  // F09: Scene Redesign Deliberator
  async deliberateSceneRedesign(payload: SceneRedesignPayload): Promise<{
    sceneAnalysis: string;
    options: SceneRedesignOption[];
  }> {
    if (this.shouldFailWithQuotaError) {
      throw new Error('ResourceExhausted: 429 Quota exceeded');
    }
    await this.delay(this.simulatedLatencyMs);

    return {
      sceneAnalysis: 'La escena presenta una distribución arquitectónica estándar con potencial de transformación espacial.',
      options: [
        {
          title: 'Rediseño Arquitectónico Minimalista',
          description: 'Reorganización geométrica con materiales nobles, iluminación difusa Zentry y líneas limpias.',
          style: 'architectural_clean',
          previewUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiM1MzNCODciLz48L3N2Zz4=',
        },
        {
          title: 'Ambiente Futurista 3D Cyber-Zentry',
          description: 'Atmósfera inmersiva con reflejos Liquid Glass púrpura (#533B87), acentos menta (#C2F4E7) y prismas holográficos.',
          style: 'cyber_3d_futuristic',
          previewUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNDMkY0RTciLz48L3N2Zz4=',
        },
      ],
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function createGeminiLiveSession(config?: Partial<GeminiSessionConfig>): MockGeminiLiveSession {
  return new MockGeminiLiveSession({
    model: 'gemini-2.5-flash',
    thinkingBudget: 0,
    ...config,
  });
}
