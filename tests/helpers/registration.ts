import {Address,beginCell} from '@ton/core';
import {keyPairFromSeed,sign} from '@ton/crypto';
import {createHash} from 'crypto';
// Deterministic sandbox-only key, never a production key.
export const fixtureKey=keyPairFromSeed(Buffer.alloc(32,31));
export const fixtureNodeId=BigInt('0x'+createHash('sha256').update(fixtureKey.publicKey).digest('hex'));
export function registration(registry:Address,owner:Address,changes:Record<string,any>={}){
 const m={$$type:'RegisterNodeSignedV3' as const,nodeId:fixtureNodeId,publicKey:BigInt('0x'+fixtureKey.publicKey.toString('hex')),genesisHash:0n,nodeType:2n,capabilities:7n,region:3n,expiry:BigInt(Math.floor(Date.now()/1000)+600),...changes};
 const identity=beginCell().storeUint(m.nodeId,256).storeUint(m.publicKey,256).storeUint(m.genesisHash,256).storeUint(m.nodeType,8).storeUint(m.capabilities,32).storeUint(m.region,8).endCell().hash();
 const hash=beginCell().storeUint(0x47535203,32).storeAddress(registry).storeAddress(owner).storeBuffer(identity).storeUint(m.expiry,64).endCell().hash();
 return {...m,signature:beginCell().storeBuffer(sign(hash,fixtureKey.secretKey)).endCell()};
}
