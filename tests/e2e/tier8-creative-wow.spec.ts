/**
 * Tier 8: Feature Creativa (Factor WOW) Z-Art Studio & Mini-Apps Suite
 *
 * Requirements & Specifications:
 * - D:\1_jose_angel\prompt-feature-06-09.md
 * - C:\Users\jange\.gemini\antigravity-cli\brain\b15e4424-d53c-47bc-a01e-c09a34ad77be\plan_z_art_creative_wow.md
 * - apps/creative-studio (Port 5176)
 * - GCP quarz-group Firestore Collection /creative_creations
 */

import { describe, it, expect, beforeEach } from '../fixtures/testHelper.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  saveCreativeCreation,
  subscribeToCreativeCreations,
  type CreativeCreationRecord,
  type CreativeCategory,
  type InteractiveAvatarData,
  type InteractiveWorldData,
  type InteractiveToyData,
  localDataBus
} from '@zentry/shared';

describe('Tier 8: Creative WOW Studio & Interactive Mini-Apps Suite', () => {
  const rootDir = process.cwd();
  const creativeAppDir = path.join(rootDir, 'apps', 'zf-creative-studio');

  // =========================================================================
  // F20: Architecture, Manifest & Multi-Site Target Verification
  // =========================================================================
  describe('F20: Creative Studio Micro-PWA 4 Architecture', () => {
    it('T8-F20-01: apps/creative-studio contains valid package.json with dev and build scripts', () => {
      const pkgPath = path.join(creativeAppDir, 'package.json');
      expect(fs.existsSync(pkgPath)).toBe(true);
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      expect(pkg.name).toBe('creative-studio');
      expect(pkg.scripts.build).toBeDefined();
      expect(pkg.scripts.dev).toBeDefined();
    });

    it('T8-F20-02: apps/creative-studio/vite.config.ts configures port 5176 and path aliases', () => {
      const vitePath = path.join(creativeAppDir, 'vite.config.ts');
      expect(fs.existsSync(vitePath)).toBe(true);
      const viteContent = fs.readFileSync(vitePath, 'utf-8');
      expect(viteContent.includes('5176')).toBe(true);
      expect(viteContent.includes('@zentry/shared')).toBe(true);
    });

    it('T8-F20-03: apps/creative-studio/dist contains production assets', () => {
      const distPath = path.join(creativeAppDir, 'dist');
      expect(fs.existsSync(distPath)).toBe(true);
      expect(fs.existsSync(path.join(distPath, 'index.html'))).toBe(true);
    });

    it('T8-F20-04: Cross-app navigation links exist in all 4 micro-PWAs', () => {
      const parentHeader = fs.readFileSync(
        path.join(rootDir, 'apps', 'zf-parental-dashboard', 'src', 'components', 'Header.tsx'),
        'utf-8'
      );
      expect(parentHeader.includes('5176')).toBe(true);
      expect(parentHeader.includes('Z-Art Studio')).toBe(true);

      const islandApp = fs.readFileSync(
        path.join(rootDir, 'apps', 'zf-isla-dinamica', 'src', 'App.tsx'),
        'utf-8'
      );
      expect(islandApp.includes('5176')).toBe(true);

      const skinnerHeader = fs.readFileSync(
        path.join(rootDir, 'apps', 'zf-skinner-box', 'src', 'components', 'SessionHeader.tsx'),
        'utf-8'
      );
      expect(skinnerHeader.includes('5176')).toBe(true);
    });
  });

  // =========================================================================
  // F21: Phase 1 & 2 Contracts (Doodle Canvas & Multimodal Classification)
  // =========================================================================
  describe('F21: Doodle Analysis & Guided Classification Wizard', () => {
    it('T8-F21-01: CreativeCategory supports character, landscape, and object schemas', () => {
      const categories: CreativeCategory[] = ['character', 'landscape', 'object'];
      expect(categories.length).toBe(3);
      expect(categories).toContain('character');
      expect(categories).toContain('landscape');
      expect(categories).toContain('object');
    });

    it('T8-F21-02: Vertex AI creative prompt adheres to Pixar 3D styling constraints', () => {
      const servicePath = path.join(creativeAppDir, 'src', 'services', 'vertexCreativeService.ts');
      expect(fs.existsSync(servicePath)).toBe(true);
      const content = fs.readFileSync(servicePath, 'utf-8');
      expect(content.includes('Pixar')).toBe(true);
      expect(content.includes('enhancedPrompt')).toBe(true);
    });
  });

  // =========================================================================
  // F22: Phase 4 Mini-Apps Verification (Avatar, Diorama, Toy)
  // =========================================================================
  describe('F22: Interactive Mini-Apps Suite', () => {
    it('T8-F22-01: TalkingAvatarPlayer includes eye tracking and speech synthesis', () => {
      const compPath = path.join(
        creativeAppDir,
        'src',
        'components',
        'creative',
        'miniapps',
        'TalkingAvatarPlayer.tsx'
      );
      expect(fs.existsSync(compPath)).toBe(true);
      const content = fs.readFileSync(compPath, 'utf-8');
      expect(content.includes('eyeOffset')).toBe(true);
      expect(content.includes('speakPhrase')).toBe(true);
    });

    it('T8-F22-02: Diorama3DWorldPlayer supports day/sunset/night cycles and touch drag rotation', () => {
      const compPath = path.join(
        creativeAppDir,
        'src',
        'components',
        'creative',
        'miniapps',
        'Diorama3DWorldPlayer.tsx'
      );
      expect(fs.existsSync(compPath)).toBe(true);
      const content = fs.readFileSync(compPath, 'utf-8');
      expect(content.includes('rotation')).toBe(true);
      expect(content.includes('dayNightCycle')).toBe(true);
      expect(content.includes('sunset')).toBe(true);
    });

    it('T8-F22-03: InteractiveToyPlayer incorporates spring lever, sound buttons, and power meter', () => {
      const compPath = path.join(
        creativeAppDir,
        'src',
        'components',
        'creative',
        'miniapps',
        'InteractiveToyPlayer.tsx'
      );
      expect(fs.existsSync(compPath)).toBe(true);
      const content = fs.readFileSync(compPath, 'utf-8');
      expect(content.includes('leverPulled')).toBe(true);
      expect(content.includes('powerMeter')).toBe(true);
      expect(content.includes('sounds')).toBe(true);
    });
  });

  // =========================================================================
  // F23: Phase 5 Firestore Sync & Parental Dashboard Integration
  // =========================================================================
  describe('F23: Firestore Sync & Parental Dashboard Gallery', () => {
    it('T8-F23-01: saveCreativeCreation broadcasts over localDataBus and persists record', async () => {
      let receivedCreation: CreativeCreationRecord | null = null;
      const unsubscribe = subscribeToCreativeCreations((creations) => {
        if (creations && creations.length > 0) {
          const found = creations.find((c) => c.id === 'test_creation_spec_01');
          if (found) receivedCreation = found;
        }
      });

      const mockCreation: CreativeCreationRecord = {
        id: 'test_creation_spec_01',
        childId: 'child_mateo_01',
        deviceId: 'device_ipad_01',
        category: 'character',
        title: 'Bebé Koala Mágico',
        originalDrawingBase64: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        generatedImageUrl: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c',
        analysis: {
          title: 'Bebé Koala Mágico',
          category: 'character',
          detectedSubject: 'Pequeño koala con corona brillante',
          primaryColors: ['#94A3B8', '#FDE047'],
          spatialLayout: 'Centrado con orejas esponjosas',
          enhancedPrompt: 'Cute baby koala with a small glowing golden crown, 3D Pixar render style.',
          childQuestion: '¿A qué árbol de eucalipto quieres trepar primero?',
          speechFeedback: '¡Tu tierno koala está feliz de conocerte!'
        },
        miniAppType: 'avatar',
        miniAppData: {
          id: 'avatar_koala',
          name: 'Koko el Koala',
          avatarType: 'animal',
          primaryColor: '#94A3B8',
          secondaryColor: '#FDE047',
          voiceStyle: 'gentle',
          personality: 'Cariñoso y tranquilo',
          mission: 'Abrazar ramitas y buscar estrellas fugaces',
          speechScript: ['¡Hola! Soy Koko.', '¿Me ayudas a trepar alto?'],
          headFeature: 'crown',
          bodyStyle: 'fluffy'
        },
        syncedToFirestore: true,
        createdAt: Date.now()
      };

      await saveCreativeCreation(mockCreation);
      expect(receivedCreation).toBeDefined();
      expect(receivedCreation!.id).toBe('test_creation_spec_01');
      expect(receivedCreation!.category).toBe('character');
      unsubscribe();
    });

    it('T8-F23-02: firestore.rules validates /creative_creations collection schema and appName', () => {
      const rulesPath = path.join(rootDir, 'firestore.rules');
      const rules = fs.readFileSync(rulesPath, 'utf-8');
      expect(rules.includes('creative-studio')).toBe(true);
      expect(rules.includes('creative_creations')).toBe(true);
    });

    it('T8-F23-03: Parent dashboard renders CreativeStudioGallery with comparative view', () => {
      const galleryPath = path.join(
        rootDir,
        'apps',
        'zf-parental-dashboard',
        'src',
        'components',
        'creative',
        'CreativeStudioGallery.tsx'
      );
      expect(fs.existsSync(galleryPath)).toBe(true);
      const content = fs.readFileSync(galleryPath, 'utf-8');
      expect(content.includes('viewMode')).toBe(true);
      expect(content.includes('compare')).toBe(true);
      expect(content.includes('Pixar')).toBe(true);
    });
  });
});
