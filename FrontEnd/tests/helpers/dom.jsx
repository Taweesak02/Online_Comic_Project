import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, vi } from 'vitest';

export function setupTestDom() {
    const dom = {};
    beforeEach(() => {
        globalThis.IS_REACT_ACT_ENVIRONMENT = true;
        dom.container = document.createElement('div');
        document.body.append(dom.container);
        dom.root = createRoot(dom.container);
        // jsdom does not implement the native dialog lifecycle.
        Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
            configurable: true, value() { this.open = true; },
        });
        Object.defineProperty(HTMLDialogElement.prototype, 'close', {
            configurable: true, value() { this.open = false; },
        });
    });
    afterEach(async () => {
        await act(async () => dom.root.unmount());
        dom.container.remove();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.useRealTimers();
        delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    });
    dom.render = async (element, entries = ['/']) => {
        await act(async () => dom.root.render(<MemoryRouter initialEntries={entries}>{element}</MemoryRouter>));
    };
    dom.find = (selector) => dom.container.querySelector(selector);
    dom.all = (selector) => [...dom.container.querySelectorAll(selector)];
    dom.button = (text) => dom.all('button').find(item => item.textContent.trim() === text);
    return dom;
}

export const click = async (element) => { await act(async () => element.click()); };
export const submit = async (element) => {
    await act(async () => element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
};
export const change = async (element, value) => {
    await act(async () => {
        const prototype = Object.getPrototypeOf(element);
        Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
    });
};
export const upload = async (element, files) => {
    await act(async () => {
        Object.defineProperty(element, 'files', { configurable: true, value: files });
        element.dispatchEvent(new Event('change', { bubbles: true }));
    });
};
export function deferred() {
    let resolve;
    let reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    return { promise, resolve, reject };
}
