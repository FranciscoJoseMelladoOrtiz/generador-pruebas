import { renderHook, act } from '@testing-library/react';
import { useTestState } from '@hooks/testState.hooks';

// Si usas Vitest, reemplaza jest.mock por vi.mock:
vi.mock('@models/ui-models', () => ({
    TestState: {} as any,
}));

describe('useTestState', () => {
    it('should initialize with default values', () => {
        const { result } = renderHook(() => useTestState());
        expect(result.current.status).toBe('unknown');
        expect(result.current.failureReason.length).toBe(0);
    });

    it('should initialize with given status and failureReason if status is "failed"', () => {
        const { result } = renderHook(() => useTestState('failed', 'Some error'));
        expect(result.current.status).toBe('failed');
        expect(result.current.failureReason).toBe('Some error');
    });

    it('should ignore initial failureReason if status is not "failed"', () => {
        const { result } = renderHook(() => useTestState('passed', 'Should be ignored'));
        expect(result.current.status).toBe('passed');
        expect(result.current.failureReason.length).toBe(0);
    });

    it('should update status and clear failureReason if status is not "failed"', () => {
        const { result } = renderHook(() => useTestState('failed', 'Error'));
        act(() => {
            result.current.setStatus('passed');
        });
        expect(result.current.status).toBe('passed');
        expect(result.current.failureReason.length).toBe(0);
    });

    it('should allow setting failureReason only if status is "failed"', () => {
        const { result } = renderHook(() => useTestState('failed', 'Initial error'));
        act(() => {
            result.current.setFailureReason('New error');
        });
        expect(result.current.failureReason).toBe('New error');

        act(() => {
            result.current.setStatus('passed');
            result.current.setFailureReason('Should not set');
        });
        expect(result.current.failureReason.length).toBe(0);
    });

    it('should not update failureReason if status is not "failed"', () => {
        const { result } = renderHook(() => useTestState('passed'));
        act(() => {
            result.current.setFailureReason('Should not set');
        });
        expect(result.current.failureReason.length).toBe(0);
    });

    it('should reset failureReason when status changes from "failed" to another', () => {
        const { result } = renderHook(() => useTestState('failed', 'Error'));
        act(() => {
            result.current.setStatus('unknown');
        });
        expect(result.current.status).toBe('unknown');
        expect(result.current.failureReason.length).toBe(0);
    });
});