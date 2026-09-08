import { useState, useEffect, useCallback, useRef } from 'react';
import { geminiLiveService } from '../services/geminiLiveService';
import { audioService } from '../services/audioSynthesisService';
import { islandTelemetryService } from '../services/islandTelemetryService';
import type { CameraMode } from '@zentry/shared';

export function useGeminiLive(currentCameraMode: CameraMode, captureFrameFn: () => string) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [latestText, setLatestText] = useState('');
  const [amplitude, setAmplitude] = useState(0.05);
  const [waveform, setWaveform] = useState<number[]>([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);

  const animFrameRef = useRef<number | null>(null);

  const toggleLiveSession = useCallback(async () => {
    if (isConnected) {
      geminiLiveService.disconnect();
      setIsConnected(false);
      setIsSpeaking(false);
      setLatestText('');
    } else {
      await geminiLiveService.connect((text, speaking) => {
        setLatestText(text);
        setIsSpeaking(speaking);
      });
      setIsConnected(true);
      geminiLiveService.startFrameStreaming(captureFrameFn);

      // Telemetry log for session activation
      islandTelemetryService.logEvent({
        cameraMode: currentCameraMode,
        aiPrompt: 'Iniciada sesión continua Gemini 2.0 Flash Live',
        aiResponse: 'Sesión activa de voz y visión multimodal',
      });
    }
  }, [isConnected, currentCameraMode, captureFrameFn]);

  const sendQuery = useCallback(async (prompt: string) => {
    const frame = captureFrameFn();
    const reply = await geminiLiveService.sendUserPrompt(prompt, frame);

    // Telemetry log
    islandTelemetryService.logEvent({
      cameraMode: currentCameraMode,
      aiPrompt: prompt,
      aiResponse: reply,
    });
  }, [currentCameraMode, captureFrameFn]);

  const executeAgentic = useCallback(async (
    prompt: string,
    options?: {
      currentTheme?: 'light' | 'dark';
      onThemeToggle?: () => void;
      onCircadianHighlight?: () => void;
    }
  ) => {
    const result = await geminiLiveService.executeAgenticCommand(prompt, options);

    // Telemetry log for agentic execution
    await islandTelemetryService.logAgenticAction(
      'agentic_copilot',
      prompt,
      result.reply,
      {
        action: result.action,
        themeApplied: result.themeApplied,
        artChallenge: result.artChallenge,
      }
    );

    return result;
  }, []);

  // Real-time audio amplitude polling loop for the VoiceOrb
  useEffect(() => {
    const updateAudio = () => {
      setAmplitude(audioService.getAudioAmplitude());
      setWaveform(audioService.getWaveformBins());
      animFrameRef.current = requestAnimationFrame(updateAudio);
    };

    animFrameRef.current = requestAnimationFrame(updateAudio);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      geminiLiveService.disconnect();
    };
  }, []);

  return {
    isConnected,
    isSpeaking,
    latestText,
    amplitude,
    waveform,
    toggleLiveSession,
    sendQuery,
    executeAgentic,
  };
}
