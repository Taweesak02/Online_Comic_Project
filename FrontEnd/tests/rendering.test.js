import assert from 'node:assert/strict';
import { test } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const components = import.meta.glob('/src/**/*.jsx');

async function render(path, props) {
    const { default: Component } = await components[path]();
    return renderToStaticMarkup(createElement(Component, props));
}

test('comic sections prioritize loading, then errors, then empty results', async () => {
    const path = '/src/components/comics/ComicSection.jsx';
    const loading = await render(path, { title: 'Comics', loading: true, error: 'Request failed' });
    assert.match(loading, /<output\b/);
    assert.doesNotMatch(loading, /Request failed/);
    const error = await render(path, { title: 'Comics', error: 'Request failed', onRetry() {} });
    assert.match(error, /role="alert"/);
    assert.match(error, /Request failed/);
    assert.match(error, /type="button"/);
    const empty = await render(path, { title: 'Comics' });
    assert.match(empty, /ยังไม่มีการ์ตูนให้แสดง/);
});

test('payment summary keeps button labels and disabled states in sync', async () => {
    const path = '/src/pages/wallet/components/PaymentSummary.jsx';
    const props = { coinPackage: { name: 'Starter', coinAmount: 100, price: 50 }, paymentMethodId: '1' };
    const ready = await render(path, props);
    assert.match(ready, /สร้าง QR Code เพื่อชำระเงิน/);
    assert.doesNotMatch(ready, /disabled=""/);
    const paying = await render(path, { ...props, paying: true, payment: { amount: 50 } });
    assert.match(paying, /กำลังสร้าง QR Code/);
    assert.match(paying, /disabled=""/);
    const paid = await render(path, { ...props, payment: { amount: 50 } });
    assert.match(paid, /สร้างรายการชำระเงินแล้ว/);
    assert.match(paid, /disabled=""/);
    const missingMethod = await render(path, { ...props, paymentMethodId: '' });
    assert.match(missingMethod, /disabled=""/);
});

test('author search retains a submit button and associated form labels', async () => {
    const html = await render('/src/pages/author-search/components/AuthorSearchForm.jsx', {
        username: '', sort: 'latest', navigateSearch() {}, submit() {},
    });
    assert.match(html, /<button type="submit"/);
    assert.match(html, /<label[^>]*><span>ชื่อผู้ใช้<\/span>\s*<input/);
    assert.match(html, /<label[^>]*><span>เรียงตาม<\/span>\s*<select/);
});

test('chapter editor exposes a named native dialog and explicit actions', async () => {
    const html = await render('/src/pages/comic-management/components/chapter/ChapterEditorModal.jsx', {
        form: { chapterNumber: 1, coinCost: 0, title: '' }, files: [], existingPages: [],
        isEdit: false, saving: false, onChange() {}, onFilesChange() {},
        onRemoveExistingPage() {}, onCancel() {}, onSubmit() {},
    });
    assert.match(html, /<dialog[^>]*aria-label="เพิ่มตอนใหม่"/);
    assert.match(html, /type="submit"/);
    assert.match(html, /อัปโหลดและเพิ่มตอน/);
    assert.doesNotMatch(html, /role="dialog"/);
});
