import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function loadGetterTupleDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

export function storeTupleDeploy(source: Deploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}

export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function loadGetterTupleDeployOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

export function storeTupleDeployOk(source: DeployOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

export function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}

export type FactoryDeploy = {
    $$type: 'FactoryDeploy';
    queryId: bigint;
    cashback: Address;
}

export function storeFactoryDeploy(src: FactoryDeploy) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1829761339, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.cashback);
    };
}

export function loadFactoryDeploy(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1829761339) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _cashback = sc_0.loadAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function loadGetterTupleFactoryDeploy(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _cashback = source.readAddress();
    return { $$type: 'FactoryDeploy' as const, queryId: _queryId, cashback: _cashback };
}

export function storeTupleFactoryDeploy(source: FactoryDeploy) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.cashback);
    return builder.build();
}

export function dictValueParserFactoryDeploy(): DictionaryValue<FactoryDeploy> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFactoryDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadFactoryDeploy(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwner(source: ChangeOwner) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type RegisterNode = {
    $$type: 'RegisterNode';
    nodeId: bigint;
    nodeType: bigint;
    publicKey: Slice;
    genesisHash: bigint;
    capabilities: bigint;
    region: bigint;
}

export function storeRegisterNode(src: RegisterNode) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1868853951, 32);
        b_0.storeUint(src.nodeId, 256);
        b_0.storeUint(src.nodeType, 8);
        b_0.storeRef(src.publicKey.asCell());
        b_0.storeUint(src.genesisHash, 256);
        b_0.storeUint(src.capabilities, 32);
        b_0.storeUint(src.region, 8);
    };
}

export function loadRegisterNode(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1868853951) { throw Error('Invalid prefix'); }
    const _nodeId = sc_0.loadUintBig(256);
    const _nodeType = sc_0.loadUintBig(8);
    const _publicKey = sc_0.loadRef().asSlice();
    const _genesisHash = sc_0.loadUintBig(256);
    const _capabilities = sc_0.loadUintBig(32);
    const _region = sc_0.loadUintBig(8);
    return { $$type: 'RegisterNode' as const, nodeId: _nodeId, nodeType: _nodeType, publicKey: _publicKey, genesisHash: _genesisHash, capabilities: _capabilities, region: _region };
}

export function loadTupleRegisterNode(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _nodeType = source.readBigNumber();
    const _publicKey = source.readCell().asSlice();
    const _genesisHash = source.readBigNumber();
    const _capabilities = source.readBigNumber();
    const _region = source.readBigNumber();
    return { $$type: 'RegisterNode' as const, nodeId: _nodeId, nodeType: _nodeType, publicKey: _publicKey, genesisHash: _genesisHash, capabilities: _capabilities, region: _region };
}

export function loadGetterTupleRegisterNode(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _nodeType = source.readBigNumber();
    const _publicKey = source.readCell().asSlice();
    const _genesisHash = source.readBigNumber();
    const _capabilities = source.readBigNumber();
    const _region = source.readBigNumber();
    return { $$type: 'RegisterNode' as const, nodeId: _nodeId, nodeType: _nodeType, publicKey: _publicKey, genesisHash: _genesisHash, capabilities: _capabilities, region: _region };
}

export function storeTupleRegisterNode(source: RegisterNode) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.nodeId);
    builder.writeNumber(source.nodeType);
    builder.writeSlice(source.publicKey.asCell());
    builder.writeNumber(source.genesisHash);
    builder.writeNumber(source.capabilities);
    builder.writeNumber(source.region);
    return builder.build();
}

export function dictValueParserRegisterNode(): DictionaryValue<RegisterNode> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRegisterNode(src)).endCell());
        },
        parse: (src) => {
            return loadRegisterNode(src.loadRef().beginParse());
        }
    }
}

export type UpdateNodeStatus = {
    $$type: 'UpdateNodeStatus';
    nodeId: bigint;
    status: bigint;
    reason: string;
}

export function storeUpdateNodeStatus(src: UpdateNodeStatus) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(830122057, 32);
        b_0.storeUint(src.nodeId, 256);
        b_0.storeUint(src.status, 8);
        b_0.storeStringRefTail(src.reason);
    };
}

export function loadUpdateNodeStatus(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 830122057) { throw Error('Invalid prefix'); }
    const _nodeId = sc_0.loadUintBig(256);
    const _status = sc_0.loadUintBig(8);
    const _reason = sc_0.loadStringRefTail();
    return { $$type: 'UpdateNodeStatus' as const, nodeId: _nodeId, status: _status, reason: _reason };
}

export function loadTupleUpdateNodeStatus(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _status = source.readBigNumber();
    const _reason = source.readString();
    return { $$type: 'UpdateNodeStatus' as const, nodeId: _nodeId, status: _status, reason: _reason };
}

export function loadGetterTupleUpdateNodeStatus(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _status = source.readBigNumber();
    const _reason = source.readString();
    return { $$type: 'UpdateNodeStatus' as const, nodeId: _nodeId, status: _status, reason: _reason };
}

export function storeTupleUpdateNodeStatus(source: UpdateNodeStatus) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.nodeId);
    builder.writeNumber(source.status);
    builder.writeString(source.reason);
    return builder.build();
}

export function dictValueParserUpdateNodeStatus(): DictionaryValue<UpdateNodeStatus> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateNodeStatus(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateNodeStatus(src.loadRef().beginParse());
        }
    }
}

export type UpdateReputation = {
    $$type: 'UpdateReputation';
    nodeId: bigint;
    qualityDelta: bigint;
    uptimeDelta: bigint;
    tasksDelta: bigint;
}

export function storeUpdateReputation(src: UpdateReputation) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2787149265, 32);
        b_0.storeUint(src.nodeId, 256);
        b_0.storeInt(src.qualityDelta, 32);
        b_0.storeInt(src.uptimeDelta, 32);
        b_0.storeUint(src.tasksDelta, 32);
    };
}

export function loadUpdateReputation(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2787149265) { throw Error('Invalid prefix'); }
    const _nodeId = sc_0.loadUintBig(256);
    const _qualityDelta = sc_0.loadIntBig(32);
    const _uptimeDelta = sc_0.loadIntBig(32);
    const _tasksDelta = sc_0.loadUintBig(32);
    return { $$type: 'UpdateReputation' as const, nodeId: _nodeId, qualityDelta: _qualityDelta, uptimeDelta: _uptimeDelta, tasksDelta: _tasksDelta };
}

export function loadTupleUpdateReputation(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _qualityDelta = source.readBigNumber();
    const _uptimeDelta = source.readBigNumber();
    const _tasksDelta = source.readBigNumber();
    return { $$type: 'UpdateReputation' as const, nodeId: _nodeId, qualityDelta: _qualityDelta, uptimeDelta: _uptimeDelta, tasksDelta: _tasksDelta };
}

export function loadGetterTupleUpdateReputation(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _qualityDelta = source.readBigNumber();
    const _uptimeDelta = source.readBigNumber();
    const _tasksDelta = source.readBigNumber();
    return { $$type: 'UpdateReputation' as const, nodeId: _nodeId, qualityDelta: _qualityDelta, uptimeDelta: _uptimeDelta, tasksDelta: _tasksDelta };
}

export function storeTupleUpdateReputation(source: UpdateReputation) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.nodeId);
    builder.writeNumber(source.qualityDelta);
    builder.writeNumber(source.uptimeDelta);
    builder.writeNumber(source.tasksDelta);
    return builder.build();
}

export function dictValueParserUpdateReputation(): DictionaryValue<UpdateReputation> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateReputation(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateReputation(src.loadRef().beginParse());
        }
    }
}

export type ReportGenesisViolation = {
    $$type: 'ReportGenesisViolation';
    nodeId: bigint;
    reporterNodeId: bigint;
    evidenceHash: bigint;
}

export function storeReportGenesisViolation(src: ReportGenesisViolation) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1141050109, 32);
        b_0.storeUint(src.nodeId, 256);
        b_0.storeUint(src.reporterNodeId, 256);
        b_0.storeUint(src.evidenceHash, 256);
    };
}

export function loadReportGenesisViolation(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1141050109) { throw Error('Invalid prefix'); }
    const _nodeId = sc_0.loadUintBig(256);
    const _reporterNodeId = sc_0.loadUintBig(256);
    const _evidenceHash = sc_0.loadUintBig(256);
    return { $$type: 'ReportGenesisViolation' as const, nodeId: _nodeId, reporterNodeId: _reporterNodeId, evidenceHash: _evidenceHash };
}

export function loadTupleReportGenesisViolation(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _reporterNodeId = source.readBigNumber();
    const _evidenceHash = source.readBigNumber();
    return { $$type: 'ReportGenesisViolation' as const, nodeId: _nodeId, reporterNodeId: _reporterNodeId, evidenceHash: _evidenceHash };
}

export function loadGetterTupleReportGenesisViolation(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _reporterNodeId = source.readBigNumber();
    const _evidenceHash = source.readBigNumber();
    return { $$type: 'ReportGenesisViolation' as const, nodeId: _nodeId, reporterNodeId: _reporterNodeId, evidenceHash: _evidenceHash };
}

export function storeTupleReportGenesisViolation(source: ReportGenesisViolation) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.nodeId);
    builder.writeNumber(source.reporterNodeId);
    builder.writeNumber(source.evidenceHash);
    return builder.build();
}

export function dictValueParserReportGenesisViolation(): DictionaryValue<ReportGenesisViolation> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeReportGenesisViolation(src)).endCell());
        },
        parse: (src) => {
            return loadReportGenesisViolation(src.loadRef().beginParse());
        }
    }
}

export type SetGenesisManifest = {
    $$type: 'SetGenesisManifest';
    version: bigint;
    manifestHash: bigint;
}

export function storeSetGenesisManifest(src: SetGenesisManifest) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2346698756, 32);
        b_0.storeUint(src.version, 32);
        b_0.storeUint(src.manifestHash, 256);
    };
}

export function loadSetGenesisManifest(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2346698756) { throw Error('Invalid prefix'); }
    const _version = sc_0.loadUintBig(32);
    const _manifestHash = sc_0.loadUintBig(256);
    return { $$type: 'SetGenesisManifest' as const, version: _version, manifestHash: _manifestHash };
}

export function loadTupleSetGenesisManifest(source: TupleReader) {
    const _version = source.readBigNumber();
    const _manifestHash = source.readBigNumber();
    return { $$type: 'SetGenesisManifest' as const, version: _version, manifestHash: _manifestHash };
}

export function loadGetterTupleSetGenesisManifest(source: TupleReader) {
    const _version = source.readBigNumber();
    const _manifestHash = source.readBigNumber();
    return { $$type: 'SetGenesisManifest' as const, version: _version, manifestHash: _manifestHash };
}

export function storeTupleSetGenesisManifest(source: SetGenesisManifest) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.version);
    builder.writeNumber(source.manifestHash);
    return builder.build();
}

export function dictValueParserSetGenesisManifest(): DictionaryValue<SetGenesisManifest> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetGenesisManifest(src)).endCell());
        },
        parse: (src) => {
            return loadSetGenesisManifest(src.loadRef().beginParse());
        }
    }
}

export type SlashNode = {
    $$type: 'SlashNode';
    nodeId: bigint;
    amount: bigint;
    reason: string;
}

export function storeSlashNode(src: SlashNode) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2934378540, 32);
        b_0.storeUint(src.nodeId, 256);
        b_0.storeCoins(src.amount);
        b_0.storeStringRefTail(src.reason);
    };
}

export function loadSlashNode(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2934378540) { throw Error('Invalid prefix'); }
    const _nodeId = sc_0.loadUintBig(256);
    const _amount = sc_0.loadCoins();
    const _reason = sc_0.loadStringRefTail();
    return { $$type: 'SlashNode' as const, nodeId: _nodeId, amount: _amount, reason: _reason };
}

export function loadTupleSlashNode(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _reason = source.readString();
    return { $$type: 'SlashNode' as const, nodeId: _nodeId, amount: _amount, reason: _reason };
}

export function loadGetterTupleSlashNode(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _reason = source.readString();
    return { $$type: 'SlashNode' as const, nodeId: _nodeId, amount: _amount, reason: _reason };
}

export function storeTupleSlashNode(source: SlashNode) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.nodeId);
    builder.writeNumber(source.amount);
    builder.writeString(source.reason);
    return builder.build();
}

export function dictValueParserSlashNode(): DictionaryValue<SlashNode> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSlashNode(src)).endCell());
        },
        parse: (src) => {
            return loadSlashNode(src.loadRef().beginParse());
        }
    }
}

export type AgentRegistry$Data = {
    $$type: 'AgentRegistry$Data';
    owner: Address;
    settlementContract: Address;
    totalNodes: bigint;
    activeNodes: bigint;
    totalTasksCompleted: bigint;
    genesisVersion: bigint;
    genesisManifestHash: bigint;
    edgeCount: bigint;
    cpuCount: bigint;
    gpuCount: bigint;
    headCount: bigint;
}

export function storeAgentRegistry$Data(src: AgentRegistry$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.settlementContract);
        b_0.storeUint(src.totalNodes, 64);
        b_0.storeUint(src.activeNodes, 64);
        b_0.storeUint(src.totalTasksCompleted, 64);
        b_0.storeUint(src.genesisVersion, 32);
        b_0.storeUint(src.genesisManifestHash, 256);
        const b_1 = new Builder();
        b_1.storeUint(src.edgeCount, 64);
        b_1.storeUint(src.cpuCount, 64);
        b_1.storeUint(src.gpuCount, 64);
        b_1.storeUint(src.headCount, 64);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadAgentRegistry$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _settlementContract = sc_0.loadAddress();
    const _totalNodes = sc_0.loadUintBig(64);
    const _activeNodes = sc_0.loadUintBig(64);
    const _totalTasksCompleted = sc_0.loadUintBig(64);
    const _genesisVersion = sc_0.loadUintBig(32);
    const _genesisManifestHash = sc_0.loadUintBig(256);
    const sc_1 = sc_0.loadRef().beginParse();
    const _edgeCount = sc_1.loadUintBig(64);
    const _cpuCount = sc_1.loadUintBig(64);
    const _gpuCount = sc_1.loadUintBig(64);
    const _headCount = sc_1.loadUintBig(64);
    return { $$type: 'AgentRegistry$Data' as const, owner: _owner, settlementContract: _settlementContract, totalNodes: _totalNodes, activeNodes: _activeNodes, totalTasksCompleted: _totalTasksCompleted, genesisVersion: _genesisVersion, genesisManifestHash: _genesisManifestHash, edgeCount: _edgeCount, cpuCount: _cpuCount, gpuCount: _gpuCount, headCount: _headCount };
}

export function loadTupleAgentRegistry$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _settlementContract = source.readAddress();
    const _totalNodes = source.readBigNumber();
    const _activeNodes = source.readBigNumber();
    const _totalTasksCompleted = source.readBigNumber();
    const _genesisVersion = source.readBigNumber();
    const _genesisManifestHash = source.readBigNumber();
    const _edgeCount = source.readBigNumber();
    const _cpuCount = source.readBigNumber();
    const _gpuCount = source.readBigNumber();
    const _headCount = source.readBigNumber();
    return { $$type: 'AgentRegistry$Data' as const, owner: _owner, settlementContract: _settlementContract, totalNodes: _totalNodes, activeNodes: _activeNodes, totalTasksCompleted: _totalTasksCompleted, genesisVersion: _genesisVersion, genesisManifestHash: _genesisManifestHash, edgeCount: _edgeCount, cpuCount: _cpuCount, gpuCount: _gpuCount, headCount: _headCount };
}

export function loadGetterTupleAgentRegistry$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _settlementContract = source.readAddress();
    const _totalNodes = source.readBigNumber();
    const _activeNodes = source.readBigNumber();
    const _totalTasksCompleted = source.readBigNumber();
    const _genesisVersion = source.readBigNumber();
    const _genesisManifestHash = source.readBigNumber();
    const _edgeCount = source.readBigNumber();
    const _cpuCount = source.readBigNumber();
    const _gpuCount = source.readBigNumber();
    const _headCount = source.readBigNumber();
    return { $$type: 'AgentRegistry$Data' as const, owner: _owner, settlementContract: _settlementContract, totalNodes: _totalNodes, activeNodes: _activeNodes, totalTasksCompleted: _totalTasksCompleted, genesisVersion: _genesisVersion, genesisManifestHash: _genesisManifestHash, edgeCount: _edgeCount, cpuCount: _cpuCount, gpuCount: _gpuCount, headCount: _headCount };
}

export function storeTupleAgentRegistry$Data(source: AgentRegistry$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.settlementContract);
    builder.writeNumber(source.totalNodes);
    builder.writeNumber(source.activeNodes);
    builder.writeNumber(source.totalTasksCompleted);
    builder.writeNumber(source.genesisVersion);
    builder.writeNumber(source.genesisManifestHash);
    builder.writeNumber(source.edgeCount);
    builder.writeNumber(source.cpuCount);
    builder.writeNumber(source.gpuCount);
    builder.writeNumber(source.headCount);
    return builder.build();
}

export function dictValueParserAgentRegistry$Data(): DictionaryValue<AgentRegistry$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeAgentRegistry$Data(src)).endCell());
        },
        parse: (src) => {
            return loadAgentRegistry$Data(src.loadRef().beginParse());
        }
    }
}

export type NodeIdentity$Data = {
    $$type: 'NodeIdentity$Data';
    nodeId: bigint;
    registry: Address;
    owner: Address;
    nodeType: bigint;
    capabilities: bigint;
    region: bigint;
    qualityScore: bigint;
    uptimeScore: bigint;
    tasksCompleted: bigint;
    status: bigint;
    registeredAt: bigint;
    lastActiveAt: bigint;
}

export function storeNodeIdentity$Data(src: NodeIdentity$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.nodeId, 256);
        b_0.storeAddress(src.registry);
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.nodeType, 8);
        b_0.storeUint(src.capabilities, 32);
        b_0.storeUint(src.region, 8);
        b_0.storeInt(src.qualityScore, 64);
        b_0.storeInt(src.uptimeScore, 64);
        const b_1 = new Builder();
        b_1.storeUint(src.tasksCompleted, 64);
        b_1.storeUint(src.status, 8);
        b_1.storeUint(src.registeredAt, 64);
        b_1.storeUint(src.lastActiveAt, 64);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadNodeIdentity$Data(slice: Slice) {
    const sc_0 = slice;
    const _nodeId = sc_0.loadUintBig(256);
    const _registry = sc_0.loadAddress();
    const _owner = sc_0.loadAddress();
    const _nodeType = sc_0.loadUintBig(8);
    const _capabilities = sc_0.loadUintBig(32);
    const _region = sc_0.loadUintBig(8);
    const _qualityScore = sc_0.loadIntBig(64);
    const _uptimeScore = sc_0.loadIntBig(64);
    const sc_1 = sc_0.loadRef().beginParse();
    const _tasksCompleted = sc_1.loadUintBig(64);
    const _status = sc_1.loadUintBig(8);
    const _registeredAt = sc_1.loadUintBig(64);
    const _lastActiveAt = sc_1.loadUintBig(64);
    return { $$type: 'NodeIdentity$Data' as const, nodeId: _nodeId, registry: _registry, owner: _owner, nodeType: _nodeType, capabilities: _capabilities, region: _region, qualityScore: _qualityScore, uptimeScore: _uptimeScore, tasksCompleted: _tasksCompleted, status: _status, registeredAt: _registeredAt, lastActiveAt: _lastActiveAt };
}

export function loadTupleNodeIdentity$Data(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _registry = source.readAddress();
    const _owner = source.readAddress();
    const _nodeType = source.readBigNumber();
    const _capabilities = source.readBigNumber();
    const _region = source.readBigNumber();
    const _qualityScore = source.readBigNumber();
    const _uptimeScore = source.readBigNumber();
    const _tasksCompleted = source.readBigNumber();
    const _status = source.readBigNumber();
    const _registeredAt = source.readBigNumber();
    const _lastActiveAt = source.readBigNumber();
    return { $$type: 'NodeIdentity$Data' as const, nodeId: _nodeId, registry: _registry, owner: _owner, nodeType: _nodeType, capabilities: _capabilities, region: _region, qualityScore: _qualityScore, uptimeScore: _uptimeScore, tasksCompleted: _tasksCompleted, status: _status, registeredAt: _registeredAt, lastActiveAt: _lastActiveAt };
}

export function loadGetterTupleNodeIdentity$Data(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _registry = source.readAddress();
    const _owner = source.readAddress();
    const _nodeType = source.readBigNumber();
    const _capabilities = source.readBigNumber();
    const _region = source.readBigNumber();
    const _qualityScore = source.readBigNumber();
    const _uptimeScore = source.readBigNumber();
    const _tasksCompleted = source.readBigNumber();
    const _status = source.readBigNumber();
    const _registeredAt = source.readBigNumber();
    const _lastActiveAt = source.readBigNumber();
    return { $$type: 'NodeIdentity$Data' as const, nodeId: _nodeId, registry: _registry, owner: _owner, nodeType: _nodeType, capabilities: _capabilities, region: _region, qualityScore: _qualityScore, uptimeScore: _uptimeScore, tasksCompleted: _tasksCompleted, status: _status, registeredAt: _registeredAt, lastActiveAt: _lastActiveAt };
}

export function storeTupleNodeIdentity$Data(source: NodeIdentity$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.nodeId);
    builder.writeAddress(source.registry);
    builder.writeAddress(source.owner);
    builder.writeNumber(source.nodeType);
    builder.writeNumber(source.capabilities);
    builder.writeNumber(source.region);
    builder.writeNumber(source.qualityScore);
    builder.writeNumber(source.uptimeScore);
    builder.writeNumber(source.tasksCompleted);
    builder.writeNumber(source.status);
    builder.writeNumber(source.registeredAt);
    builder.writeNumber(source.lastActiveAt);
    return builder.build();
}

export function dictValueParserNodeIdentity$Data(): DictionaryValue<NodeIdentity$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNodeIdentity$Data(src)).endCell());
        },
        parse: (src) => {
            return loadNodeIdentity$Data(src.loadRef().beginParse());
        }
    }
}

export type NetworkStats = {
    $$type: 'NetworkStats';
    totalNodes: bigint;
    activeNodes: bigint;
    totalTasksCompleted: bigint;
    edgeCount: bigint;
    cpuCount: bigint;
    gpuCount: bigint;
    headCount: bigint;
}

export function storeNetworkStats(src: NetworkStats) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.totalNodes, 64);
        b_0.storeUint(src.activeNodes, 64);
        b_0.storeUint(src.totalTasksCompleted, 64);
        b_0.storeUint(src.edgeCount, 64);
        b_0.storeUint(src.cpuCount, 64);
        b_0.storeUint(src.gpuCount, 64);
        b_0.storeUint(src.headCount, 64);
    };
}

export function loadNetworkStats(slice: Slice) {
    const sc_0 = slice;
    const _totalNodes = sc_0.loadUintBig(64);
    const _activeNodes = sc_0.loadUintBig(64);
    const _totalTasksCompleted = sc_0.loadUintBig(64);
    const _edgeCount = sc_0.loadUintBig(64);
    const _cpuCount = sc_0.loadUintBig(64);
    const _gpuCount = sc_0.loadUintBig(64);
    const _headCount = sc_0.loadUintBig(64);
    return { $$type: 'NetworkStats' as const, totalNodes: _totalNodes, activeNodes: _activeNodes, totalTasksCompleted: _totalTasksCompleted, edgeCount: _edgeCount, cpuCount: _cpuCount, gpuCount: _gpuCount, headCount: _headCount };
}

export function loadTupleNetworkStats(source: TupleReader) {
    const _totalNodes = source.readBigNumber();
    const _activeNodes = source.readBigNumber();
    const _totalTasksCompleted = source.readBigNumber();
    const _edgeCount = source.readBigNumber();
    const _cpuCount = source.readBigNumber();
    const _gpuCount = source.readBigNumber();
    const _headCount = source.readBigNumber();
    return { $$type: 'NetworkStats' as const, totalNodes: _totalNodes, activeNodes: _activeNodes, totalTasksCompleted: _totalTasksCompleted, edgeCount: _edgeCount, cpuCount: _cpuCount, gpuCount: _gpuCount, headCount: _headCount };
}

export function loadGetterTupleNetworkStats(source: TupleReader) {
    const _totalNodes = source.readBigNumber();
    const _activeNodes = source.readBigNumber();
    const _totalTasksCompleted = source.readBigNumber();
    const _edgeCount = source.readBigNumber();
    const _cpuCount = source.readBigNumber();
    const _gpuCount = source.readBigNumber();
    const _headCount = source.readBigNumber();
    return { $$type: 'NetworkStats' as const, totalNodes: _totalNodes, activeNodes: _activeNodes, totalTasksCompleted: _totalTasksCompleted, edgeCount: _edgeCount, cpuCount: _cpuCount, gpuCount: _gpuCount, headCount: _headCount };
}

export function storeTupleNetworkStats(source: NetworkStats) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalNodes);
    builder.writeNumber(source.activeNodes);
    builder.writeNumber(source.totalTasksCompleted);
    builder.writeNumber(source.edgeCount);
    builder.writeNumber(source.cpuCount);
    builder.writeNumber(source.gpuCount);
    builder.writeNumber(source.headCount);
    return builder.build();
}

export function dictValueParserNetworkStats(): DictionaryValue<NetworkStats> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNetworkStats(src)).endCell());
        },
        parse: (src) => {
            return loadNetworkStats(src.loadRef().beginParse());
        }
    }
}

export type GenesisManifestData = {
    $$type: 'GenesisManifestData';
    version: bigint;
    manifestHash: bigint;
}

export function storeGenesisManifestData(src: GenesisManifestData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.version, 32);
        b_0.storeUint(src.manifestHash, 256);
    };
}

export function loadGenesisManifestData(slice: Slice) {
    const sc_0 = slice;
    const _version = sc_0.loadUintBig(32);
    const _manifestHash = sc_0.loadUintBig(256);
    return { $$type: 'GenesisManifestData' as const, version: _version, manifestHash: _manifestHash };
}

export function loadTupleGenesisManifestData(source: TupleReader) {
    const _version = source.readBigNumber();
    const _manifestHash = source.readBigNumber();
    return { $$type: 'GenesisManifestData' as const, version: _version, manifestHash: _manifestHash };
}

export function loadGetterTupleGenesisManifestData(source: TupleReader) {
    const _version = source.readBigNumber();
    const _manifestHash = source.readBigNumber();
    return { $$type: 'GenesisManifestData' as const, version: _version, manifestHash: _manifestHash };
}

export function storeTupleGenesisManifestData(source: GenesisManifestData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.version);
    builder.writeNumber(source.manifestHash);
    return builder.build();
}

export function dictValueParserGenesisManifestData(): DictionaryValue<GenesisManifestData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGenesisManifestData(src)).endCell());
        },
        parse: (src) => {
            return loadGenesisManifestData(src.loadRef().beginParse());
        }
    }
}

export type NodeInfo = {
    $$type: 'NodeInfo';
    nodeId: bigint;
    owner: Address;
    nodeType: bigint;
    capabilities: bigint;
    region: bigint;
    qualityScore: bigint;
    uptimeScore: bigint;
    tasksCompleted: bigint;
    status: bigint;
    registeredAt: bigint;
    lastActiveAt: bigint;
}

export function storeNodeInfo(src: NodeInfo) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.nodeId, 256);
        b_0.storeAddress(src.owner);
        b_0.storeUint(src.nodeType, 8);
        b_0.storeUint(src.capabilities, 32);
        b_0.storeUint(src.region, 8);
        b_0.storeInt(src.qualityScore, 64);
        b_0.storeInt(src.uptimeScore, 64);
        b_0.storeUint(src.tasksCompleted, 64);
        b_0.storeUint(src.status, 8);
        b_0.storeUint(src.registeredAt, 64);
        b_0.storeUint(src.lastActiveAt, 64);
    };
}

export function loadNodeInfo(slice: Slice) {
    const sc_0 = slice;
    const _nodeId = sc_0.loadUintBig(256);
    const _owner = sc_0.loadAddress();
    const _nodeType = sc_0.loadUintBig(8);
    const _capabilities = sc_0.loadUintBig(32);
    const _region = sc_0.loadUintBig(8);
    const _qualityScore = sc_0.loadIntBig(64);
    const _uptimeScore = sc_0.loadIntBig(64);
    const _tasksCompleted = sc_0.loadUintBig(64);
    const _status = sc_0.loadUintBig(8);
    const _registeredAt = sc_0.loadUintBig(64);
    const _lastActiveAt = sc_0.loadUintBig(64);
    return { $$type: 'NodeInfo' as const, nodeId: _nodeId, owner: _owner, nodeType: _nodeType, capabilities: _capabilities, region: _region, qualityScore: _qualityScore, uptimeScore: _uptimeScore, tasksCompleted: _tasksCompleted, status: _status, registeredAt: _registeredAt, lastActiveAt: _lastActiveAt };
}

export function loadTupleNodeInfo(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _owner = source.readAddress();
    const _nodeType = source.readBigNumber();
    const _capabilities = source.readBigNumber();
    const _region = source.readBigNumber();
    const _qualityScore = source.readBigNumber();
    const _uptimeScore = source.readBigNumber();
    const _tasksCompleted = source.readBigNumber();
    const _status = source.readBigNumber();
    const _registeredAt = source.readBigNumber();
    const _lastActiveAt = source.readBigNumber();
    return { $$type: 'NodeInfo' as const, nodeId: _nodeId, owner: _owner, nodeType: _nodeType, capabilities: _capabilities, region: _region, qualityScore: _qualityScore, uptimeScore: _uptimeScore, tasksCompleted: _tasksCompleted, status: _status, registeredAt: _registeredAt, lastActiveAt: _lastActiveAt };
}

export function loadGetterTupleNodeInfo(source: TupleReader) {
    const _nodeId = source.readBigNumber();
    const _owner = source.readAddress();
    const _nodeType = source.readBigNumber();
    const _capabilities = source.readBigNumber();
    const _region = source.readBigNumber();
    const _qualityScore = source.readBigNumber();
    const _uptimeScore = source.readBigNumber();
    const _tasksCompleted = source.readBigNumber();
    const _status = source.readBigNumber();
    const _registeredAt = source.readBigNumber();
    const _lastActiveAt = source.readBigNumber();
    return { $$type: 'NodeInfo' as const, nodeId: _nodeId, owner: _owner, nodeType: _nodeType, capabilities: _capabilities, region: _region, qualityScore: _qualityScore, uptimeScore: _uptimeScore, tasksCompleted: _tasksCompleted, status: _status, registeredAt: _registeredAt, lastActiveAt: _lastActiveAt };
}

export function storeTupleNodeInfo(source: NodeInfo) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.nodeId);
    builder.writeAddress(source.owner);
    builder.writeNumber(source.nodeType);
    builder.writeNumber(source.capabilities);
    builder.writeNumber(source.region);
    builder.writeNumber(source.qualityScore);
    builder.writeNumber(source.uptimeScore);
    builder.writeNumber(source.tasksCompleted);
    builder.writeNumber(source.status);
    builder.writeNumber(source.registeredAt);
    builder.writeNumber(source.lastActiveAt);
    return builder.build();
}

export function dictValueParserNodeInfo(): DictionaryValue<NodeInfo> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeNodeInfo(src)).endCell());
        },
        parse: (src) => {
            return loadNodeInfo(src.loadRef().beginParse());
        }
    }
}

 type NodeIdentity_init_args = {
    $$type: 'NodeIdentity_init_args';
    nodeId: bigint;
    registry: Address;
    owner: Address;
    nodeType: bigint;
    capabilities: bigint;
    region: bigint;
}

function initNodeIdentity_init_args(src: NodeIdentity_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.nodeId, 257);
        b_0.storeAddress(src.registry);
        b_0.storeAddress(src.owner);
        const b_1 = new Builder();
        b_1.storeInt(src.nodeType, 257);
        b_1.storeInt(src.capabilities, 257);
        b_1.storeInt(src.region, 257);
        b_0.storeRef(b_1.endCell());
    };
}

async function NodeIdentity_init(nodeId: bigint, registry: Address, owner: Address, nodeType: bigint, capabilities: bigint, region: bigint) {
    const __code = Cell.fromHex('b5ee9c7241020901000254000114ff00f4a413f4bcf2c80b0102016202070138d0eda2edfb01d072d721d200d200fa4021103450666f04f86102f8620302eced44d0d200018e2ed3fffa40fa40d307d31fd307d23fd23fd401d0d33fd307d33fd33f30104c104b104a104910481047104610456c1c8e2e810101d700fa40fa40d401d0810101d700810101d700810101d7003010361035103406d1550470530071f823f823e20d925f0de02bd749c21fe3000bf901040601f40bd31f218210a62085d1ba8e61313c0bd3ff31d21fd21fd31f308200ca24f8422cc705f2f45052a05034a002a0f823109b108a10791068105710461035443012c87f01ca0055b050bccbff19ce17ce15cb0713cb1fcb07ca3fca3f01c8cb3f12cb0712cb3f12cb3fcdc9ed54db31e0018210317aa849bae3020b05008831d3ff31d307308200ca24f8422ac705f2f4109b5518c87f01ca0055b050bccbff19ce17ce15cb0713cb1fcb07ca3fca3f01c8cb3f12cb0712cb3f12cb3fcdc9ed54db3100b682f09f31fb7c139e4f1313022f5187d632af397344874ad3c3abb365f301d9d7ab67ba8e30109b5518c87f01ca0055b050bccbff19ce17ce15cb0713cb1fcb07ca3fca3f01c8cb3f12cb0712cb3f12cb3fcdc9ed54e05f0cf2c08201f1a11a6bda89a1a400031c5da7fff481f481a60fa63fa60fa47fa47fa803a1a67fa60fa67fa67e6020982096209420922090208e208c208ad8391c5d020203ae01f481f481a803a1020203ae01020203ae01020203ae0060206c206a20680da2aa08e0a600e3f047f047c5b6787676767676767676767678d835080016547b98547a98547a9853a95edbfc39');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initNodeIdentity_init_args({ $$type: 'NodeIdentity_init_args', nodeId, registry, owner, nodeType, capabilities, region })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const NodeIdentity_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    27658: { message: "Only owner or Settlement" },
    48099: { message: "Genesis manifest mismatch — update your node software" },
    51748: { message: "Only registry" },
    63399: { message: "Only DAO" },
} as const

export const NodeIdentity_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Only owner or Settlement": 27658,
    "Genesis manifest mismatch — update your node software": 48099,
    "Only registry": 51748,
    "Only DAO": 63399,
} as const

const NodeIdentity_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"Deploy","header":2490013878,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"DeployOk","header":2952335191,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"FactoryDeploy","header":1829761339,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cashback","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"RegisterNode","header":1868853951,"fields":[{"name":"nodeId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"nodeType","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"publicKey","type":{"kind":"simple","type":"slice","optional":false}},{"name":"genesisHash","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"capabilities","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"region","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"UpdateNodeStatus","header":830122057,"fields":[{"name":"nodeId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"reason","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"UpdateReputation","header":2787149265,"fields":[{"name":"nodeId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"qualityDelta","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"uptimeDelta","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"tasksDelta","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"ReportGenesisViolation","header":1141050109,"fields":[{"name":"nodeId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"reporterNodeId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"evidenceHash","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"SetGenesisManifest","header":2346698756,"fields":[{"name":"version","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"manifestHash","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"SlashNode","header":2934378540,"fields":[{"name":"nodeId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"reason","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"AgentRegistry$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"settlementContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"totalNodes","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"activeNodes","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"totalTasksCompleted","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"genesisVersion","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"genesisManifestHash","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"edgeCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cpuCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"gpuCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"headCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"NodeIdentity$Data","header":null,"fields":[{"name":"nodeId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"registry","type":{"kind":"simple","type":"address","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"nodeType","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"capabilities","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"region","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"qualityScore","type":{"kind":"simple","type":"int","optional":false,"format":64}},{"name":"uptimeScore","type":{"kind":"simple","type":"int","optional":false,"format":64}},{"name":"tasksCompleted","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"registeredAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"lastActiveAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"NetworkStats","header":null,"fields":[{"name":"totalNodes","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"activeNodes","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"totalTasksCompleted","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"edgeCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cpuCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"gpuCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"headCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"GenesisManifestData","header":null,"fields":[{"name":"version","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"manifestHash","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"NodeInfo","header":null,"fields":[{"name":"nodeId","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"nodeType","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"capabilities","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"region","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"qualityScore","type":{"kind":"simple","type":"int","optional":false,"format":64}},{"name":"uptimeScore","type":{"kind":"simple","type":"int","optional":false,"format":64}},{"name":"tasksCompleted","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"registeredAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"lastActiveAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
]

const NodeIdentity_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "RegisterNode": 1868853951,
    "UpdateNodeStatus": 830122057,
    "UpdateReputation": 2787149265,
    "ReportGenesisViolation": 1141050109,
    "SetGenesisManifest": 2346698756,
    "SlashNode": 2934378540,
}

const NodeIdentity_getters: ABIGetter[] = [
    {"name":"get_node_info","methodId":101685,"arguments":[],"returnType":{"kind":"simple","type":"NodeInfo","optional":false}},
]

export const NodeIdentity_getterMapping: { [key: string]: string } = {
    'get_node_info': 'getGetNodeInfo',
}

const NodeIdentity_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"text","text":"init"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateReputation"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateNodeStatus"}},
]


export class NodeIdentity implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = NodeIdentity_errors_backward;
    public static readonly opcodes = NodeIdentity_opcodes;
    
    static async init(nodeId: bigint, registry: Address, owner: Address, nodeType: bigint, capabilities: bigint, region: bigint) {
        return await NodeIdentity_init(nodeId, registry, owner, nodeType, capabilities, region);
    }
    
    static async fromInit(nodeId: bigint, registry: Address, owner: Address, nodeType: bigint, capabilities: bigint, region: bigint) {
        const __gen_init = await NodeIdentity_init(nodeId, registry, owner, nodeType, capabilities, region);
        const address = contractAddress(0, __gen_init);
        return new NodeIdentity(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new NodeIdentity(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  NodeIdentity_types,
        getters: NodeIdentity_getters,
        receivers: NodeIdentity_receivers,
        errors: NodeIdentity_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: "init" | UpdateReputation | UpdateNodeStatus) {
        
        let body: Cell | null = null;
        if (message === "init") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateReputation') {
            body = beginCell().store(storeUpdateReputation(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateNodeStatus') {
            body = beginCell().store(storeUpdateNodeStatus(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetNodeInfo(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_node_info', builder.build())).stack;
        const result = loadGetterTupleNodeInfo(source);
        return result;
    }
    
}