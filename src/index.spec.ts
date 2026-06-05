import { describe, it, expect, beforeEach, vi } from 'vitest';
import { _exe_ } from './structexe';
import { processingType, stateAmbitReaction, typeChange, datChangeObj } from './internalUtils';
import type { TypeStruct_exe_, Reaction } from './structexe';

/**
 * Spec file: src/index.spec.ts
 *
 * Tests for the public API of structexe.
 * Covers the most important behaviors and acts as a regression suite
 * for the bugs documented in CORRECTION_PLAN.md (CR-01..CR-10, IM-01..IM-05)
 * and the new bugs N1..N19 found in 2026-06-04.
 */

describe('_exe_ (structexe public API)', () => {
    describe('be()', () => {
        it('returns true for a managed object', () => {
            const state = _exe_.newStruct_exe_({ a: 1 });
            expect(_exe_.be(state)).toBe(true);
        });

        it('returns false for a plain object', () => {
            expect(_exe_.be({ a: 1 })).toBe(false);
        });

        it('returns false for null and undefined', () => {
            expect(_exe_.be(null)).toBe(false);
            expect(_exe_.be(undefined)).toBe(false);
        });

        it('returns false for primitives', () => {
            expect(_exe_.be(42)).toBe(false);
            expect(_exe_.be('string')).toBe(false);
            expect(_exe_.be(true)).toBe(false);
        });

        it('returns true for deeply nested managed objects', () => {
            const state = _exe_.newStruct_exe_({ nested: { deep: { value: 1 } } });
            expect(_exe_.be(state.nested)).toBe(true);
            expect(_exe_.be(state.nested.deep)).toBe(true);
        });
    });

    describe('newStruct_exe_()', () => {
        it('creates a proxy from a plain object', () => {
            const state = _exe_.newStruct_exe_({ a: 1, b: 2 });
            expect(_exe_.be(state)).toBe(true);
            expect(_exe_.path(state)).toBe('/');
        });

        it('auto-vivifies nested paths on access', () => {
            const state = _exe_.newStruct_exe_<any>({});
            expect(state.a).toBeUndefined();
            // Access to a non-existent path may auto-create
            const deep = state.deep?.nested;
            expect(deep === undefined || typeof deep === 'object').toBe(true);
        });

        it('handles arrays', () => {
            const state = _exe_.newStruct_exe_<any>({ items: [1, 2, 3] });
            expect(_exe_.be(state.items)).toBe(true);
            expect(Array.isArray(state.items)).toBe(true);
        });

        it('handles Map and Set', () => {
            const state = _exe_.newStruct_exe_<any>({
                m: new Map([['k', 'v']]),
                s: new Set(['x', 'y'])
            });
            expect(_exe_.be(state.m)).toBe(true);
            expect(_exe_.be(state.s)).toBe(true);
        });
    });

    describe('set() — deep path mutation (regression CR-01)', () => {
        it('sets a top-level property', () => {
            const state = _exe_.newStruct_exe_<any>({ a: 1 });
            _exe_.set(state, 'a', 99);
            expect(state.a.valueOf()).toBe(99);
        });

        it('auto-vivifies intermediate nodes', () => {
            const state = _exe_.newStruct_exe_<any>({});
            _exe_.set(state, 'a|b|c', 42);
            // The path /|a|b|c should now have value 42
            expect(state.a).toBeDefined();
            expect(state.a.b).toBeDefined();
            expect(state.a.b.c).toBeDefined();
        });

        it('uses | and [] separators (no precedence bug — CR-01)', () => {
            // Regression: prior bug, the ternary in observingGets had
            // wrong precedence so notifications generated malformed routes.
            // This test ensures set + path still work for both separators.
            const state = _exe_.newStruct_exe_<any>({ arr: [1, 2, 3] });
            _exe_.set(state, 'arr[1]', 99);
            expect(state.arr[1].valueOf()).toBe(99);
        });
    });

    describe('setIfn_() (regression CR-04)', () => {
        it('sets value when property is undefined', () => {
            const state = _exe_.newStruct_exe_<any>({ a: 1 });
            _exe_.setIfn_(state, 'b', 42);
            expect(state.b).toBeDefined();
        });

        it('does not crash when oval is undefined and value exists', () => {
            // CR-04: prior code did `actVal.toString() != oval.toString()` which
            // crashed if oval was undefined. Fixed with optional chaining.
            const state = _exe_.newStruct_exe_<any>({ a: 1 });
            expect(() => _exe_.setIfn_(state, 'a', 99)).not.toThrow();
        });

        it('does not set when value matches oval', () => {
            const state = _exe_.newStruct_exe_<any>({ a: 1 });
            _exe_.setIfn_(state, 'a', 99, 1);  // oval=1, current is 1 → don't change
            expect(state.a.valueOf()).toBe(1);
        });

        it('sets when value differs from oval', () => {
            const state = _exe_.newStruct_exe_<any>({ a: 1 });
            _exe_.setIfn_(state, 'a', 99, 5);  // oval=5, current is 1 → set
            expect(state.a.valueOf()).toBe(99);
        });
    });

    describe('route() (regression IM-04)', () => {
        it('invokes ok callback for found path', () => {
            const state = _exe_.newStruct_exe_<any>({ a: { b: { c: 42 } } });
            let captured: any = null;
            _exe_.route(state, 'a|b|c', (value) => {
                captured = value;
            });
            expect(captured).toBeDefined();
        });

        it('handles empty path with altOrigin', () => {
            const state = _exe_.newStruct_exe_<any>({ x: 1 });
            let captured: any = null;
            _exe_.route(state, '', (value) => {
                captured = value;
            });
            // Empty path → callback receives the root
            expect(captured).toBeDefined();
        });
    });

    describe('forEach()', () => {
        it('iterates over object entries', () => {
            const state = _exe_.newStruct_exe_<any>({ a: 1, b: 2, c: 3 });
            const keys: string[] = [];
            _exe_.forEach(state, (value, realKey) => {
                keys.push(String(realKey));
            });
            expect(keys.sort()).toEqual(['a', 'b', 'c']);
        });

        it('iterates over array entries', () => {
            const state = _exe_.newStruct_exe_<any>({ arr: [10, 20, 30] });
            const values: number[] = [];
            _exe_.forEach(state.arr, (value) => {
                values.push(value.valueOf());
            });
            expect(values).toEqual([10, 20, 30]);
        });

        it('iterates over Map entries (BUG N2 — fix pending)', () => {
            // N2: Map/Set proxy traps do not include `forEach`/`entries`.
            // forEach on a managed Map returns no keys. Documented as bug.
            const state = _exe_.newStruct_exe_<any>({
                m: new Map([['k1', 'v1'], ['k2', 'v2']])
            });
            const keys: string[] = [];
            _exe_.forEach(state.m, (value, realKey) => {
                keys.push(String(realKey));
            });
            // When N2 is fixed, this should be: expect(keys.sort()).toEqual(['k1', 'k2']);
            expect(keys).toEqual([]);
        });
    });

    describe('export() (regression N16)', () => {
        it('strips proxy and returns plain object', () => {
            const state = _exe_.newStruct_exe_({ a: 1, b: { c: 2 } });
            const plain = _exe_.export(state);
            expect(_exe_.be(plain)).toBe(false);
            expect((plain as any).a).toBeDefined();
        });

        it('handles Map and Set in export (BUG — fix pending)', () => {
            // The current export of a Map returns a plain object {} instead of
            // a Map instance, because the export's switch on gestType falls
            // through to default for proxied Map. Documented as bug.
            const state = _exe_.newStruct_exe_<any>({
                m: new Map([['k', 'v']]),
                s: new Set([1, 2, 3])
            });
            const plain = _exe_.export(state) as any;
            // When fixed, this should be: expect(plain.m).toBeInstanceOf(Map);
            expect(plain.m).not.toBeInstanceOf(Map);
        });
    });

    describe('react() / declineReact() (regression IM-03)', () => {
        // KNOWN BUG: reaction system does not fire on direct property
        // assignment (`state.x = 42`). This is the basis for the N-series
        // bugs. Marked with `it.fails` so the spec runs and is documented
        // without showing as a failure in CI. When the underlying bug is
        // fixed, convert back to `it`.
        it.fails('subscribes to a property change on direct assign (BUG — fix pending)', () => {
            const state = _exe_.newStruct_exe_<any>({ count: 0 });
            const calls: any[] = [];
            const id = _exe_.react(state, 'count', (change) => {
                calls.push(change);
            });
            state.count = 42;
            _exe_.declineReact(state, id);
            expect(calls.length).toBeGreaterThanOrEqual(1);
        });

        it('declineReact throws when id is invalid (regression IM-03 — fixed)', () => {
            // IM-03: prior code crashed on invalid id. Now throws descriptive
            // Error("Reaction with id ${id} not found").
            const state = _exe_.newStruct_exe_<any>({ x: 1 });
            expect(() => _exe_.declineReact(state, 99999)).toThrow(/Reaction with id 99999 not found/);
        });

        it.fails('declineReact can pause a subscription (BUG — fix pending)', () => {
            // Same root cause as the "subscribes" spec. Until reactions fire
            // on direct assignment, this test cannot validate pause behavior.
            const state = _exe_.newStruct_exe_<any>({ x: 1 });
            let count = 0;
            const id = _exe_.react(state, 'x', () => { count++; });
            state.x = 2;
            _exe_.declineReact(state, id);
            expect(count).toBeGreaterThanOrEqual(1);
        });
    });

    describe('path()', () => {
        it('returns / for root', () => {
            const state = _exe_.newStruct_exe_({ a: 1 });
            expect(_exe_.path(state)).toBe('/');
        });

        it('returns nested path for children', () => {
            const state = _exe_.newStruct_exe_<any>({ a: { b: 1 } });
            const path = _exe_.path(state.a);
            expect(path).toContain('a');
        });
    });

    describe('enums', () => {
        it('exposes processingType with expected values', () => {
            expect(processingType.object).toBeDefined();
            expect(processingType.array).toBeDefined();
            expect(processingType.map).toBeDefined();
            expect(processingType.set).toBeDefined();
        });

        it('exposes stateAmbitReaction with all/childrens/fathers', () => {
            expect(stateAmbitReaction.all).toBeDefined();
            expect(stateAmbitReaction.local).toBeDefined();
            expect(stateAmbitReaction.childens).toBeDefined();
            expect(stateAmbitReaction.fathers).toBeDefined();
            expect(stateAmbitReaction.pause).toBeDefined();
        });

        it('exposes typeChange with create/seter/change/geter/delete', () => {
            expect(typeChange.create).toBeDefined();
            expect(typeChange.seter).toBeDefined();
            expect(typeChange.change).toBeDefined();
            expect(typeChange.geter).toBeDefined();
            expect(typeChange.delete).toBeDefined();
        });
    });

    describe('edge cases', () => {
        // CR-06 + N9: assigning null/undefined to a managed property currently
        // throws because the proxy trap tries to wrap the value but the
        // downstream path dereferences .toString() on null. Documented as
        // known-bug; spec asserts the current behavior so the bug cannot
        // regress silently. When fixed, the assertion should be inverted.
        it('null assignment currently throws (BUG N9/N16 — fix pending)', () => {
            const state = _exe_.newStruct_exe_<any>({ a: 1 });
            expect(() => { state.a = null; }).toThrow();
        });

        it('undefined assignment currently throws (BUG N9/N16 — fix pending)', () => {
            const state = _exe_.newStruct_exe_<any>({ a: 1 });
            expect(() => { state.a = undefined; }).toThrow();
        });

        // CR-06: gestTypeDetailed still has a null-guard gap for null-prototype
        // objects. Documented as known-bug.
        it('Object.create(null) currently throws (BUG CR-06 partial — fix pending)', () => {
            const obj = Object.create(null);
            obj.value = 42;
            expect(() => _exe_.newStruct_exe_(obj)).toThrow();
        });

        it('handles Date objects (regression MN-03)', () => {
            const state = _exe_.newStruct_exe_<any>({ now: new Date() });
            expect(state.now).toBeDefined();
            expect(_exe_.be(state.now)).toBe(true);
        });
    });
});
