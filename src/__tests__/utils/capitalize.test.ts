import { describe, it, expect } from 'vitest';
import { capitalize } from '@utils/ui-utils';

describe('capitalize', () => {
    it('should capitalize the first letter of a lowercase word', () => {
        expect(capitalize('hello')).toBe('Hello');
    });

    it('should not change the first letter if it is already uppercase', () => {
        expect(capitalize('Hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
        expect(capitalize('')).toBe('');
    });

    it('should capitalize the first letter and leave the rest unchanged', () => {
        expect(capitalize('hELLO')).toBe('HELLO');
    });

    it('should handle single character strings', () => {
        expect(capitalize('a')).toBe('A');
        expect(capitalize('A')).toBe('A');
    });

    it('should handle strings with non-letter first character', () => {
        expect(capitalize('1hello')).toBe('1hello');
        expect(capitalize(' hello')).toBe(' hello');
    });
});