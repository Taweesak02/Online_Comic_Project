import assert from 'node:assert/strict';
import { test } from 'vitest';
import { extractRelationIds, getComicStatusLabel } from '../src/utils/comicUtils.js';

test('relation IDs support direct and nested API representations', () => {
    assert.deepEqual(extractRelationIds([
        { id: '1' }, { categoryId: 2 }, { tagId: '3' }, { value: 4 },
        { category: { id: '5' } }, { tag: { id: 6 } },
    ]), [1, 2, 3, 4, 5, 6]);
});

test('relation IDs exclude missing, nonnumeric, and nonpositive values', () => {
    assert.deepEqual(extractRelationIds([
        null, undefined, {}, { id: 'invalid' }, { id: 0 }, { id: -2 },
        { id: Infinity }, { id: '' }, { id: 7 },
    ]), [7]);
    for (const value of [undefined, null, {}, '1']) {
        assert.deepEqual(extractRelationIds(value), []);
    }
});

test('relation IDs prefer canonical IDs and fall back from null IDs', () => {
    assert.deepEqual(extractRelationIds([{ id: 1, categoryId: 2 }, { id: null, tagId: 3 }]), [1, 3]);
});

test('comic statuses have Thai labels and an unknown-status fallback', () => {
    assert.equal(getComicStatusLabel('ONGOING'), 'กำลังเผยแพร่');
    assert.equal(getComicStatusLabel('COMPLETED'), 'จบแล้ว');
    assert.equal(getComicStatusLabel('HIATUS'), 'พักการเผยแพร่');
    assert.equal(getComicStatusLabel('CANCELLED'), 'ยกเลิกการเผยแพร่');
    for (const value of [undefined, null, '', 'UNKNOWN']) {
        assert.equal(getComicStatusLabel(value), 'ไม่ทราบสถานะ');
    }
});
