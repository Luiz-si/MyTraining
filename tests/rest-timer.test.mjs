/** Testa o relógio com tempo simulado, sem esperar três minutos reais. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createRestTimer } from '../src/features/descanso/controle-cronometro.ts';

function setup() {
  let time = 1000;
  let state;
  const jobs = new Set();
  const alarms = [];
  const timer = createRestTimer({
    now: () => time,
    onChange: (next) => { state = next; },
    onComplete: (isCurrent) => alarms.push(isCurrent),
    schedule: (tick) => { jobs.add(tick); return () => jobs.delete(tick); },
  });
  return {
    timer, jobs, alarms,
    state: () => state,
    advance(ms) { time += ms; for (const tick of [...jobs]) tick(); },
    suspend(ms) { time += ms; },
  };
}

test('inicia com um toque e conclui três descansos consecutivos com um aviso por ciclo', () => {
  const h = setup();
  for (let cycle = 1; cycle <= 3; cycle++) {
    h.timer.start();
    assert.deepEqual(h.state(), { seconds: 180, running: true, completed: false });
    h.advance(250);
    assert.equal(h.state().seconds, 179);
    h.advance(179000);
    assert.equal(h.state().seconds, 0);
    assert.equal(h.alarms.length, cycle - 1);
    h.advance(750);
    assert.deepEqual(h.state(), { seconds: 180, running: false, completed: true });
    assert.equal(h.alarms.length, cycle);
    assert.equal(h.jobs.size, 0);
    h.timer.refresh();
    h.advance(5000);
    assert.equal(h.alarms.length, cycle);
  }
});

test('toques rápidos reiniciam o prazo e mantêm apenas um intervalo', () => {
  const h = setup();
  h.timer.start();
  h.advance(120000);
  for (let i = 0; i < 30; i++) h.timer.start();
  assert.equal(h.jobs.size, 1);
  h.advance(1000);
  assert.equal(h.state().seconds, 179);
  h.advance(179000);
  assert.equal(h.alarms.length, 1);
});

test('voltar do segundo plano desconta o tempo real e finaliza só uma vez', () => {
  const h = setup();
  h.timer.start();
  h.suspend(45000);
  h.timer.refresh();
  assert.equal(h.state().seconds, 135);
  h.suspend(300000);
  h.timer.refresh();
  assert.equal(h.state().seconds, 180);
  assert.equal(h.state().running, false);
  h.timer.refresh();
  assert.equal(h.alarms.length, 1);
});

test('reiniciar ou desmontar invalida áudio pendente e cancela atualizações', () => {
  const h = setup();
  h.timer.start();
  h.advance(180000);
  assert.equal(h.alarms[0](), true);
  h.timer.start();
  assert.equal(h.alarms[0](), false);
  h.advance(180000);
  const pending = h.alarms[1];
  h.timer.dispose();
  assert.equal(pending(), false);
  const state = h.state();
  h.timer.start();
  h.timer.refresh();
  h.advance(500000);
  assert.equal(h.state(), state);
  assert.equal(h.jobs.size, 0);
  assert.equal(h.alarms.length, 2);
});
