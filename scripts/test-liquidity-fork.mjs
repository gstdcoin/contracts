// Read-only public chain snapshot, followed by real-code local TVM execution.
// No wallet keys, signatures or chain broadcasts are used by this command.
import {mkdtemp, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

const npm = process.env.npm_execpath;
if (!npm) throw Error('Run through npm run test:liquidity:fork');
const temporary = await mkdtemp(join(tmpdir(), 'gstd-liquidity-fork-'));
const fixture = process.env.GSTD_STON_FORK_FIXTURE
  ? resolve(process.env.GSTD_STON_FORK_FIXTURE) : join(temporary, 'snapshot.json');
function run(args, env = process.env) {
  const result = spawnSync(process.execPath, args, {env, stdio:'inherit', timeout:300_000});
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error('Liquidity verification command failed: ' + result.status);
}
run([npm, 'run', 'check:matcher']);
if (!process.env.GSTD_STON_FORK_FIXTURE) run(['scripts/capture-liquidity-fork.mjs', fixture]);
const raw = await readFile(fixture);
const snapshot = JSON.parse(raw);
if (snapshot.real_transactions !== false || snapshot.accounts?.length !== 4
  || !Object.keys(snapshot.libraries || {}).length || !Number.isFinite(Date.parse(snapshot.captured_at))) {
  throw Error('Invalid read-only liquidity fixture');
}
run([npm, 'run', 'test:liquidity'], {...process.env, GSTD_STON_FORK_FIXTURE:fixture});
const evidence = {
  captured_at:snapshot.captured_at, verified_at:new Date().toISOString(),
  source:snapshot.source, requests:snapshot.requests,
  fixture_sha256:createHash('sha256').update(raw).digest('hex'),
  accounts:snapshot.accounts.length, libraries:Object.keys(snapshot.libraries).length,
  real_transactions:false, verification:'liquidity_component_and_real_code_fork_passed',
};
await writeFile(join(temporary, 'result.json'), JSON.stringify(evidence, null, 2) + '\n', {flag:'wx'});
console.log(JSON.stringify({...evidence, evidence_directory:temporary}));
