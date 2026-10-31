// Run the current regression checks for the former audit findings and player systems.
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const jest=path.join(root,'node_modules','jest','bin','jest.js');
const result=spawnSync(process.execPath,[jest,'--runInBand','tests/empire.test.ts'],{cwd:root,stdio:'inherit'});
process.exitCode=result.status??1;
