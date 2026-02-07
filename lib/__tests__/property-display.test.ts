import { describe, test, expect } from 'bun:test';
import {
  formatPropertyValue,
  formatFieldLabel,
  isZoningLayer,
  isTransitLayer,
  isFieldHidden,
  getDisplayProperties,
} from '../property-display';

describe('formatPropertyValue', () => {
  test('returns "—" for null', () => {
    expect(formatPropertyValue(null)).toBe('—');
  });

  test('returns "—" for undefined', () => {
    expect(formatPropertyValue(undefined)).toBe('—');
  });

  test('returns "—" for empty string', () => {
    expect(formatPropertyValue('')).toBe('—');
  });

  test('formats boolean true as "Yes"', () => {
    expect(formatPropertyValue(true)).toBe('Yes');
  });

  test('formats boolean false as "No"', () => {
    expect(formatPropertyValue(false)).toBe('No');
  });

  test('formats number with locale string', () => {
    expect(formatPropertyValue(1234567)).toBe('1,234,567');
  });

  test('returns string as-is for none transform', () => {
    expect(formatPropertyValue('hello', 'none')).toBe('hello');
  });

  test('yesNo transform converts "y" to "Yes"', () => {
    expect(formatPropertyValue('y', 'yesNo')).toBe('Yes');
  });

  test('yesNo transform converts "n" to "No"', () => {
    expect(formatPropertyValue('n', 'yesNo')).toBe('No');
  });

  test('uppercase transform uppercases string', () => {
    expect(formatPropertyValue('nr1', 'uppercase')).toBe('NR1');
  });

  test('zoneCode transform uppercases string', () => {
    expect(formatPropertyValue('nc3', 'zoneCode')).toBe('NC3');
  });
});

describe('formatFieldLabel', () => {
  test('converts ZONING_DESC to "Zoning Desc"', () => {
    expect(formatFieldLabel('ZONING_DESC')).toBe('Zoning Desc');
  });

  test('converts camelCase to separate words', () => {
    expect(formatFieldLabel('zoneName')).toBe('Zone Name');
  });

  test('handles single word', () => {
    expect(formatFieldLabel('STATUS')).toBe('Status');
  });
});

describe('isZoningLayer', () => {
  test('returns true for "zoning"', () => {
    expect(isZoningLayer('zoning')).toBe(true);
  });

  test('returns true for "zoning_detailed"', () => {
    expect(isZoningLayer('zoning_detailed')).toBe(true);
  });

  test('returns false for "transit_stops"', () => {
    expect(isZoningLayer('transit_stops')).toBe(false);
  });

  test('returns false for unknown layer', () => {
    expect(isZoningLayer('foo')).toBe(false);
  });
});

describe('isTransitLayer', () => {
  test('returns true for "transit_stops"', () => {
    expect(isTransitLayer('transit_stops')).toBe(true);
  });

  test('returns true for "transit_routes"', () => {
    expect(isTransitLayer('transit_routes')).toBe(true);
  });

  test('returns false for "zoning"', () => {
    expect(isTransitLayer('zoning')).toBe(false);
  });
});

describe('isFieldHidden', () => {
  test('hides OBJECTID globally', () => {
    expect(isFieldHidden('zoning', 'OBJECTID')).toBe(true);
  });

  test('hides Shape_Length globally', () => {
    expect(isFieldHidden('zoning', 'Shape_Length')).toBe(true);
  });

  test('hides underscore-prefixed fields', () => {
    expect(isFieldHidden('zoning', '_internal')).toBe(true);
  });

  test('hides layer-specific fields', () => {
    expect(isFieldHidden('zoning', 'ZONEID')).toBe(true);
  });

  test('does not hide display fields', () => {
    expect(isFieldHidden('zoning', 'ZONELUT')).toBe(false);
  });
});

describe('getDisplayProperties', () => {
  test('returns configured fields for zoning layer', () => {
    const props = getDisplayProperties('zoning', {
      ZONELUT: 'NR1',
      CATEGORY_DESC: 'Residential',
      OBJECTID: 123,
    });
    expect(props.length).toBe(2); // ZONELUT and CATEGORY_DESC, not OBJECTID
    expect(props[0].label).toBe('Zone Code');
    expect(props[0].value).toBe('NR1');
  });

  test('returns all non-hidden fields for unknown layer', () => {
    const props = getDisplayProperties('unknown_layer', {
      name: 'Test',
      OBJECTID: 123,
      status: 'Active',
    });
    expect(props.length).toBe(2); // name and status, not OBJECTID
  });
});
