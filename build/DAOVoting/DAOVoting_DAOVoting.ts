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

export type CreateProposal = {
    $$type: 'CreateProposal';
    title: string;
    descriptionHash: bigint;
    targetContract: Address;
    payload: Cell;
    votingPeriod: bigint;
}

export function storeCreateProposal(src: CreateProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3565067208, 32);
        b_0.storeStringRefTail(src.title);
        b_0.storeUint(src.descriptionHash, 256);
        b_0.storeAddress(src.targetContract);
        b_0.storeRef(src.payload);
        b_0.storeUint(src.votingPeriod, 32);
    };
}

export function loadCreateProposal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3565067208) { throw Error('Invalid prefix'); }
    const _title = sc_0.loadStringRefTail();
    const _descriptionHash = sc_0.loadUintBig(256);
    const _targetContract = sc_0.loadAddress();
    const _payload = sc_0.loadRef();
    const _votingPeriod = sc_0.loadUintBig(32);
    return { $$type: 'CreateProposal' as const, title: _title, descriptionHash: _descriptionHash, targetContract: _targetContract, payload: _payload, votingPeriod: _votingPeriod };
}

export function loadTupleCreateProposal(source: TupleReader) {
    const _title = source.readString();
    const _descriptionHash = source.readBigNumber();
    const _targetContract = source.readAddress();
    const _payload = source.readCell();
    const _votingPeriod = source.readBigNumber();
    return { $$type: 'CreateProposal' as const, title: _title, descriptionHash: _descriptionHash, targetContract: _targetContract, payload: _payload, votingPeriod: _votingPeriod };
}

export function loadGetterTupleCreateProposal(source: TupleReader) {
    const _title = source.readString();
    const _descriptionHash = source.readBigNumber();
    const _targetContract = source.readAddress();
    const _payload = source.readCell();
    const _votingPeriod = source.readBigNumber();
    return { $$type: 'CreateProposal' as const, title: _title, descriptionHash: _descriptionHash, targetContract: _targetContract, payload: _payload, votingPeriod: _votingPeriod };
}

export function storeTupleCreateProposal(source: CreateProposal) {
    const builder = new TupleBuilder();
    builder.writeString(source.title);
    builder.writeNumber(source.descriptionHash);
    builder.writeAddress(source.targetContract);
    builder.writeCell(source.payload);
    builder.writeNumber(source.votingPeriod);
    return builder.build();
}

export function dictValueParserCreateProposal(): DictionaryValue<CreateProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateProposal(src)).endCell());
        },
        parse: (src) => {
            return loadCreateProposal(src.loadRef().beginParse());
        }
    }
}

export type CastVote = {
    $$type: 'CastVote';
    proposalId: bigint;
    support: boolean;
}

export function storeCastVote(src: CastVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1086625183, 32);
        b_0.storeUint(src.proposalId, 64);
        b_0.storeBit(src.support);
    };
}

export function loadCastVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1086625183) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(64);
    const _support = sc_0.loadBit();
    return { $$type: 'CastVote' as const, proposalId: _proposalId, support: _support };
}

export function loadTupleCastVote(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    return { $$type: 'CastVote' as const, proposalId: _proposalId, support: _support };
}

export function loadGetterTupleCastVote(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    return { $$type: 'CastVote' as const, proposalId: _proposalId, support: _support };
}

export function storeTupleCastVote(source: CastVote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    builder.writeBoolean(source.support);
    return builder.build();
}

export function dictValueParserCastVote(): DictionaryValue<CastVote> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCastVote(src)).endCell());
        },
        parse: (src) => {
            return loadCastVote(src.loadRef().beginParse());
        }
    }
}

export type ExecuteProposal = {
    $$type: 'ExecuteProposal';
    proposalId: bigint;
}

export function storeExecuteProposal(src: ExecuteProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2470491975, 32);
        b_0.storeUint(src.proposalId, 64);
    };
}

export function loadExecuteProposal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2470491975) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(64);
    return { $$type: 'ExecuteProposal' as const, proposalId: _proposalId };
}

export function loadTupleExecuteProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    return { $$type: 'ExecuteProposal' as const, proposalId: _proposalId };
}

export function loadGetterTupleExecuteProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    return { $$type: 'ExecuteProposal' as const, proposalId: _proposalId };
}

export function storeTupleExecuteProposal(source: ExecuteProposal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    return builder.build();
}

export function dictValueParserExecuteProposal(): DictionaryValue<ExecuteProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeExecuteProposal(src)).endCell());
        },
        parse: (src) => {
            return loadExecuteProposal(src.loadRef().beginParse());
        }
    }
}

export type CancelProposal = {
    $$type: 'CancelProposal';
    proposalId: bigint;
    reason: string;
}

export function storeCancelProposal(src: CancelProposal) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1785280322, 32);
        b_0.storeUint(src.proposalId, 64);
        b_0.storeStringRefTail(src.reason);
    };
}

export function loadCancelProposal(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1785280322) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(64);
    const _reason = sc_0.loadStringRefTail();
    return { $$type: 'CancelProposal' as const, proposalId: _proposalId, reason: _reason };
}

export function loadTupleCancelProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _reason = source.readString();
    return { $$type: 'CancelProposal' as const, proposalId: _proposalId, reason: _reason };
}

export function loadGetterTupleCancelProposal(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _reason = source.readString();
    return { $$type: 'CancelProposal' as const, proposalId: _proposalId, reason: _reason };
}

export function storeTupleCancelProposal(source: CancelProposal) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    builder.writeString(source.reason);
    return builder.build();
}

export function dictValueParserCancelProposal(): DictionaryValue<CancelProposal> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCancelProposal(src)).endCell());
        },
        parse: (src) => {
            return loadCancelProposal(src.loadRef().beginParse());
        }
    }
}

export type UpdateGovernanceParams = {
    $$type: 'UpdateGovernanceParams';
    quorumPercent: bigint;
    timelockSeconds: bigint;
    minProposalStake: bigint;
}

export function storeUpdateGovernanceParams(src: UpdateGovernanceParams) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2128179073, 32);
        b_0.storeUint(src.quorumPercent, 8);
        b_0.storeUint(src.timelockSeconds, 32);
        b_0.storeCoins(src.minProposalStake);
    };
}

export function loadUpdateGovernanceParams(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2128179073) { throw Error('Invalid prefix'); }
    const _quorumPercent = sc_0.loadUintBig(8);
    const _timelockSeconds = sc_0.loadUintBig(32);
    const _minProposalStake = sc_0.loadCoins();
    return { $$type: 'UpdateGovernanceParams' as const, quorumPercent: _quorumPercent, timelockSeconds: _timelockSeconds, minProposalStake: _minProposalStake };
}

export function loadTupleUpdateGovernanceParams(source: TupleReader) {
    const _quorumPercent = source.readBigNumber();
    const _timelockSeconds = source.readBigNumber();
    const _minProposalStake = source.readBigNumber();
    return { $$type: 'UpdateGovernanceParams' as const, quorumPercent: _quorumPercent, timelockSeconds: _timelockSeconds, minProposalStake: _minProposalStake };
}

export function loadGetterTupleUpdateGovernanceParams(source: TupleReader) {
    const _quorumPercent = source.readBigNumber();
    const _timelockSeconds = source.readBigNumber();
    const _minProposalStake = source.readBigNumber();
    return { $$type: 'UpdateGovernanceParams' as const, quorumPercent: _quorumPercent, timelockSeconds: _timelockSeconds, minProposalStake: _minProposalStake };
}

export function storeTupleUpdateGovernanceParams(source: UpdateGovernanceParams) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.quorumPercent);
    builder.writeNumber(source.timelockSeconds);
    builder.writeNumber(source.minProposalStake);
    return builder.build();
}

export function dictValueParserUpdateGovernanceParams(): DictionaryValue<UpdateGovernanceParams> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateGovernanceParams(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateGovernanceParams(src.loadRef().beginParse());
        }
    }
}

export type DAOVoting$Data = {
    $$type: 'DAOVoting$Data';
    owner: Address;
    gstdJetton: Address;
    quorumPercent: bigint;
    timelockSeconds: bigint;
    minProposalStake: bigint;
    totalStakedGSTD: bigint;
    proposalCount: bigint;
    executedCount: bigint;
    cancelledCount: bigint;
}

export function storeDAOVoting$Data(src: DAOVoting$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.gstdJetton);
        b_0.storeUint(src.quorumPercent, 8);
        b_0.storeUint(src.timelockSeconds, 32);
        b_0.storeCoins(src.minProposalStake);
        b_0.storeCoins(src.totalStakedGSTD);
        b_0.storeUint(src.proposalCount, 64);
        b_0.storeUint(src.executedCount, 64);
        b_0.storeUint(src.cancelledCount, 64);
    };
}

export function loadDAOVoting$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _gstdJetton = sc_0.loadAddress();
    const _quorumPercent = sc_0.loadUintBig(8);
    const _timelockSeconds = sc_0.loadUintBig(32);
    const _minProposalStake = sc_0.loadCoins();
    const _totalStakedGSTD = sc_0.loadCoins();
    const _proposalCount = sc_0.loadUintBig(64);
    const _executedCount = sc_0.loadUintBig(64);
    const _cancelledCount = sc_0.loadUintBig(64);
    return { $$type: 'DAOVoting$Data' as const, owner: _owner, gstdJetton: _gstdJetton, quorumPercent: _quorumPercent, timelockSeconds: _timelockSeconds, minProposalStake: _minProposalStake, totalStakedGSTD: _totalStakedGSTD, proposalCount: _proposalCount, executedCount: _executedCount, cancelledCount: _cancelledCount };
}

export function loadTupleDAOVoting$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _gstdJetton = source.readAddress();
    const _quorumPercent = source.readBigNumber();
    const _timelockSeconds = source.readBigNumber();
    const _minProposalStake = source.readBigNumber();
    const _totalStakedGSTD = source.readBigNumber();
    const _proposalCount = source.readBigNumber();
    const _executedCount = source.readBigNumber();
    const _cancelledCount = source.readBigNumber();
    return { $$type: 'DAOVoting$Data' as const, owner: _owner, gstdJetton: _gstdJetton, quorumPercent: _quorumPercent, timelockSeconds: _timelockSeconds, minProposalStake: _minProposalStake, totalStakedGSTD: _totalStakedGSTD, proposalCount: _proposalCount, executedCount: _executedCount, cancelledCount: _cancelledCount };
}

export function loadGetterTupleDAOVoting$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _gstdJetton = source.readAddress();
    const _quorumPercent = source.readBigNumber();
    const _timelockSeconds = source.readBigNumber();
    const _minProposalStake = source.readBigNumber();
    const _totalStakedGSTD = source.readBigNumber();
    const _proposalCount = source.readBigNumber();
    const _executedCount = source.readBigNumber();
    const _cancelledCount = source.readBigNumber();
    return { $$type: 'DAOVoting$Data' as const, owner: _owner, gstdJetton: _gstdJetton, quorumPercent: _quorumPercent, timelockSeconds: _timelockSeconds, minProposalStake: _minProposalStake, totalStakedGSTD: _totalStakedGSTD, proposalCount: _proposalCount, executedCount: _executedCount, cancelledCount: _cancelledCount };
}

export function storeTupleDAOVoting$Data(source: DAOVoting$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.gstdJetton);
    builder.writeNumber(source.quorumPercent);
    builder.writeNumber(source.timelockSeconds);
    builder.writeNumber(source.minProposalStake);
    builder.writeNumber(source.totalStakedGSTD);
    builder.writeNumber(source.proposalCount);
    builder.writeNumber(source.executedCount);
    builder.writeNumber(source.cancelledCount);
    return builder.build();
}

export function dictValueParserDAOVoting$Data(): DictionaryValue<DAOVoting$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDAOVoting$Data(src)).endCell());
        },
        parse: (src) => {
            return loadDAOVoting$Data(src.loadRef().beginParse());
        }
    }
}

export type Proposal$Data = {
    $$type: 'Proposal$Data';
    proposalId: bigint;
    dao: Address;
    proposer: Address;
    targetContract: Address;
    payload: Cell;
    votesFor: bigint;
    votesAgainst: bigint;
    voterCount: bigint;
    quorumStake: bigint;
    voters: Dictionary<Address, bigint>;
    createdAt: bigint;
    votingEndsAt: bigint;
    executionUnlocksAt: bigint;
    status: bigint;
}

export function storeProposal$Data(src: Proposal$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.proposalId, 64);
        b_0.storeAddress(src.dao);
        b_0.storeAddress(src.proposer);
        b_0.storeAddress(src.targetContract);
        b_0.storeRef(src.payload);
        b_0.storeCoins(src.votesFor);
        const b_1 = new Builder();
        b_1.storeCoins(src.votesAgainst);
        b_1.storeUint(src.voterCount, 32);
        b_1.storeCoins(src.quorumStake);
        b_1.storeDict(src.voters, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257));
        b_1.storeUint(src.createdAt, 64);
        b_1.storeUint(src.votingEndsAt, 64);
        b_1.storeUint(src.executionUnlocksAt, 64);
        b_1.storeUint(src.status, 8);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadProposal$Data(slice: Slice) {
    const sc_0 = slice;
    const _proposalId = sc_0.loadUintBig(64);
    const _dao = sc_0.loadAddress();
    const _proposer = sc_0.loadAddress();
    const _targetContract = sc_0.loadAddress();
    const _payload = sc_0.loadRef();
    const _votesFor = sc_0.loadCoins();
    const sc_1 = sc_0.loadRef().beginParse();
    const _votesAgainst = sc_1.loadCoins();
    const _voterCount = sc_1.loadUintBig(32);
    const _quorumStake = sc_1.loadCoins();
    const _voters = Dictionary.load(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), sc_1);
    const _createdAt = sc_1.loadUintBig(64);
    const _votingEndsAt = sc_1.loadUintBig(64);
    const _executionUnlocksAt = sc_1.loadUintBig(64);
    const _status = sc_1.loadUintBig(8);
    return { $$type: 'Proposal$Data' as const, proposalId: _proposalId, dao: _dao, proposer: _proposer, targetContract: _targetContract, payload: _payload, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, quorumStake: _quorumStake, voters: _voters, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
}

export function loadTupleProposal$Data(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _dao = source.readAddress();
    const _proposer = source.readAddress();
    const _targetContract = source.readAddress();
    const _payload = source.readCell();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _voterCount = source.readBigNumber();
    const _quorumStake = source.readBigNumber();
    const _voters = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _createdAt = source.readBigNumber();
    const _votingEndsAt = source.readBigNumber();
    const _executionUnlocksAt = source.readBigNumber();
    const _status = source.readBigNumber();
    return { $$type: 'Proposal$Data' as const, proposalId: _proposalId, dao: _dao, proposer: _proposer, targetContract: _targetContract, payload: _payload, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, quorumStake: _quorumStake, voters: _voters, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
}

export function loadGetterTupleProposal$Data(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _dao = source.readAddress();
    const _proposer = source.readAddress();
    const _targetContract = source.readAddress();
    const _payload = source.readCell();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _voterCount = source.readBigNumber();
    const _quorumStake = source.readBigNumber();
    const _voters = Dictionary.loadDirect(Dictionary.Keys.Address(), Dictionary.Values.BigInt(257), source.readCellOpt());
    const _createdAt = source.readBigNumber();
    const _votingEndsAt = source.readBigNumber();
    const _executionUnlocksAt = source.readBigNumber();
    const _status = source.readBigNumber();
    return { $$type: 'Proposal$Data' as const, proposalId: _proposalId, dao: _dao, proposer: _proposer, targetContract: _targetContract, payload: _payload, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, quorumStake: _quorumStake, voters: _voters, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
}

export function storeTupleProposal$Data(source: Proposal$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    builder.writeAddress(source.dao);
    builder.writeAddress(source.proposer);
    builder.writeAddress(source.targetContract);
    builder.writeCell(source.payload);
    builder.writeNumber(source.votesFor);
    builder.writeNumber(source.votesAgainst);
    builder.writeNumber(source.voterCount);
    builder.writeNumber(source.quorumStake);
    builder.writeCell(source.voters.size > 0 ? beginCell().storeDictDirect(source.voters, Dictionary.Keys.Address(), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.createdAt);
    builder.writeNumber(source.votingEndsAt);
    builder.writeNumber(source.executionUnlocksAt);
    builder.writeNumber(source.status);
    return builder.build();
}

export function dictValueParserProposal$Data(): DictionaryValue<Proposal$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProposal$Data(src)).endCell());
        },
        parse: (src) => {
            return loadProposal$Data(src.loadRef().beginParse());
        }
    }
}

export type GovernanceStats = {
    $$type: 'GovernanceStats';
    proposalCount: bigint;
    executedCount: bigint;
    cancelledCount: bigint;
    quorumPercent: bigint;
    timelockSeconds: bigint;
    minProposalStake: bigint;
    totalStakedGSTD: bigint;
}

export function storeGovernanceStats(src: GovernanceStats) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.proposalCount, 64);
        b_0.storeUint(src.executedCount, 64);
        b_0.storeUint(src.cancelledCount, 64);
        b_0.storeUint(src.quorumPercent, 8);
        b_0.storeUint(src.timelockSeconds, 32);
        b_0.storeCoins(src.minProposalStake);
        b_0.storeCoins(src.totalStakedGSTD);
    };
}

export function loadGovernanceStats(slice: Slice) {
    const sc_0 = slice;
    const _proposalCount = sc_0.loadUintBig(64);
    const _executedCount = sc_0.loadUintBig(64);
    const _cancelledCount = sc_0.loadUintBig(64);
    const _quorumPercent = sc_0.loadUintBig(8);
    const _timelockSeconds = sc_0.loadUintBig(32);
    const _minProposalStake = sc_0.loadCoins();
    const _totalStakedGSTD = sc_0.loadCoins();
    return { $$type: 'GovernanceStats' as const, proposalCount: _proposalCount, executedCount: _executedCount, cancelledCount: _cancelledCount, quorumPercent: _quorumPercent, timelockSeconds: _timelockSeconds, minProposalStake: _minProposalStake, totalStakedGSTD: _totalStakedGSTD };
}

export function loadTupleGovernanceStats(source: TupleReader) {
    const _proposalCount = source.readBigNumber();
    const _executedCount = source.readBigNumber();
    const _cancelledCount = source.readBigNumber();
    const _quorumPercent = source.readBigNumber();
    const _timelockSeconds = source.readBigNumber();
    const _minProposalStake = source.readBigNumber();
    const _totalStakedGSTD = source.readBigNumber();
    return { $$type: 'GovernanceStats' as const, proposalCount: _proposalCount, executedCount: _executedCount, cancelledCount: _cancelledCount, quorumPercent: _quorumPercent, timelockSeconds: _timelockSeconds, minProposalStake: _minProposalStake, totalStakedGSTD: _totalStakedGSTD };
}

export function loadGetterTupleGovernanceStats(source: TupleReader) {
    const _proposalCount = source.readBigNumber();
    const _executedCount = source.readBigNumber();
    const _cancelledCount = source.readBigNumber();
    const _quorumPercent = source.readBigNumber();
    const _timelockSeconds = source.readBigNumber();
    const _minProposalStake = source.readBigNumber();
    const _totalStakedGSTD = source.readBigNumber();
    return { $$type: 'GovernanceStats' as const, proposalCount: _proposalCount, executedCount: _executedCount, cancelledCount: _cancelledCount, quorumPercent: _quorumPercent, timelockSeconds: _timelockSeconds, minProposalStake: _minProposalStake, totalStakedGSTD: _totalStakedGSTD };
}

export function storeTupleGovernanceStats(source: GovernanceStats) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalCount);
    builder.writeNumber(source.executedCount);
    builder.writeNumber(source.cancelledCount);
    builder.writeNumber(source.quorumPercent);
    builder.writeNumber(source.timelockSeconds);
    builder.writeNumber(source.minProposalStake);
    builder.writeNumber(source.totalStakedGSTD);
    return builder.build();
}

export function dictValueParserGovernanceStats(): DictionaryValue<GovernanceStats> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGovernanceStats(src)).endCell());
        },
        parse: (src) => {
            return loadGovernanceStats(src.loadRef().beginParse());
        }
    }
}

export type ProposalData = {
    $$type: 'ProposalData';
    proposalId: bigint;
    proposer: Address;
    targetContract: Address;
    votesFor: bigint;
    votesAgainst: bigint;
    voterCount: bigint;
    totalStaked: bigint;
    quorumStake: bigint;
    createdAt: bigint;
    votingEndsAt: bigint;
    executionUnlocksAt: bigint;
    status: bigint;
}

export function storeProposalData(src: ProposalData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.proposalId, 64);
        b_0.storeAddress(src.proposer);
        b_0.storeAddress(src.targetContract);
        b_0.storeCoins(src.votesFor);
        b_0.storeCoins(src.votesAgainst);
        b_0.storeUint(src.voterCount, 32);
        b_0.storeCoins(src.totalStaked);
        const b_1 = new Builder();
        b_1.storeCoins(src.quorumStake);
        b_1.storeUint(src.createdAt, 64);
        b_1.storeUint(src.votingEndsAt, 64);
        b_1.storeUint(src.executionUnlocksAt, 64);
        b_1.storeUint(src.status, 8);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadProposalData(slice: Slice) {
    const sc_0 = slice;
    const _proposalId = sc_0.loadUintBig(64);
    const _proposer = sc_0.loadAddress();
    const _targetContract = sc_0.loadAddress();
    const _votesFor = sc_0.loadCoins();
    const _votesAgainst = sc_0.loadCoins();
    const _voterCount = sc_0.loadUintBig(32);
    const _totalStaked = sc_0.loadCoins();
    const sc_1 = sc_0.loadRef().beginParse();
    const _quorumStake = sc_1.loadCoins();
    const _createdAt = sc_1.loadUintBig(64);
    const _votingEndsAt = sc_1.loadUintBig(64);
    const _executionUnlocksAt = sc_1.loadUintBig(64);
    const _status = sc_1.loadUintBig(8);
    return { $$type: 'ProposalData' as const, proposalId: _proposalId, proposer: _proposer, targetContract: _targetContract, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, totalStaked: _totalStaked, quorumStake: _quorumStake, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
}

export function loadTupleProposalData(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _proposer = source.readAddress();
    const _targetContract = source.readAddress();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _voterCount = source.readBigNumber();
    const _totalStaked = source.readBigNumber();
    const _quorumStake = source.readBigNumber();
    const _createdAt = source.readBigNumber();
    const _votingEndsAt = source.readBigNumber();
    const _executionUnlocksAt = source.readBigNumber();
    const _status = source.readBigNumber();
    return { $$type: 'ProposalData' as const, proposalId: _proposalId, proposer: _proposer, targetContract: _targetContract, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, totalStaked: _totalStaked, quorumStake: _quorumStake, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
}

export function loadGetterTupleProposalData(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _proposer = source.readAddress();
    const _targetContract = source.readAddress();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _voterCount = source.readBigNumber();
    const _totalStaked = source.readBigNumber();
    const _quorumStake = source.readBigNumber();
    const _createdAt = source.readBigNumber();
    const _votingEndsAt = source.readBigNumber();
    const _executionUnlocksAt = source.readBigNumber();
    const _status = source.readBigNumber();
    return { $$type: 'ProposalData' as const, proposalId: _proposalId, proposer: _proposer, targetContract: _targetContract, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, totalStaked: _totalStaked, quorumStake: _quorumStake, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
}

export function storeTupleProposalData(source: ProposalData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    builder.writeAddress(source.proposer);
    builder.writeAddress(source.targetContract);
    builder.writeNumber(source.votesFor);
    builder.writeNumber(source.votesAgainst);
    builder.writeNumber(source.voterCount);
    builder.writeNumber(source.totalStaked);
    builder.writeNumber(source.quorumStake);
    builder.writeNumber(source.createdAt);
    builder.writeNumber(source.votingEndsAt);
    builder.writeNumber(source.executionUnlocksAt);
    builder.writeNumber(source.status);
    return builder.build();
}

export function dictValueParserProposalData(): DictionaryValue<ProposalData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProposalData(src)).endCell());
        },
        parse: (src) => {
            return loadProposalData(src.loadRef().beginParse());
        }
    }
}

 type DAOVoting_init_args = {
    $$type: 'DAOVoting_init_args';
    owner: Address;
    gstdJetton: Address;
}

function initDAOVoting_init_args(src: DAOVoting_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.gstdJetton);
    };
}

async function DAOVoting_init(owner: Address, gstdJetton: Address) {
    const __code = Cell.fromHex('b5ee9c7241022a01000a12000114ff00f4a413f4bcf2c80b01020162020b02cad0eda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e16fa40fa40d307d31ffa00fa00d33fd33fd33f55806c198e19fa40fa405902d1017a8202a300822009184e72a00070547000e20a925f0ae028d749c21fe30008f901030a03f808d31f218210d47e9bc8bae3022182109340b747bae3022182107ed96f81ba8e4f316c33d307d31ffa00308200de32f84228c705f2f48139ef23c2049323c1349170e2f2f41068105746144353c87f01ca0055805089ce16ce14cb0712cb1f01fa0201fa02cb3fcb3fcb3fc9ed54db31e0018210946a98b6bae3020804070903fe31d431d3ff31fa40d4d31f308200dec6f8416f24135f0382103b9aca00bef2f423a4f828f842105646435398db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d0821005f5e100727088551410465522c8cf8580ca00cf8440ce01fa028069cf40025c6e120506001000000000696e69740086016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010685515c87f01ca0055805089ce16ce14cb0712cb1f01fa0201fa02cb3fcb3fcb3fc9ed54db3102f031d33f30107910681057104610354430db3c821008f0d18072708810246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0001a401c87f01ca0055805089ce16ce14cb0712cb1f01fa0201fa02cb3fcb3fcb3fc9ed54db3110080016000000006578656375746500c6d33f30c8018210aff90f5758cb1fcb3fc9107910681057104610354430f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055805089ce16ce14cb0712cb1f01fa0201fa02cb3fcb3fcb3fc9ed54db3100c882f05240c307401835ee4ec0137f373534d474d56ddc78888246070a7b12c2ef6a39ba8e3982008aabf8425008c70517f2f4f828081057104610354430c87f01ca0055805089ce16ce14cb0712cb1f01fa0201fa02cb3fcb3fcb3fc9ed54e05f09f2c0820201200c280202740d0f0181ae8ef6a268690000c70b7d207d206983e98ffd007d00699fe99fe99faac0360cc70cfd207d202c816880bd410151804110048c27395000382a3800716d9e3648c00e0002280185ae0e76a268690000c70b7d207d206983e98ffd007d00699fe99fe99faac0360cc70cfd207d202c816880bd410151804110048c27395000382a3800712a846d9e3648c01003a0f8288d08600000000000000000000000000000000000000000000000000000000000000000048d086000000000000000000000000000000000000000000000000000000000000000000488705300db3c1112270000015e88c87001ca0055715078810101cf0015ce13ce01c8ce12cc12810101cf0012810101cf0002c8810101cf0012cdcdc9130114ff00f4a413f4bcf2c80b14020162152102f6d0eda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e4b810101d700fa40fa40d401d0fa40d4810101d700810101d700d430d0810101d7003010581057105608d155067053006df823f82328a0f8235009a05007a022105810471036103510241023e30d0f925f0fe02dd749c21f251602ee8ef00dd31f21821040c4959fbae3020182106a693742ba8e57308200a5c3f8422bc705917f95f8422cc705e2f2f48178350ec0001ef2f4551a74c87f01ca0055d050decb3f1bce19ce17ce15cc5003fa02c858fa0212cb1f58fa0212f40012cb3f12cb3f12cb3f12cb07cdc9ed54db31e00dde0df90120171901fe31d33f31d200308120362fc000f2f4813c8df82323b9f2f48200e7e981010bf84226598101014133f40a6fa19401d70030925b6de26ef2f4f8416f24135f038208989680a18200e7e321c200f2f481010bf842221037810101216e955b59f4593098c801cf004133f441e201935073a0955063a00506e204a410bd10ac109b180082108a10795e340610355512c87f01ca0055d050decb3f1bce19ce17ce15cc5003fa02c858fa0212cb1f58fa0212f40012cb3f12cb3f12cb3f12cb07cdc9ed54db3101c082f09f31fb7c139e4f1313022f5187d632af397344874ad3c3abb365f301d9d7ab67ba8e393010bd551ac87f01ca0055d050decb3f1bce19ce17ce15cc5003fa02c858fa0212cb1f58fa0212f40012cb3f12cb3f12cb3f12cb07cdc9ed54e0201a029e82f09d09533a67be67e7f87e13c2cd8818a33e932240c2520de0f75654af191ae74dbae30282f0b14fdeec46f0654aee9d76d3e481c5026f579fad38ebfd74a2bb463891c05838bae3025f0ef2c0821b1f03fc308200a398f82322bef2f481010bf84224598101014133f40a6fa19401d70030925b6de2817f58216eb3f2f481010bf84210256d810101216e955b59f4593098c801cf004133f441e2f8427270881034103710246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf818ae2f400c901fb0010bd1c1d1e002e00000000766f74655f7374616b655f72657475726e6564001a58cf8680cf8480f400f400cf81006c551ac87f01ca0055d050decb3f1bce19ce17ce15cc5003fa02c858fa0212cb1f58fa0212f40012cb3f12cb3f12cb3f12cb07cdc9ed5401fe813bfa2ec000923e7f930ec001e21ef2f48200f5fbf8232dbef2f48200bc715365bcf2f48200c9fa5365a024bef2f47328821005f5e10072702b10246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010bd10ac109b108a10791068105720007610461035443012c87f01ca0055d050decb3f1bce19ce17ce15cc5003fa02c858fa0212cb1f58fa0212f40012cb3f12cb3f12cb3f12cb07cdc9ed54020120222402bbbd48476a268690000c725c08080eb807d207d206a00e87d206a408080eb80408080eb806a1868408080eb8018082c082b882b0468aa8338298036fc11fc1194507c11a804d02803d011082c0823881b081a88120811f186ed9e366636164252300225387a0546ed0546dc0546cc0547ca953ba02bbbd569f6a268690000c725c08080eb807d207d206a00e87d206a408080eb80408080eb806a1868408080eb8018082c082b882b0468aa8338298036fc11fc1194507c11a804d02803d011082c0823881b081a88120811f186aa86ed9e3670c2526005ad33ffa40fa40fa40d4fa00d401d0fa00d31ffa00f404d33fd33fd33fd30730108e108d108c108b108a10896c1e003a81010b26028101014133f40a6fa19401d70030925b6de2206e923070e0005a705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d00181bdd67f6a268690000c70b7d207d206983e98ffd007d00699fe99fe99faac0360cc70cfd207d202c816880bd410151804110048c27395000382a3800716d9e364bc29000e54721054798729f4c3e9e0');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initDAOVoting_init_args({ $$type: 'DAOVoting_init_args', owner, gstdJetton })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const DAOVoting_errors = {
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
    8246: { message: "Voting not active" },
    14831: { message: "Quorum must be 5-51%" },
    15354: { message: "Cannot execute" },
    15501: { message: "Voting period ended" },
    30773: { message: "Cannot cancel" },
    32600: { message: "No stake to claim" },
    35499: { message: "Only owner" },
    41880: { message: "Voting still active" },
    42435: { message: "Not authorized" },
    48241: { message: "Vote did not pass" },
    51706: { message: "Quorum not reached" },
    56882: { message: "Only owner/DAO multisig" },
    57030: { message: "Must attach min 1 TON as proposal stake" },
    59363: { message: "Must attach TON as voting stake" },
    59369: { message: "Already voted" },
    62971: { message: "Timelock not expired" },
} as const

export const DAOVoting_errors_backward = {
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
    "Voting not active": 8246,
    "Quorum must be 5-51%": 14831,
    "Cannot execute": 15354,
    "Voting period ended": 15501,
    "Cannot cancel": 30773,
    "No stake to claim": 32600,
    "Only owner": 35499,
    "Voting still active": 41880,
    "Not authorized": 42435,
    "Vote did not pass": 48241,
    "Quorum not reached": 51706,
    "Only owner/DAO multisig": 56882,
    "Must attach min 1 TON as proposal stake": 57030,
    "Must attach TON as voting stake": 59363,
    "Already voted": 59369,
    "Timelock not expired": 62971,
} as const

const DAOVoting_types: ABIType[] = [
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
    {"name":"CreateProposal","header":3565067208,"fields":[{"name":"title","type":{"kind":"simple","type":"string","optional":false}},{"name":"descriptionHash","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"targetContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"payload","type":{"kind":"simple","type":"cell","optional":false}},{"name":"votingPeriod","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"CastVote","header":1086625183,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"support","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"ExecuteProposal","header":2470491975,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"CancelProposal","header":1785280322,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"reason","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"UpdateGovernanceParams","header":2128179073,"fields":[{"name":"quorumPercent","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"timelockSeconds","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"minProposalStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"DAOVoting$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"gstdJetton","type":{"kind":"simple","type":"address","optional":false}},{"name":"quorumPercent","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"timelockSeconds","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"minProposalStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalStakedGSTD","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"proposalCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"executedCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cancelledCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"Proposal$Data","header":null,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"proposer","type":{"kind":"simple","type":"address","optional":false}},{"name":"targetContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"payload","type":{"kind":"simple","type":"cell","optional":false}},{"name":"votesFor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"votesAgainst","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"voterCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"quorumStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"voters","type":{"kind":"dict","key":"address","value":"int"}},{"name":"createdAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"votingEndsAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"executionUnlocksAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"GovernanceStats","header":null,"fields":[{"name":"proposalCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"executedCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cancelledCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"quorumPercent","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"timelockSeconds","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"minProposalStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalStakedGSTD","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"ProposalData","header":null,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"proposer","type":{"kind":"simple","type":"address","optional":false}},{"name":"targetContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"votesFor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"votesAgainst","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"voterCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"totalStaked","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"quorumStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"createdAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"votingEndsAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"executionUnlocksAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
]

const DAOVoting_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "CreateProposal": 3565067208,
    "CastVote": 1086625183,
    "ExecuteProposal": 2470491975,
    "CancelProposal": 1785280322,
    "UpdateGovernanceParams": 2128179073,
}

const DAOVoting_getters: ABIGetter[] = [
    {"name":"get_governance_stats","methodId":113359,"arguments":[],"returnType":{"kind":"simple","type":"GovernanceStats","optional":false}},
    {"name":"get_proposal_address","methodId":85020,"arguments":[{"name":"proposalId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const DAOVoting_getterMapping: { [key: string]: string } = {
    'get_governance_stats': 'getGetGovernanceStats',
    'get_proposal_address': 'getGetProposalAddress',
    'owner': 'getOwner',
}

const DAOVoting_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"CreateProposal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ExecuteProposal"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateGovernanceParams"}},
    {"receiver":"internal","message":{"kind":"text","text":"renounce"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class DAOVoting implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = DAOVoting_errors_backward;
    public static readonly opcodes = DAOVoting_opcodes;
    
    static async init(owner: Address, gstdJetton: Address) {
        return await DAOVoting_init(owner, gstdJetton);
    }
    
    static async fromInit(owner: Address, gstdJetton: Address) {
        const __gen_init = await DAOVoting_init(owner, gstdJetton);
        const address = contractAddress(0, __gen_init);
        return new DAOVoting(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new DAOVoting(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  DAOVoting_types,
        getters: DAOVoting_getters,
        receivers: DAOVoting_receivers,
        errors: DAOVoting_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: CreateProposal | ExecuteProposal | UpdateGovernanceParams | "renounce" | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CreateProposal') {
            body = beginCell().store(storeCreateProposal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ExecuteProposal') {
            body = beginCell().store(storeExecuteProposal(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateGovernanceParams') {
            body = beginCell().store(storeUpdateGovernanceParams(message)).endCell();
        }
        if (message === "renounce") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetGovernanceStats(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_governance_stats', builder.build())).stack;
        const result = loadGetterTupleGovernanceStats(source);
        return result;
    }
    
    async getGetProposalAddress(provider: ContractProvider, proposalId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(proposalId);
        const source = (await provider.get('get_proposal_address', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}