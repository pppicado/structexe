import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['src/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.spec.ts', 'src/index.ts', 'src/types.ts'],
            thresholds: {
                statements: 60,
                branches: 50,
                functions: 60,
                lines: 60
            }
        }
    }
});
