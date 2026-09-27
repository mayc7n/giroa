import { formatISODateToBR, parseBRDateToISO } from '@/domain/date';

describe('civil dates', () => {
  it('converts between storage ISO and Brazilian display formats', () => {
    expect(formatISODateToBR('2026-09-27')).toBe('27/09/2026');
    expect(parseBRDateToISO('27/09/2026')).toBe('2026-09-27');
  });

  it('rejects impossible or malformed Brazilian dates', () => {
    expect(() => parseBRDateToISO('31/02/2026')).toThrow();
    expect(() => parseBRDateToISO('2026-09-27')).toThrow();
  });
});
