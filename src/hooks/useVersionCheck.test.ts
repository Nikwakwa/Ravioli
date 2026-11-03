import { describe, expect, it } from 'vitest';
import { isNewerVersion, normalizeVersion } from './useVersionCheck';

describe('useVersionCheck version comparison logic', () => {
  it('normalizes version strings properly', () => {
    expect(normalizeVersion('0.16.4')).toBe('v0.16.4');
    expect(normalizeVersion('v0.16.4')).toBe('v0.16.4');
    expect(normalizeVersion('  v1.2.3  ')).toBe('v1.2.3');
    expect(normalizeVersion('invalid')).toBeNull();
  });

  it('correctly identifies when remote version is newer', () => {
    expect(isNewerVersion('v0.16.7', 'v0.16.6')).toBe(true);
    expect(isNewerVersion('v0.17.0', 'v0.16.6')).toBe(true);
    expect(isNewerVersion('v1.0.0', 'v0.16.6')).toBe(true);
  });

  it('correctly rejects older or equal remote versions', () => {
    // Current is v0.16.6, server returned v0.16.4 -> MUST BE FALSE
    expect(isNewerVersion('v0.16.4', 'v0.16.6')).toBe(false);
    expect(isNewerVersion('v0.16.6', 'v0.16.6')).toBe(false);
    expect(isNewerVersion('v0.15.9', 'v0.16.6')).toBe(false);
    expect(isNewerVersion('v0.16.5', 'v0.16.6')).toBe(false);
  });
});
