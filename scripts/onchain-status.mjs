const call = async (a, m, stack = []) => {
    const r = await fetch('https://toncenter.com/api/v2/runGetMethod', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: a, method: m, stack }) });
    const j = await r.json();
    await new Promise(r => setTimeout(r, 1200));
    return j.ok ? j.result : { err: j.error || j };
};
const show = (r) => r.err ? r.err : (r.stack || []).map(s => Array.isArray(s) ? s[1]?.value ?? JSON.stringify(s[1]) : s).join(' | ');
const JET = 'EQDv6cYW9nNiKjN3Nwl8D6ABjUiH1gYfWVGZhfP7-9tZskTO';
const SM2 = 'EQCi-QjafvcYE7wgl9Dc5jAFJrmiy_oGfcobzORb2gZQezhE';
const TRE = 'EQAbtTCsty8-gpX-45eotGWxnYG1c7ew7NFsZ9LJBRiv_Ii_';
for (const [n, a, m] of [
    ['jetton data', JET, 'get_jetton_data'], ['jetton authority', JET, 'get_mint_authority'], ['jetton max', JET, 'get_max_supply'], ['jetton burn', JET, 'get_burn_stats'],
    ['SM2 paused', SM2, 'is_paused'], ['SM2 quorum', SM2, 'get_quorum_threshold'], ['SM2 stats', SM2, 'get_settlement_stats'], ['SM2 addrs', SM2, 'get_addresses'], ['SM2 split', SM2, 'get_revenue_split'],
    ['TRE owner', TRE, 'owner'],
]) console.log(n, '=>', show(await call(a, m)));
for (const [n, a] of [['jetton', JET], ['SM2', SM2], ['treasury', TRE]]) {
    const r = await (await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${a}`)).json();
    console.log(n, 'balance TON', Number(r.result) / 1e9); await new Promise(r => setTimeout(r, 1200));
}
