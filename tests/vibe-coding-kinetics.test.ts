/**
 * Test Suite: Vibe Coding Kinetics & Pediatric HCI Engine
 * Valida los algoritmos de interacción motriz de 2 a 5 años:
 * 1. PointersHullEngine: Multidedo (1-5 dedos), Palma completa y Detección de ráfagas rápidas.
 * 2. AdaptiveMagneticSnapper: Radio dinámico de Fitts pediátrico (Hourcade 2004).
 * 3. BioMorphPhysicsEngine: Sobrecarga de energía creativa y físicas elásticas 60fps.
 */

import { PointersHullEngine } from '../apps/vibe-coding/src/engine/PointersHullEngine';
import { AdaptiveMagneticSnapper, TargetZone } from '../apps/vibe-coding/src/engine/AdaptiveMagneticSnapper';
import { BioMorphPhysicsEngine } from '../apps/vibe-coding/src/engine/BioMorphPhysicsEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED] ${msg}`);
  }
}

async function runVibeCodingKineticsTests() {
  console.log('🧪 Iniciando pruebas de cinemática pediátrica y física elástica...');

  // ==========================================================================
  // Test 1: PointersHullEngine - Detección de 1 Dedo vs Multidedo vs Palma
  // ==========================================================================
  const hull = new PointersHullEngine();

  // Simular 1 dedo
  const down1 = hull.handlePointerDown({
    pointerId: 1,
    clientX: 200,
    clientY: 300,
    pointerType: 'touch',
    pressure: 0.5,
  } as any);

  assert(down1.contactType === 'single_finger', 'Debe clasificar como single_finger');
  assert(down1.centroidX === 200 && down1.centroidY === 300, 'Centroide de 1 dedo debe coincidir');

  // Simular segundo dedo (Multidedo en racimo)
  const down2 = hull.handlePointerDown({
    pointerId: 2,
    clientX: 240,
    clientY: 320,
    pointerType: 'touch',
    pressure: 0.5,
  } as any);

  assert(down2.contactType === 'multi_finger_cluster', 'Dos dedos deben ser multi_finger_cluster');
  assert(down2.centroidX === 220 && down2.centroidY === 310, 'Centroide debe ser el promedio de ambos dedos');

  // Simular 4 dedos simultáneos (Palma masiva preescolar - Courage et al., 2021)
  hull.handlePointerDown({ pointerId: 3, clientX: 280, clientY: 340, pointerType: 'touch' } as any);
  const down4 = hull.handlePointerDown({ pointerId: 4, clientX: 320, clientY: 360, pointerType: 'touch' } as any);

  assert(down4.contactType === 'palm_press', '4 o más puntos de contacto deben clasificarse como palm_press');
  console.log('✅ Test 1 Superado: Clasificación de Pointers (1 dedo, Multidedo, Palma Completa)');

  // ==========================================================================
  // Test 2: PointersHullEngine - Detección de Ráfagas Rápidas (<180ms IAT)
  // ==========================================================================
  hull.handlePointerCancel();
  const hullBurst = new PointersHullEngine();

  // Simular 3 toques repetidos rápidos en la misma zona
  hullBurst.handlePointerDown({ pointerId: 10, clientX: 400, clientY: 400, pointerType: 'touch' } as any);
  hullBurst.handlePointerUp(10);

  const burst2 = hullBurst.handlePointerDown({ pointerId: 11, clientX: 405, clientY: 402, pointerType: 'touch' } as any);
  hullBurst.handlePointerUp(11);

  const burst3 = hullBurst.handlePointerDown({ pointerId: 12, clientX: 398, clientY: 404, pointerType: 'touch' } as any);

  assert(burst3.isBurst === true, 'Tres toques rápidos deben clasificarse como ráfaga (isBurst = true)');
  assert(burst3.burstCount >= 2, 'Contador de ráfaga debe ser >= 2');
  console.log('✅ Test 2 Superado: Detección y Deduplicación de Ráfagas Rápidas (Rapid Tapping)');

  // ==========================================================================
  // Test 3: AdaptiveMagneticSnapper - Fitts Pediátrico y Snapping Adaptativo
  // ==========================================================================
  const snapper = new AdaptiveMagneticSnapper();
  const targets: TargetZone[] = [
    { id: 'estanque_criaturas', x: 50, y: 300, baseRadius: 40 },
    { id: 'estanque_melodias', x: 750, y: 300, baseRadius: 40 },
  ];

  // A velocidad baja (fase de corrección fina de Hourcade)
  snapper.updateVelocity(85, 300, 100);
  snapper.updateVelocity(86, 300, 200); // 0.01 px/ms (desacelerando cerca del blanco)

  const snapResult = snapper.findSnappingTarget(86, 300, targets, 25);
  assert(snapResult.target !== null, 'Debe capturar magnéticamente el estanque cercano');
  assert(snapResult.target?.id === 'estanque_criaturas', 'El target capturado debe ser el estanque izquierdo');
  assert(snapResult.snapFactor > 0, 'El factor de snapping debe ser positivo');

  const pos = snapper.getMagneticPosition(86, 300, snapResult.target!);
  assert(pos.x < 86, 'La posición con snapping debe aproximarse elásticamente al centro del target');
  console.log('✅ Test 3 Superado: Fitts Pediátrico y Snapping Magnético Adaptativo (Hourcade 2004)');

  // ==========================================================================
  // Test 4: BioMorphPhysicsEngine - Generación Elástica y Conversión de Ráfaga
  // ==========================================================================
  const physics = new BioMorphPhysicsEngine();
  physics.resize(800, 600);

  // Spawn de 2 bio-morfos
  const bio1 = physics.spawnEntity(300, 300, 'characters');
  const bio2 = physics.spawnEntity(320, 300, 'characters');

  assert(physics.entities.length === 2, 'Debe contener 2 bio-morfos');
  assert(bio1.basePitchHz > 0, 'El bio-morfo debe tener un tono musical armónico asignado');

  // Aplicar ráfaga rápida sobre bio1
  const initialEnergy = bio1.energyLevel;
  const initialTargetRadius = bio1.targetRadius;

  physics.handlePointerImpact(300, 300, true); // Impacto con isBurst = true

  assert(bio1.energyLevel > initialEnergy, 'La energía debe sobrecargarse en vez de reiniciarse');
  assert(bio1.targetRadius > initialTargetRadius, 'El bio-morfo debe expandirse elásticamente por la ráfaga');
  assert(bio1.vy < 0, 'Debe impulsarse hacia arriba con alegría');

  // Actualizar un ciclo de física con calma
  physics.update(1000, burst3, { tiltX: 10, tiltY: 5, gravityX: 0.2, gravityY: 0.1, isSimulated: false }, true);
  assert(bio1.currentRadius > 10, 'El radio actual debe haber crecido elásticamente');
  console.log('✅ Test 4 Superado: BioMorphPhysicsEngine (Sobrecarga de Energía Creativa y Físicas)');

  console.log('🎉 TODOS LOS TESTS DE CINEMÁTICA Y FÍSICA PEDIÁTRICA HAN PASADO SATISFACTORIAMENTE (4/4).');
}

runVibeCodingKineticsTests().catch((err) => {
  console.error('❌ Error en pruebas:', err);
  process.exit(1);
});
