import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        maxWorkers: 4,
        include: ['tests/**/*.test.{js,jsx}'],
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{js,jsx}'],
            reporter: ['text-summary', 'lcov', 'html'],
            reportsDirectory: 'coverage',
        },
    },
});
