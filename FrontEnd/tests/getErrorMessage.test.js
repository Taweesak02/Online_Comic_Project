import assert from 'node:assert/strict';
import { test } from 'vitest';
import getErrorMessage from '../src/utils/getErrorMessage.js';

test('API error messages take precedence over fallback text', () => {
    assert.equal(getErrorMessage({ response: { data: { message: 'Session expired' } } }, 'Try again'), 'Session expired');
});

test('network errors and empty API messages use fallback text', () => {
    for (const error of [new Error('Network Error'), {}, { response: {} },
        { response: { data: null } }, { response: { data: { message: '' } } }]) {
        assert.equal(getErrorMessage(error, 'Try again'), 'Try again');
    }
});
