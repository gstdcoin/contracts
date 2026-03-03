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
    weight: bigint;
}

export function storeCastVote(src: CastVote) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2427161456, 32);
        b_0.storeUint(src.proposalId, 64);
        b_0.storeBit(src.support);
        b_0.storeCoins(src.weight);
    };
}

export function loadCastVote(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2427161456) { throw Error('Invalid prefix'); }
    const _proposalId = sc_0.loadUintBig(64);
    const _support = sc_0.loadBit();
    const _weight = sc_0.loadCoins();
    return { $$type: 'CastVote' as const, proposalId: _proposalId, support: _support, weight: _weight };
}

export function loadTupleCastVote(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    const _weight = source.readBigNumber();
    return { $$type: 'CastVote' as const, proposalId: _proposalId, support: _support, weight: _weight };
}

export function loadGetterTupleCastVote(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _support = source.readBoolean();
    const _weight = source.readBigNumber();
    return { $$type: 'CastVote' as const, proposalId: _proposalId, support: _support, weight: _weight };
}

export function storeTupleCastVote(source: CastVote) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    builder.writeBoolean(source.support);
    builder.writeNumber(source.weight);
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
    const _createdAt = sc_1.loadUintBig(64);
    const _votingEndsAt = sc_1.loadUintBig(64);
    const _executionUnlocksAt = sc_1.loadUintBig(64);
    const _status = sc_1.loadUintBig(8);
    return { $$type: 'Proposal$Data' as const, proposalId: _proposalId, dao: _dao, proposer: _proposer, targetContract: _targetContract, payload: _payload, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
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
    const _createdAt = source.readBigNumber();
    const _votingEndsAt = source.readBigNumber();
    const _executionUnlocksAt = source.readBigNumber();
    const _status = source.readBigNumber();
    return { $$type: 'Proposal$Data' as const, proposalId: _proposalId, dao: _dao, proposer: _proposer, targetContract: _targetContract, payload: _payload, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
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
    const _createdAt = source.readBigNumber();
    const _votingEndsAt = source.readBigNumber();
    const _executionUnlocksAt = source.readBigNumber();
    const _status = source.readBigNumber();
    return { $$type: 'Proposal$Data' as const, proposalId: _proposalId, dao: _dao, proposer: _proposer, targetContract: _targetContract, payload: _payload, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
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
        b_0.storeUint(src.createdAt, 64);
        b_0.storeUint(src.votingEndsAt, 64);
        const b_1 = new Builder();
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
    const _createdAt = sc_0.loadUintBig(64);
    const _votingEndsAt = sc_0.loadUintBig(64);
    const sc_1 = sc_0.loadRef().beginParse();
    const _executionUnlocksAt = sc_1.loadUintBig(64);
    const _status = sc_1.loadUintBig(8);
    return { $$type: 'ProposalData' as const, proposalId: _proposalId, proposer: _proposer, targetContract: _targetContract, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
}

export function loadTupleProposalData(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _proposer = source.readAddress();
    const _targetContract = source.readAddress();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _voterCount = source.readBigNumber();
    const _createdAt = source.readBigNumber();
    const _votingEndsAt = source.readBigNumber();
    const _executionUnlocksAt = source.readBigNumber();
    const _status = source.readBigNumber();
    return { $$type: 'ProposalData' as const, proposalId: _proposalId, proposer: _proposer, targetContract: _targetContract, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
}

export function loadGetterTupleProposalData(source: TupleReader) {
    const _proposalId = source.readBigNumber();
    const _proposer = source.readAddress();
    const _targetContract = source.readAddress();
    const _votesFor = source.readBigNumber();
    const _votesAgainst = source.readBigNumber();
    const _voterCount = source.readBigNumber();
    const _createdAt = source.readBigNumber();
    const _votingEndsAt = source.readBigNumber();
    const _executionUnlocksAt = source.readBigNumber();
    const _status = source.readBigNumber();
    return { $$type: 'ProposalData' as const, proposalId: _proposalId, proposer: _proposer, targetContract: _targetContract, votesFor: _votesFor, votesAgainst: _votesAgainst, voterCount: _voterCount, createdAt: _createdAt, votingEndsAt: _votingEndsAt, executionUnlocksAt: _executionUnlocksAt, status: _status };
}

export function storeTupleProposalData(source: ProposalData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.proposalId);
    builder.writeAddress(source.proposer);
    builder.writeAddress(source.targetContract);
    builder.writeNumber(source.votesFor);
    builder.writeNumber(source.votesAgainst);
    builder.writeNumber(source.voterCount);
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

 type Proposal_init_args = {
    $$type: 'Proposal_init_args';
    proposalId: bigint;
    dao: Address;
    proposer: Address;
    targetContract: Address;
    payload: Cell;
    votingPeriod: bigint;
    timelockSeconds: bigint;
}

function initProposal_init_args(src: Proposal_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.proposalId, 257);
        b_0.storeAddress(src.dao);
        b_0.storeAddress(src.proposer);
        const b_1 = new Builder();
        b_1.storeAddress(src.targetContract);
        b_1.storeRef(src.payload);
        b_1.storeInt(src.votingPeriod, 257);
        b_1.storeInt(src.timelockSeconds, 257);
        b_0.storeRef(b_1.endCell());
    };
}

async function Proposal_init(proposalId: bigint, dao: Address, proposer: Address, targetContract: Address, payload: Cell, votingPeriod: bigint, timelockSeconds: bigint) {
    const __code = Cell.fromHex('b5ee9c7241020c0100033e000114ff00f4a413f4bcf2c80b01020162020a0138d0eda2edfb01d072d721d200d200fa4021103450666f04f86102f8620302feed44d0d200018e29d33ffa40fa40fa40d4fa00d401d0fa00d31fd33fd33fd33fd30730106c106b106a1069106810676c1c8e3c810101d700fa40fa40d401d0fa40d4810101d700810101d7003010471046104507d15505705300f823f82326a0f8235007a05005a021104610351024e20d925f0de02bd749c21fe3000bf901040601fa0bd31f21821090ab8b70ba8e6431d33f31d200fa00308120362ec000f2f4813c8df82324b9f2f4019215a09414a00304e202a4109b108a1079106810575e32444403c87f01ca0055b050bccb3f19ce17ce15ce13cc01fa02c858fa0212cb1f12cb3f12cb3f12cb3f12cb07cdc9ed54db31e00182106a693742bae3020b0500a0308200a5c3f84229c705917f95f8422ac705e2f2f48178350cc0001cf2f4551874c87f01ca0055b050bccb3f19ce17ce15ce13cc01fa02c858fa0212cb1f12cb3f12cb3f12cb3f12cb07cdc9ed54db3102fc2082f09f31fb7c139e4f1313022f5187d632af397344874ad3c3abb365f301d9d7ab67ba8e3230109b5518c87f01ca0055b050bccb3f19ce17ce15ce13cc01fa02c858fa0212cb1f12cb3f12cb3f12cb3f12cb07cdc9ed54e082f0b14fdeec46f0654aee9d76d3e481c5026f579fad38ebfd74a2bb463891c05838bae302070901ee813bfa2cc000923c7f930cc001e21cf2f48200f5fbf8232bbef2f48200bc715343bcf2f47326821005f5e10072702910246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00109b108a1079106810571046103544301208005ac87f01ca0055b050bccb3f19ce17ce15ce13cc01fa02c858fa0212cb1f12cb3f12cb3f12cb3f12cb07cdc9ed54000a5f0cf2c08201eda05211da89a1a400031c53a67ff481f481f481a9f401a803a1f401a63fa67fa67fa67fa60e6020d820d620d420d220d020ced8391c79020203ae01f481f481a803a1f481a9020203ae01020203ae0060208e208c208a0fa2aa0ae0a601f047f0464d41f046a00f40a00b4042208c206a2049c5b678d9950b0014547b9854798754798729b252f37a');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initProposal_init_args({ $$type: 'Proposal_init_args', proposalId, dao, proposer, targetContract, payload, votingPeriod, timelockSeconds })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const Proposal_errors = {
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
    35499: { message: "Only owner" },
    42435: { message: "Not authorized" },
    48241: { message: "Vote did not pass" },
    56882: { message: "Only owner/DAO multisig" },
    62971: { message: "Timelock not expired" },
} as const

export const Proposal_errors_backward = {
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
    "Only owner": 35499,
    "Not authorized": 42435,
    "Vote did not pass": 48241,
    "Only owner/DAO multisig": 56882,
    "Timelock not expired": 62971,
} as const

const Proposal_types: ABIType[] = [
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
    {"name":"CastVote","header":2427161456,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"support","type":{"kind":"simple","type":"bool","optional":false}},{"name":"weight","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"ExecuteProposal","header":2470491975,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"CancelProposal","header":1785280322,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"reason","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"UpdateGovernanceParams","header":2128179073,"fields":[{"name":"quorumPercent","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"timelockSeconds","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"minProposalStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"DAOVoting$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"gstdJetton","type":{"kind":"simple","type":"address","optional":false}},{"name":"quorumPercent","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"timelockSeconds","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"minProposalStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalStakedGSTD","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"proposalCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"executedCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cancelledCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"Proposal$Data","header":null,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"dao","type":{"kind":"simple","type":"address","optional":false}},{"name":"proposer","type":{"kind":"simple","type":"address","optional":false}},{"name":"targetContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"payload","type":{"kind":"simple","type":"cell","optional":false}},{"name":"votesFor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"votesAgainst","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"voterCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"createdAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"votingEndsAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"executionUnlocksAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"GovernanceStats","header":null,"fields":[{"name":"proposalCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"executedCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"cancelledCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"quorumPercent","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"timelockSeconds","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"minProposalStake","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalStakedGSTD","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"ProposalData","header":null,"fields":[{"name":"proposalId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"proposer","type":{"kind":"simple","type":"address","optional":false}},{"name":"targetContract","type":{"kind":"simple","type":"address","optional":false}},{"name":"votesFor","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"votesAgainst","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"voterCount","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"createdAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"votingEndsAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"executionUnlocksAt","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"status","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
]

const Proposal_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "CreateProposal": 3565067208,
    "CastVote": 2427161456,
    "ExecuteProposal": 2470491975,
    "CancelProposal": 1785280322,
    "UpdateGovernanceParams": 2128179073,
}

const Proposal_getters: ABIGetter[] = [
    {"name":"get_proposal_data","methodId":76040,"arguments":[],"returnType":{"kind":"simple","type":"ProposalData","optional":false}},
]

export const Proposal_getterMapping: { [key: string]: string } = {
    'get_proposal_data': 'getGetProposalData',
}

const Proposal_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"text","text":"init"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CastVote"}},
    {"receiver":"internal","message":{"kind":"text","text":"execute"}},
    {"receiver":"internal","message":{"kind":"typed","type":"CancelProposal"}},
]


export class Proposal implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = Proposal_errors_backward;
    public static readonly opcodes = Proposal_opcodes;
    
    static async init(proposalId: bigint, dao: Address, proposer: Address, targetContract: Address, payload: Cell, votingPeriod: bigint, timelockSeconds: bigint) {
        return await Proposal_init(proposalId, dao, proposer, targetContract, payload, votingPeriod, timelockSeconds);
    }
    
    static async fromInit(proposalId: bigint, dao: Address, proposer: Address, targetContract: Address, payload: Cell, votingPeriod: bigint, timelockSeconds: bigint) {
        const __gen_init = await Proposal_init(proposalId, dao, proposer, targetContract, payload, votingPeriod, timelockSeconds);
        const address = contractAddress(0, __gen_init);
        return new Proposal(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new Proposal(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  Proposal_types,
        getters: Proposal_getters,
        receivers: Proposal_receivers,
        errors: Proposal_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: "init" | CastVote | "execute" | CancelProposal) {
        
        let body: Cell | null = null;
        if (message === "init") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CastVote') {
            body = beginCell().store(storeCastVote(message)).endCell();
        }
        if (message === "execute") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CancelProposal') {
            body = beginCell().store(storeCancelProposal(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetProposalData(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_proposal_data', builder.build())).stack;
        const result = loadGetterTupleProposalData(source);
        return result;
    }
    
}