import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const reportPath = path.join(root, 'coverage/lcov.info');
const report = await readFile(reportPath, 'utf8');
let files = 0;
let coveredLines = 0;
const normalized = [];
for (const line of report.split(/\r?\n/)) {
    if (line.startsWith('SF:')) {
        const source = path.resolve(root, line.slice(3).replaceAll('\\', '/'));
        const relative = path.relative(root, source).replaceAll('\\', '/');
        if (!relative.startsWith('src/') || !(await stat(source)).isFile()) {
            throw new Error(`Coverage source cannot be resolved inside src/: ${line.slice(3)}`);
        }
        normalized.push(`SF:${relative}`);
        files += 1;
    } else {
        normalized.push(line);
        if (line.startsWith('LH:')) coveredLines += Number(line.slice(3));
    }
}
if (!files || !coveredLines) throw new Error('Coverage report is empty or has no covered source lines. Run npm run test:coverage.');
await writeFile(reportPath, normalized.join('\n'));
console.log(`SonarQube LCOV ready: ${files} source files, ${coveredLines} covered lines. Run the scanner from ${root}`);
