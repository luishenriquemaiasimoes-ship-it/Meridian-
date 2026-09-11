import { describe, expect, it } from 'vitest';
import {
  AGENT_META, countSeverities, finding, missing, sortFindings, verdictOf,
  type AgentFinding,
} from '@/lib/ai/agents';

const f = (severity: AgentFinding['severity'], id: string): AgentFinding =>
  finding({ id, severity, area: 'Test', title: id, detail: 'detail', sources: ['/somewhere'] });

describe('agent findings', () => {
  it('refuses to build a finding nobody can check', () => {
    expect(() => finding({
      id: 'no-source', severity: 'WARNING', area: 'Test',
      title: 'A claim', detail: 'With nothing behind it', sources: [],
    })).toThrow(/no source/i);
  });

  it('keeps the source list on a finding that has one', () => {
    expect(f('PASS', 'ok').sources).toEqual(['/somewhere']);
  });

  it('defaults the remedy to null rather than leaving it undefined', () => {
    expect(f('PASS', 'ok').remedy).toBeNull();
  });
});

describe('agent verdicts', () => {
  it('takes the worst finding as the verdict', () => {
    expect(verdictOf([f('PASS', 'a'), f('WARNING', 'b'), f('FAIL', 'c')])).toBe('FAIL');
    expect(verdictOf([f('PASS', 'a'), f('INFO', 'b')])).toBe('INFO');
    expect(verdictOf([f('PASS', 'a')])).toBe('PASS');
  });

  it('has no verdict when nothing was checked, rather than passing by default', () => {
    expect(verdictOf([])).toBeNull();
  });

  it('counts every severity, including the ones with none', () => {
    expect(countSeverities([f('FAIL', 'a'), f('FAIL', 'b'), f('PASS', 'c')]))
      .toEqual({ FAIL: 2, WARNING: 0, INFO: 0, PASS: 1 });
  });

  it('sorts the worst first without mutating the input', () => {
    const input = [f('PASS', 'a'), f('FAIL', 'b'), f('WARNING', 'c'), f('INFO', 'd')];
    const sorted = sortFindings(input);
    expect(sorted.map((x) => x.severity)).toEqual(['FAIL', 'WARNING', 'INFO', 'PASS']);
    expect(input[0].severity).toBe('PASS');
  });
});

describe('missing data', () => {
  it('has one way to say a figure is not held, and it points somewhere', () => {
    const m = missing('the debt maturity schedule', 'Financials tab');
    expect(m.kind).toBe('MISSING');
    expect(m.text).toBe('Data unavailable: the debt maturity schedule.');
    expect(m.sources).toEqual(['Financials tab']);
  });
});

describe('the agent catalogue', () => {
  it('describes every agent it declares', () => {
    for (const [id, meta] of Object.entries(AGENT_META)) {
      expect(meta.name, id).toMatch(/Agent$/);
      expect(meta.purpose.length, id).toBeGreaterThan(40);
      expect(['COMPANY', 'WORKSPACE']).toContain(meta.scope);
    }
  });

  it('scopes the thesis monitor to the workspace and the rest to a company', () => {
    expect(AGENT_META.THESIS_MONITOR.scope).toBe('WORKSPACE');
    expect(AGENT_META.DCF_BUILD.scope).toBe('COMPANY');
    expect(AGENT_META.MODEL_AUDIT.scope).toBe('COMPANY');
    expect(AGENT_META.QA_PREP.scope).toBe('COMPANY');
  });
});
