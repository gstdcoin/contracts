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

export type MintWorkerReward = {
    $$type: 'MintWorkerReward';
    workerAddr: Address;
    amount: bigint;
    taskId: bigint;
}

export function storeMintWorkerReward(src: MintWorkerReward) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3145374392, 32);
        b_0.storeAddress(src.workerAddr);
        b_0.storeCoins(src.amount);
        b_0.storeUint(src.taskId, 64);
    };
}

export function loadMintWorkerReward(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3145374392) { throw Error('Invalid prefix'); }
    const _workerAddr = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _taskId = sc_0.loadUintBig(64);
    return { $$type: 'MintWorkerReward' as const, workerAddr: _workerAddr, amount: _amount, taskId: _taskId };
}

export function loadTupleMintWorkerReward(source: TupleReader) {
    const _workerAddr = source.readAddress();
    const _amount = source.readBigNumber();
    const _taskId = source.readBigNumber();
    return { $$type: 'MintWorkerReward' as const, workerAddr: _workerAddr, amount: _amount, taskId: _taskId };
}

export function loadGetterTupleMintWorkerReward(source: TupleReader) {
    const _workerAddr = source.readAddress();
    const _amount = source.readBigNumber();
    const _taskId = source.readBigNumber();
    return { $$type: 'MintWorkerReward' as const, workerAddr: _workerAddr, amount: _amount, taskId: _taskId };
}

export function storeTupleMintWorkerReward(source: MintWorkerReward) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.workerAddr);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.taskId);
    return builder.build();
}

export function dictValueParserMintWorkerReward(): DictionaryValue<MintWorkerReward> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMintWorkerReward(src)).endCell());
        },
        parse: (src) => {
            return loadMintWorkerReward(src.loadRef().beginParse());
        }
    }
}

export type SetMintAuthority = {
    $$type: 'SetMintAuthority';
    newAuthority: Address;
}

export function storeSetMintAuthority(src: SetMintAuthority) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1824345925, 32);
        b_0.storeAddress(src.newAuthority);
    };
}

export function loadSetMintAuthority(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1824345925) { throw Error('Invalid prefix'); }
    const _newAuthority = sc_0.loadAddress();
    return { $$type: 'SetMintAuthority' as const, newAuthority: _newAuthority };
}

export function loadTupleSetMintAuthority(source: TupleReader) {
    const _newAuthority = source.readAddress();
    return { $$type: 'SetMintAuthority' as const, newAuthority: _newAuthority };
}

export function loadGetterTupleSetMintAuthority(source: TupleReader) {
    const _newAuthority = source.readAddress();
    return { $$type: 'SetMintAuthority' as const, newAuthority: _newAuthority };
}

export function storeTupleSetMintAuthority(source: SetMintAuthority) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.newAuthority);
    return builder.build();
}

export function dictValueParserSetMintAuthority(): DictionaryValue<SetMintAuthority> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetMintAuthority(src)).endCell());
        },
        parse: (src) => {
            return loadSetMintAuthority(src.loadRef().beginParse());
        }
    }
}

export type BurnNotification = {
    $$type: 'BurnNotification';
    queryId: bigint;
    amount: bigint;
    sender: Address;
    responseDestination: Address;
}

export function storeBurnNotification(src: BurnNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1668790143, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeAddress(src.responseDestination);
    };
}

export function loadBurnNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1668790143) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _responseDestination = sc_0.loadAddress();
    return { $$type: 'BurnNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, responseDestination: _responseDestination };
}

export function loadTupleBurnNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _responseDestination = source.readAddress();
    return { $$type: 'BurnNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, responseDestination: _responseDestination };
}

export function loadGetterTupleBurnNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _responseDestination = source.readAddress();
    return { $$type: 'BurnNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, responseDestination: _responseDestination };
}

export function storeTupleBurnNotification(source: BurnNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeAddress(source.responseDestination);
    return builder.build();
}

export function dictValueParserBurnNotification(): DictionaryValue<BurnNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBurnNotification(src)).endCell());
        },
        parse: (src) => {
            return loadBurnNotification(src.loadRef().beginParse());
        }
    }
}

export type TransferNotification = {
    $$type: 'TransferNotification';
    queryId: bigint;
    amount: bigint;
    sender: Address;
    forwardPayload: Slice;
}

export function storeTransferNotification(src: TransferNotification) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(4108645777, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.sender);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadTransferNotification(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 4108645777) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _sender = sc_0.loadAddress();
    const _forwardPayload = sc_0;
    return { $$type: 'TransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function loadTupleTransferNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'TransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function loadGetterTupleTransferNotification(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _sender = source.readAddress();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'TransferNotification' as const, queryId: _queryId, amount: _amount, sender: _sender, forwardPayload: _forwardPayload };
}

export function storeTupleTransferNotification(source: TransferNotification) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.sender);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserTransferNotification(): DictionaryValue<TransferNotification> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTransferNotification(src)).endCell());
        },
        parse: (src) => {
            return loadTransferNotification(src.loadRef().beginParse());
        }
    }
}

export type TokenUpdateContent = {
    $$type: 'TokenUpdateContent';
    content: Cell;
}

export function storeTokenUpdateContent(src: TokenUpdateContent) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2937889386, 32);
        b_0.storeRef(src.content);
    };
}

export function loadTokenUpdateContent(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2937889386) { throw Error('Invalid prefix'); }
    const _content = sc_0.loadRef();
    return { $$type: 'TokenUpdateContent' as const, content: _content };
}

export function loadTupleTokenUpdateContent(source: TupleReader) {
    const _content = source.readCell();
    return { $$type: 'TokenUpdateContent' as const, content: _content };
}

export function loadGetterTupleTokenUpdateContent(source: TupleReader) {
    const _content = source.readCell();
    return { $$type: 'TokenUpdateContent' as const, content: _content };
}

export function storeTupleTokenUpdateContent(source: TokenUpdateContent) {
    const builder = new TupleBuilder();
    builder.writeCell(source.content);
    return builder.build();
}

export function dictValueParserTokenUpdateContent(): DictionaryValue<TokenUpdateContent> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTokenUpdateContent(src)).endCell());
        },
        parse: (src) => {
            return loadTokenUpdateContent(src.loadRef().beginParse());
        }
    }
}

export type MintInitialAllocation = {
    $$type: 'MintInitialAllocation';
    teamAddr: Address;
    teamAmount: bigint;
    ecosystemAddr: Address;
    ecosystemAmount: bigint;
    liquidityAddr: Address;
    liquidityAmount: bigint;
}

export function storeMintInitialAllocation(src: MintInitialAllocation) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1072595834, 32);
        b_0.storeAddress(src.teamAddr);
        b_0.storeCoins(src.teamAmount);
        b_0.storeAddress(src.ecosystemAddr);
        b_0.storeCoins(src.ecosystemAmount);
        const b_1 = new Builder();
        b_1.storeAddress(src.liquidityAddr);
        b_1.storeCoins(src.liquidityAmount);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadMintInitialAllocation(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1072595834) { throw Error('Invalid prefix'); }
    const _teamAddr = sc_0.loadAddress();
    const _teamAmount = sc_0.loadCoins();
    const _ecosystemAddr = sc_0.loadAddress();
    const _ecosystemAmount = sc_0.loadCoins();
    const sc_1 = sc_0.loadRef().beginParse();
    const _liquidityAddr = sc_1.loadAddress();
    const _liquidityAmount = sc_1.loadCoins();
    return { $$type: 'MintInitialAllocation' as const, teamAddr: _teamAddr, teamAmount: _teamAmount, ecosystemAddr: _ecosystemAddr, ecosystemAmount: _ecosystemAmount, liquidityAddr: _liquidityAddr, liquidityAmount: _liquidityAmount };
}

export function loadTupleMintInitialAllocation(source: TupleReader) {
    const _teamAddr = source.readAddress();
    const _teamAmount = source.readBigNumber();
    const _ecosystemAddr = source.readAddress();
    const _ecosystemAmount = source.readBigNumber();
    const _liquidityAddr = source.readAddress();
    const _liquidityAmount = source.readBigNumber();
    return { $$type: 'MintInitialAllocation' as const, teamAddr: _teamAddr, teamAmount: _teamAmount, ecosystemAddr: _ecosystemAddr, ecosystemAmount: _ecosystemAmount, liquidityAddr: _liquidityAddr, liquidityAmount: _liquidityAmount };
}

export function loadGetterTupleMintInitialAllocation(source: TupleReader) {
    const _teamAddr = source.readAddress();
    const _teamAmount = source.readBigNumber();
    const _ecosystemAddr = source.readAddress();
    const _ecosystemAmount = source.readBigNumber();
    const _liquidityAddr = source.readAddress();
    const _liquidityAmount = source.readBigNumber();
    return { $$type: 'MintInitialAllocation' as const, teamAddr: _teamAddr, teamAmount: _teamAmount, ecosystemAddr: _ecosystemAddr, ecosystemAmount: _ecosystemAmount, liquidityAddr: _liquidityAddr, liquidityAmount: _liquidityAmount };
}

export function storeTupleMintInitialAllocation(source: MintInitialAllocation) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.teamAddr);
    builder.writeNumber(source.teamAmount);
    builder.writeAddress(source.ecosystemAddr);
    builder.writeNumber(source.ecosystemAmount);
    builder.writeAddress(source.liquidityAddr);
    builder.writeNumber(source.liquidityAmount);
    return builder.build();
}

export function dictValueParserMintInitialAllocation(): DictionaryValue<MintInitialAllocation> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMintInitialAllocation(src)).endCell());
        },
        parse: (src) => {
            return loadMintInitialAllocation(src.loadRef().beginParse());
        }
    }
}

export type Transfer = {
    $$type: 'Transfer';
    queryId: bigint;
    amount: bigint;
    destination: Address;
    responseDestination: Address;
    customPayload: Cell | null;
    forwardTonAmount: bigint;
    forwardPayload: Slice;
}

export function storeTransfer(src: Transfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1435380091, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
        b_0.storeAddress(src.responseDestination);
        if (src.customPayload !== null && src.customPayload !== undefined) { b_0.storeBit(true).storeRef(src.customPayload); } else { b_0.storeBit(false); }
        b_0.storeCoins(src.forwardTonAmount);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1435380091) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    const _responseDestination = sc_0.loadAddress();
    const _customPayload = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _forwardTonAmount = sc_0.loadCoins();
    const _forwardPayload = sc_0;
    return { $$type: 'Transfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadTupleTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _responseDestination = source.readAddress();
    const _customPayload = source.readCellOpt();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'Transfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadGetterTupleTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    const _responseDestination = source.readAddress();
    const _customPayload = source.readCellOpt();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'Transfer' as const, queryId: _queryId, amount: _amount, destination: _destination, responseDestination: _responseDestination, customPayload: _customPayload, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function storeTupleTransfer(source: Transfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    builder.writeAddress(source.responseDestination);
    builder.writeCell(source.customPayload);
    builder.writeNumber(source.forwardTonAmount);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserTransfer(): DictionaryValue<Transfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadTransfer(src.loadRef().beginParse());
        }
    }
}

export type InternalTransfer = {
    $$type: 'InternalTransfer';
    queryId: bigint;
    amount: bigint;
    from: Address;
    responseAddress: Address;
    forwardTonAmount: bigint;
    forwardPayload: Slice;
}

export function storeInternalTransfer(src: InternalTransfer) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2886927703, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.from);
        b_0.storeAddress(src.responseAddress);
        b_0.storeCoins(src.forwardTonAmount);
        b_0.storeBuilder(src.forwardPayload.asBuilder());
    };
}

export function loadInternalTransfer(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2886927703) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _from = sc_0.loadAddress();
    const _responseAddress = sc_0.loadAddress();
    const _forwardTonAmount = sc_0.loadCoins();
    const _forwardPayload = sc_0;
    return { $$type: 'InternalTransfer' as const, queryId: _queryId, amount: _amount, from: _from, responseAddress: _responseAddress, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadTupleInternalTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _from = source.readAddress();
    const _responseAddress = source.readAddress();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'InternalTransfer' as const, queryId: _queryId, amount: _amount, from: _from, responseAddress: _responseAddress, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function loadGetterTupleInternalTransfer(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _from = source.readAddress();
    const _responseAddress = source.readAddress();
    const _forwardTonAmount = source.readBigNumber();
    const _forwardPayload = source.readCell().asSlice();
    return { $$type: 'InternalTransfer' as const, queryId: _queryId, amount: _amount, from: _from, responseAddress: _responseAddress, forwardTonAmount: _forwardTonAmount, forwardPayload: _forwardPayload };
}

export function storeTupleInternalTransfer(source: InternalTransfer) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.from);
    builder.writeAddress(source.responseAddress);
    builder.writeNumber(source.forwardTonAmount);
    builder.writeSlice(source.forwardPayload.asCell());
    return builder.build();
}

export function dictValueParserInternalTransfer(): DictionaryValue<InternalTransfer> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeInternalTransfer(src)).endCell());
        },
        parse: (src) => {
            return loadInternalTransfer(src.loadRef().beginParse());
        }
    }
}

export type Burn = {
    $$type: 'Burn';
    queryId: bigint;
    amount: bigint;
    responseDestination: Address;
}

export function storeBurn(src: Burn) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1079382365, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.responseDestination);
    };
}

export function loadBurn(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1079382365) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _responseDestination = sc_0.loadAddress();
    return { $$type: 'Burn' as const, queryId: _queryId, amount: _amount, responseDestination: _responseDestination };
}

export function loadTupleBurn(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _responseDestination = source.readAddress();
    return { $$type: 'Burn' as const, queryId: _queryId, amount: _amount, responseDestination: _responseDestination };
}

export function loadGetterTupleBurn(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _responseDestination = source.readAddress();
    return { $$type: 'Burn' as const, queryId: _queryId, amount: _amount, responseDestination: _responseDestination };
}

export function storeTupleBurn(source: Burn) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.amount);
    builder.writeAddress(source.responseDestination);
    return builder.build();
}

export function dictValueParserBurn(): DictionaryValue<Burn> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBurn(src)).endCell());
        },
        parse: (src) => {
            return loadBurn(src.loadRef().beginParse());
        }
    }
}

export type GSTDJetton$Data = {
    $$type: 'GSTDJetton$Data';
    totalSupply: bigint;
    maxSupply: bigint;
    owner: Address;
    mintAuthority: Address;
    content: Cell;
    mintable: boolean;
    workerPoolMinted: bigint;
    workerPoolMax: bigint;
    totalBurned: bigint;
    totalMintEvents: bigint;
    authorityLocked: boolean;
    initialAllocationDone: boolean;
}

export function storeGSTDJetton$Data(src: GSTDJetton$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.totalSupply);
        b_0.storeCoins(src.maxSupply);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.mintAuthority);
        b_0.storeRef(src.content);
        b_0.storeBit(src.mintable);
        b_0.storeCoins(src.workerPoolMinted);
        const b_1 = new Builder();
        b_1.storeCoins(src.workerPoolMax);
        b_1.storeCoins(src.totalBurned);
        b_1.storeUint(src.totalMintEvents, 64);
        b_1.storeBit(src.authorityLocked);
        b_1.storeBit(src.initialAllocationDone);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadGSTDJetton$Data(slice: Slice) {
    const sc_0 = slice;
    const _totalSupply = sc_0.loadCoins();
    const _maxSupply = sc_0.loadCoins();
    const _owner = sc_0.loadAddress();
    const _mintAuthority = sc_0.loadAddress();
    const _content = sc_0.loadRef();
    const _mintable = sc_0.loadBit();
    const _workerPoolMinted = sc_0.loadCoins();
    const sc_1 = sc_0.loadRef().beginParse();
    const _workerPoolMax = sc_1.loadCoins();
    const _totalBurned = sc_1.loadCoins();
    const _totalMintEvents = sc_1.loadUintBig(64);
    const _authorityLocked = sc_1.loadBit();
    const _initialAllocationDone = sc_1.loadBit();
    return { $$type: 'GSTDJetton$Data' as const, totalSupply: _totalSupply, maxSupply: _maxSupply, owner: _owner, mintAuthority: _mintAuthority, content: _content, mintable: _mintable, workerPoolMinted: _workerPoolMinted, workerPoolMax: _workerPoolMax, totalBurned: _totalBurned, totalMintEvents: _totalMintEvents, authorityLocked: _authorityLocked, initialAllocationDone: _initialAllocationDone };
}

export function loadTupleGSTDJetton$Data(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _maxSupply = source.readBigNumber();
    const _owner = source.readAddress();
    const _mintAuthority = source.readAddress();
    const _content = source.readCell();
    const _mintable = source.readBoolean();
    const _workerPoolMinted = source.readBigNumber();
    const _workerPoolMax = source.readBigNumber();
    const _totalBurned = source.readBigNumber();
    const _totalMintEvents = source.readBigNumber();
    const _authorityLocked = source.readBoolean();
    const _initialAllocationDone = source.readBoolean();
    return { $$type: 'GSTDJetton$Data' as const, totalSupply: _totalSupply, maxSupply: _maxSupply, owner: _owner, mintAuthority: _mintAuthority, content: _content, mintable: _mintable, workerPoolMinted: _workerPoolMinted, workerPoolMax: _workerPoolMax, totalBurned: _totalBurned, totalMintEvents: _totalMintEvents, authorityLocked: _authorityLocked, initialAllocationDone: _initialAllocationDone };
}

export function loadGetterTupleGSTDJetton$Data(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _maxSupply = source.readBigNumber();
    const _owner = source.readAddress();
    const _mintAuthority = source.readAddress();
    const _content = source.readCell();
    const _mintable = source.readBoolean();
    const _workerPoolMinted = source.readBigNumber();
    const _workerPoolMax = source.readBigNumber();
    const _totalBurned = source.readBigNumber();
    const _totalMintEvents = source.readBigNumber();
    const _authorityLocked = source.readBoolean();
    const _initialAllocationDone = source.readBoolean();
    return { $$type: 'GSTDJetton$Data' as const, totalSupply: _totalSupply, maxSupply: _maxSupply, owner: _owner, mintAuthority: _mintAuthority, content: _content, mintable: _mintable, workerPoolMinted: _workerPoolMinted, workerPoolMax: _workerPoolMax, totalBurned: _totalBurned, totalMintEvents: _totalMintEvents, authorityLocked: _authorityLocked, initialAllocationDone: _initialAllocationDone };
}

export function storeTupleGSTDJetton$Data(source: GSTDJetton$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalSupply);
    builder.writeNumber(source.maxSupply);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.mintAuthority);
    builder.writeCell(source.content);
    builder.writeBoolean(source.mintable);
    builder.writeNumber(source.workerPoolMinted);
    builder.writeNumber(source.workerPoolMax);
    builder.writeNumber(source.totalBurned);
    builder.writeNumber(source.totalMintEvents);
    builder.writeBoolean(source.authorityLocked);
    builder.writeBoolean(source.initialAllocationDone);
    return builder.build();
}

export function dictValueParserGSTDJetton$Data(): DictionaryValue<GSTDJetton$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGSTDJetton$Data(src)).endCell());
        },
        parse: (src) => {
            return loadGSTDJetton$Data(src.loadRef().beginParse());
        }
    }
}

export type FreezeMint = {
    $$type: 'FreezeMint';
}

export function storeFreezeMint(src: FreezeMint) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1022287114, 32);
    };
}

export function loadFreezeMint(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1022287114) { throw Error('Invalid prefix'); }
    return { $$type: 'FreezeMint' as const };
}

export function loadTupleFreezeMint(source: TupleReader) {
    return { $$type: 'FreezeMint' as const };
}

export function loadGetterTupleFreezeMint(source: TupleReader) {
    return { $$type: 'FreezeMint' as const };
}

export function storeTupleFreezeMint(source: FreezeMint) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserFreezeMint(): DictionaryValue<FreezeMint> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeFreezeMint(src)).endCell());
        },
        parse: (src) => {
            return loadFreezeMint(src.loadRef().beginParse());
        }
    }
}

export type JettonData = {
    $$type: 'JettonData';
    totalSupply: bigint;
    mintable: boolean;
    adminAddress: Address;
    jettonContent: Cell;
    jettonWalletCode: Cell;
}

export function storeJettonData(src: JettonData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.totalSupply);
        b_0.storeBit(src.mintable);
        b_0.storeAddress(src.adminAddress);
        b_0.storeRef(src.jettonContent);
        b_0.storeRef(src.jettonWalletCode);
    };
}

export function loadJettonData(slice: Slice) {
    const sc_0 = slice;
    const _totalSupply = sc_0.loadCoins();
    const _mintable = sc_0.loadBit();
    const _adminAddress = sc_0.loadAddress();
    const _jettonContent = sc_0.loadRef();
    const _jettonWalletCode = sc_0.loadRef();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, adminAddress: _adminAddress, jettonContent: _jettonContent, jettonWalletCode: _jettonWalletCode };
}

export function loadTupleJettonData(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _adminAddress = source.readAddress();
    const _jettonContent = source.readCell();
    const _jettonWalletCode = source.readCell();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, adminAddress: _adminAddress, jettonContent: _jettonContent, jettonWalletCode: _jettonWalletCode };
}

export function loadGetterTupleJettonData(source: TupleReader) {
    const _totalSupply = source.readBigNumber();
    const _mintable = source.readBoolean();
    const _adminAddress = source.readAddress();
    const _jettonContent = source.readCell();
    const _jettonWalletCode = source.readCell();
    return { $$type: 'JettonData' as const, totalSupply: _totalSupply, mintable: _mintable, adminAddress: _adminAddress, jettonContent: _jettonContent, jettonWalletCode: _jettonWalletCode };
}

export function storeTupleJettonData(source: JettonData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalSupply);
    builder.writeBoolean(source.mintable);
    builder.writeAddress(source.adminAddress);
    builder.writeCell(source.jettonContent);
    builder.writeCell(source.jettonWalletCode);
    return builder.build();
}

export function dictValueParserJettonData(): DictionaryValue<JettonData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeJettonData(src)).endCell());
        },
        parse: (src) => {
            return loadJettonData(src.loadRef().beginParse());
        }
    }
}

export type WorkerPoolStats = {
    $$type: 'WorkerPoolStats';
    minted: bigint;
    max: bigint;
    remaining: bigint;
}

export function storeWorkerPoolStats(src: WorkerPoolStats) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.minted);
        b_0.storeCoins(src.max);
        b_0.storeCoins(src.remaining);
    };
}

export function loadWorkerPoolStats(slice: Slice) {
    const sc_0 = slice;
    const _minted = sc_0.loadCoins();
    const _max = sc_0.loadCoins();
    const _remaining = sc_0.loadCoins();
    return { $$type: 'WorkerPoolStats' as const, minted: _minted, max: _max, remaining: _remaining };
}

export function loadTupleWorkerPoolStats(source: TupleReader) {
    const _minted = source.readBigNumber();
    const _max = source.readBigNumber();
    const _remaining = source.readBigNumber();
    return { $$type: 'WorkerPoolStats' as const, minted: _minted, max: _max, remaining: _remaining };
}

export function loadGetterTupleWorkerPoolStats(source: TupleReader) {
    const _minted = source.readBigNumber();
    const _max = source.readBigNumber();
    const _remaining = source.readBigNumber();
    return { $$type: 'WorkerPoolStats' as const, minted: _minted, max: _max, remaining: _remaining };
}

export function storeTupleWorkerPoolStats(source: WorkerPoolStats) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.minted);
    builder.writeNumber(source.max);
    builder.writeNumber(source.remaining);
    return builder.build();
}

export function dictValueParserWorkerPoolStats(): DictionaryValue<WorkerPoolStats> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWorkerPoolStats(src)).endCell());
        },
        parse: (src) => {
            return loadWorkerPoolStats(src.loadRef().beginParse());
        }
    }
}

export type BurnStats = {
    $$type: 'BurnStats';
    totalBurned: bigint;
    circulatingSupply: bigint;
    totalMintEvents: bigint;
}

export function storeBurnStats(src: BurnStats) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.totalBurned);
        b_0.storeCoins(src.circulatingSupply);
        b_0.storeUint(src.totalMintEvents, 64);
    };
}

export function loadBurnStats(slice: Slice) {
    const sc_0 = slice;
    const _totalBurned = sc_0.loadCoins();
    const _circulatingSupply = sc_0.loadCoins();
    const _totalMintEvents = sc_0.loadUintBig(64);
    return { $$type: 'BurnStats' as const, totalBurned: _totalBurned, circulatingSupply: _circulatingSupply, totalMintEvents: _totalMintEvents };
}

export function loadTupleBurnStats(source: TupleReader) {
    const _totalBurned = source.readBigNumber();
    const _circulatingSupply = source.readBigNumber();
    const _totalMintEvents = source.readBigNumber();
    return { $$type: 'BurnStats' as const, totalBurned: _totalBurned, circulatingSupply: _circulatingSupply, totalMintEvents: _totalMintEvents };
}

export function loadGetterTupleBurnStats(source: TupleReader) {
    const _totalBurned = source.readBigNumber();
    const _circulatingSupply = source.readBigNumber();
    const _totalMintEvents = source.readBigNumber();
    return { $$type: 'BurnStats' as const, totalBurned: _totalBurned, circulatingSupply: _circulatingSupply, totalMintEvents: _totalMintEvents };
}

export function storeTupleBurnStats(source: BurnStats) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalBurned);
    builder.writeNumber(source.circulatingSupply);
    builder.writeNumber(source.totalMintEvents);
    return builder.build();
}

export function dictValueParserBurnStats(): DictionaryValue<BurnStats> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBurnStats(src)).endCell());
        },
        parse: (src) => {
            return loadBurnStats(src.loadRef().beginParse());
        }
    }
}

export type GSTDJettonWallet$Data = {
    $$type: 'GSTDJettonWallet$Data';
    balance: bigint;
    owner: Address;
    jettonMaster: Address;
}

export function storeGSTDJettonWallet$Data(src: GSTDJettonWallet$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.jettonMaster);
    };
}

export function loadGSTDJettonWallet$Data(slice: Slice) {
    const sc_0 = slice;
    const _balance = sc_0.loadCoins();
    const _owner = sc_0.loadAddress();
    const _jettonMaster = sc_0.loadAddress();
    return { $$type: 'GSTDJettonWallet$Data' as const, balance: _balance, owner: _owner, jettonMaster: _jettonMaster };
}

export function loadTupleGSTDJettonWallet$Data(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _jettonMaster = source.readAddress();
    return { $$type: 'GSTDJettonWallet$Data' as const, balance: _balance, owner: _owner, jettonMaster: _jettonMaster };
}

export function loadGetterTupleGSTDJettonWallet$Data(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _jettonMaster = source.readAddress();
    return { $$type: 'GSTDJettonWallet$Data' as const, balance: _balance, owner: _owner, jettonMaster: _jettonMaster };
}

export function storeTupleGSTDJettonWallet$Data(source: GSTDJettonWallet$Data) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.jettonMaster);
    return builder.build();
}

export function dictValueParserGSTDJettonWallet$Data(): DictionaryValue<GSTDJettonWallet$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGSTDJettonWallet$Data(src)).endCell());
        },
        parse: (src) => {
            return loadGSTDJettonWallet$Data(src.loadRef().beginParse());
        }
    }
}

export type WalletData = {
    $$type: 'WalletData';
    balance: bigint;
    owner: Address;
    jettonMaster: Address;
    jettonWalletCode: Cell;
}

export function storeWalletData(src: WalletData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.balance);
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.jettonMaster);
        b_0.storeRef(src.jettonWalletCode);
    };
}

export function loadWalletData(slice: Slice) {
    const sc_0 = slice;
    const _balance = sc_0.loadCoins();
    const _owner = sc_0.loadAddress();
    const _jettonMaster = sc_0.loadAddress();
    const _jettonWalletCode = sc_0.loadRef();
    return { $$type: 'WalletData' as const, balance: _balance, owner: _owner, jettonMaster: _jettonMaster, jettonWalletCode: _jettonWalletCode };
}

export function loadTupleWalletData(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _jettonMaster = source.readAddress();
    const _jettonWalletCode = source.readCell();
    return { $$type: 'WalletData' as const, balance: _balance, owner: _owner, jettonMaster: _jettonMaster, jettonWalletCode: _jettonWalletCode };
}

export function loadGetterTupleWalletData(source: TupleReader) {
    const _balance = source.readBigNumber();
    const _owner = source.readAddress();
    const _jettonMaster = source.readAddress();
    const _jettonWalletCode = source.readCell();
    return { $$type: 'WalletData' as const, balance: _balance, owner: _owner, jettonMaster: _jettonMaster, jettonWalletCode: _jettonWalletCode };
}

export function storeTupleWalletData(source: WalletData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.balance);
    builder.writeAddress(source.owner);
    builder.writeAddress(source.jettonMaster);
    builder.writeCell(source.jettonWalletCode);
    return builder.build();
}

export function dictValueParserWalletData(): DictionaryValue<WalletData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWalletData(src)).endCell());
        },
        parse: (src) => {
            return loadWalletData(src.loadRef().beginParse());
        }
    }
}

 type GSTDJetton_init_args = {
    $$type: 'GSTDJetton_init_args';
    owner: Address;
    content: Cell;
}

function initGSTDJetton_init_args(src: GSTDJetton_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeRef(src.content);
    };
}

async function GSTDJetton_init(owner: Address, content: Cell) {
    const __code = Cell.fromHex('b5ee9c7241023901000dd7000114ff00f4a413f4bcf2c80b01020162021602f8d001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e2bfa00fa00fa40fa40d4d200fa00d401d0fa00fa00d33fd200d20030105c105b105a10591058105710566c1c8e27fa40d45902d101217082300de0b6b3a76400007f228230058d15e1762800005311106910587070e20de3020bd70d1f030400cc0b8020d7217021d749c21f9430d31f01de8210ac130557ba8e49d33ffa00596c2151aaa1504aa1109b108a1079106810571046443512c87f01ca0055b050cbfa025009fa0217ce15ce13ccca0001fa02c858fa0258fa0212cb3f13ca00ca00cdc9ed54e05f0d04fef2e082218210bb7a9ab8bae3022182103fee837abae3022182106377b77fbae3022182106cbd4f45ba8e52313706fa403082008aabf84229c705f2f4816fc40bb31bf2f4108a10791068104655137f01c87f01ca0055b050cbfa025009fa0217ce15ce13ccca0001fa02c858fa0258fa0212cb3f13ca00ca00cdc9ed54e02105070f1302f831fa40fa00d33f3081207ff8422bc705f2f48200ddb828f2f48200ba6253d2a02dbbf2f48200935f5372a027bbf2f451c1a05161a003a4f8285230db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d0821004c4b400727ff82882089896808b08260601e805111505104a1023102bc855508210ac1305575007cb1f15cb3f5003fa02cece01fa02cec91605111005041110045a10465522c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00103b108a107910681057104645155044030e04c431fa40fa00fa40fa00d430d0fa40fa003082008aabf8422fc705f2f482008f205611b3f2f48200f96c1112b301111201f2f45331a05611a08139cc561022a05610bbf2f40f7f1110a024c200923434e30d20c200915be30d2dc200923d30e30d5518080a0c0e02fef8285260db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d0821004c4b400727071f82882089896808b081035104e1023102fc855508210ac1305575007cb1f15cb3f5003fa02cece01fa02cec94650104a103940a910465522c8cf8580ca00cf8440ce2609005001fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00102302fcf8285220db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d0821004c4b400727021f82882089896808b081035104a1023102bc855508210ac1305575007cb1f15cb3f5003fa02cece01fa02cec940165044050310465522c8cf8580ca00cf8440ce01260b004afa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002fcf8285220db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d0821004c4b400727073f82882089896808b081035041117041023102bc855508210ac1305575007cb1f15cb3f5003fa02cece01fa02cec9465010240311120359111210465522c8cf8580260d0058ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00005ac87f01ca0055b050cbfa025009fa0217ce15ce13ccca0001fa02c858fa0258fa0212cb3f13ca00ca00cdc9ed5403fe31d33f31fa00fa40fa4030f82812db3c810eecf8425a705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d0c705f2f451b1a15033a08d086000000000000000000000000000000000000000000000000000000000000000000452b0c705b3913ae30d1b108a1079261012017c7080427088104e10246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00110026000000004275726e207375636365737366756c006e10681057104610354044c87f01ca0055b050cbfa025009fa0217ce15ce13ccca0001fa02c858fa0258fa0212cb3f13ca00ca00cdc9ed5402e08210af1ca26aba8e4d313605d43082008aabf84229c705f2f4109b108a107910680710461035443012c87f01ca0055b050cbfa025009fa0217ce15ce13ccca0001fa02c858fa0258fa0212cb3f13ca00ca00cdc9ed54e02182103ceedd0abae302018210946a98b6bae3025f0df2c082141500945b3482008aabf84228c705f2f4108a1079106810571046700610354403c87f01ca0055b050cbfa025009fa0217ce15ce13ccca0001fa02c858fa0258fa0212cb3f13ca00ca00cdc9ed5400e8d33f30c8018210aff90f5758cb1fcb3fc910ac109b108a10791068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055b050cbfa025009fa0217ce15ce13ccca0001fa02c858fa0258fa0212cb3f13ca00ca00cdc9ed54020120171f020158181a01c7b4a3bda89a1a400031c57f401f401f481f481a9a401f401a803a1f401f401a67fa401a4006020b820b620b420b220b020ae20acd8391c4ff481a8b205a20242e104601bc16d674ec80000fe4504600b1a2bc2ec500000a62220d220b0e0e1c5b678d98301900022902016a1b1d01c6aa14ed44d0d200018e2bfa00fa00fa40fa40d4d200fa00d401d0fa00fa00d33fd200d20030105c105b105a10591058105710566c1c8e27fa40d45902d101217082300de0b6b3a76400007f228230058d15e1762800005311106910587070e2db3c6cc11c00022a01c6a8afed44d0d200018e2bfa00fa00fa40fa40d4d200fa00d401d0fa00fa00d33fd200d20030105c105b105a10591058105710566c1c8e27fa40d45902d101217082300de0b6b3a76400007f228230058d15e1762800005311106910587070e2db3c6cc31e000c5345a154666002012020370201202135020158222401cbadbcf6a268690000c715fd007d007d207d206a69007d006a00e87d007d00699fe900690018082e082d882d082c882c082b882b360e4713fd206a2c81688090b8411806f05b59d3b200003f91411802c68af0bb14000029888834882c3838712a85ed9e3660c0230162f828db3c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d02601c7af16f6a268690000c715fd007d007d207d206a69007d006a00e87d007d00699fe900690018082e082d882d082c882c082b882b360e4713fd206a2c81688090b8411806f05b59d3b200003f91411802c68af0bb14000029888834882c3838716d9e3662c025011af828f828db3c30546c80546cb0260104db3c27011688c87001ca005a02cecec9280114ff00f4a413f4bcf2c80b290201622a3201eed001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200019afa00fa40fa4055206c139afa40fa405902d1017059e2048e36028020d7217021d749c21f9430d31f01de8210ac130557ba8e19d33ffa00596c21a002c87f01ca0055205afa0212cecec9ed54e05f04e002d70d1ff2e082212b03fe8210ac130557ba8f6d31d33ffa00fa40fa4031fa005327db3cf84259705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d0c705917f95f84228c705e281114d01f2f45153a021c200926c51e30d02c87f01ca0055205afa0212cecec9ed54e0218210558e297bba342c2d00b0147250437007c855308210f4e4f5915005cb1f13cb3f01fa02cecec9250403505510246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb000222e3020182104056115dbae3025f04f2c0822e3002fe31d33ffa00fa40fa40f40431fa0082009058f84229c705f2f48200d5575375bef2f45164a15138db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d050767080407f2c4813507cc855508210ac1305575007cb1f15cb3f5003fa02cece01fa02cec91056342f00981057103440130710465522c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002c87f01ca0055205afa0212cecec9ed5401f2d33ffa00fa4030815427f84226c705f2f48200d5575342bef2f45131a17080405414367f07c8553082106377b77f5005cb1f13cb3f01fa02cecec926044313505510246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002310020c87f01ca0055205afa0212cecec9ed540147a0f605da89a1a4000335f401f481f480aa40d82735f481f480b205a202e0b3c5b678d8693301125cdb3c305463305230340018f82ac87001ca005a02cecec901c7b4249da89a1a400031c57f401f401f481f481a9a401f401a803a1f401f401a67fa401a4006020b820b620b420b220b020ae20acd8391c4ff481a8b205a20242e104601bc16d674ec80000fe4504600b1a2bc2ec500000a62220d220b0e0e1c5b678d98303600022801c7bbd78ed44d0d200018e2bfa00fa00fa40fa40d4d200fa00d401d0fa00fa00d33fd200d20030105c105b105a10591058105710566c1c8e27fa40d45902d101217082300de0b6b3a76400007f228230058d15e1762800005311106910587070e2db3c6cc383800065473b29c9f78b9');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initGSTDJetton_init_args({ $$type: 'GSTDJetton_init_args', owner, content })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const GSTDJetton_errors = {
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
    3820: { message: "Invalid burn notification" },
    4429: { message: "Invalid sender" },
    8319: { message: "Only Settlement can mint" },
    14796: { message: "Exceeds max supply" },
    21543: { message: "Only owner can burn" },
    28612: { message: "Mint authority already locked" },
    35499: { message: "Only owner" },
    36640: { message: "Cannot pre-mint after authority locked" },
    36952: { message: "Only owner can transfer" },
    37727: { message: "Worker pool exhausted" },
    47714: { message: "Max supply reached" },
    54615: { message: "Insufficient balance" },
    56760: { message: "Minting disabled" },
    63852: { message: "Initial allocation already done" },
} as const

export const GSTDJetton_errors_backward = {
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
    "Invalid burn notification": 3820,
    "Invalid sender": 4429,
    "Only Settlement can mint": 8319,
    "Exceeds max supply": 14796,
    "Only owner can burn": 21543,
    "Mint authority already locked": 28612,
    "Only owner": 35499,
    "Cannot pre-mint after authority locked": 36640,
    "Only owner can transfer": 36952,
    "Worker pool exhausted": 37727,
    "Max supply reached": 47714,
    "Insufficient balance": 54615,
    "Minting disabled": 56760,
    "Initial allocation already done": 63852,
} as const

const GSTDJetton_types: ABIType[] = [
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
    {"name":"MintWorkerReward","header":3145374392,"fields":[{"name":"workerAddr","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"taskId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"SetMintAuthority","header":1824345925,"fields":[{"name":"newAuthority","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"BurnNotification","header":1668790143,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"TransferNotification","header":4108645777,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"TokenUpdateContent","header":2937889386,"fields":[{"name":"content","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"MintInitialAllocation","header":1072595834,"fields":[{"name":"teamAddr","type":{"kind":"simple","type":"address","optional":false}},{"name":"teamAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"ecosystemAddr","type":{"kind":"simple","type":"address","optional":false}},{"name":"ecosystemAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"liquidityAddr","type":{"kind":"simple","type":"address","optional":false}},{"name":"liquidityAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"Transfer","header":1435380091,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":false}},{"name":"customPayload","type":{"kind":"simple","type":"cell","optional":true}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"InternalTransfer","header":2886927703,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"from","type":{"kind":"simple","type":"address","optional":false}},{"name":"responseAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardTonAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"Burn","header":1079382365,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"responseDestination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"GSTDJetton$Data","header":null,"fields":[{"name":"totalSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"maxSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"mintAuthority","type":{"kind":"simple","type":"address","optional":false}},{"name":"content","type":{"kind":"simple","type":"cell","optional":false}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"workerPoolMinted","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"workerPoolMax","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalBurned","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalMintEvents","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"authorityLocked","type":{"kind":"simple","type":"bool","optional":false}},{"name":"initialAllocationDone","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"FreezeMint","header":1022287114,"fields":[]},
    {"name":"JettonData","header":null,"fields":[{"name":"totalSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"mintable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"adminAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonContent","type":{"kind":"simple","type":"cell","optional":false}},{"name":"jettonWalletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"WorkerPoolStats","header":null,"fields":[{"name":"minted","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"max","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"remaining","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"BurnStats","header":null,"fields":[{"name":"totalBurned","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"circulatingSupply","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalMintEvents","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"GSTDJettonWallet$Data","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonMaster","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"WalletData","header":null,"fields":[{"name":"balance","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"jettonWalletCode","type":{"kind":"simple","type":"cell","optional":false}}]},
]

const GSTDJetton_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "MintWorkerReward": 3145374392,
    "SetMintAuthority": 1824345925,
    "BurnNotification": 1668790143,
    "TransferNotification": 4108645777,
    "TokenUpdateContent": 2937889386,
    "MintInitialAllocation": 1072595834,
    "Transfer": 1435380091,
    "InternalTransfer": 2886927703,
    "Burn": 1079382365,
    "FreezeMint": 1022287114,
}

const GSTDJetton_getters: ABIGetter[] = [
    {"name":"get_jetton_data","methodId":106029,"arguments":[],"returnType":{"kind":"simple","type":"JettonData","optional":false}},
    {"name":"get_wallet_address","methodId":103289,"arguments":[{"name":"ownerAddress","type":{"kind":"simple","type":"address","optional":false}}],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"get_max_supply","methodId":94740,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_worker_pool_stats","methodId":95407,"arguments":[],"returnType":{"kind":"simple","type":"WorkerPoolStats","optional":false}},
    {"name":"get_burn_stats","methodId":130424,"arguments":[],"returnType":{"kind":"simple","type":"BurnStats","optional":false}},
    {"name":"get_mint_authority","methodId":106788,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const GSTDJetton_getterMapping: { [key: string]: string } = {
    'get_jetton_data': 'getGetJettonData',
    'get_wallet_address': 'getGetWalletAddress',
    'get_max_supply': 'getGetMaxSupply',
    'get_worker_pool_stats': 'getGetWorkerPoolStats',
    'get_burn_stats': 'getGetBurnStats',
    'get_mint_authority': 'getGetMintAuthority',
    'owner': 'getOwner',
}

const GSTDJetton_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"MintWorkerReward"}},
    {"receiver":"internal","message":{"kind":"typed","type":"MintInitialAllocation"}},
    {"receiver":"internal","message":{"kind":"typed","type":"BurnNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetMintAuthority"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TokenUpdateContent"}},
    {"receiver":"internal","message":{"kind":"typed","type":"FreezeMint"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class GSTDJetton implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = GSTDJetton_errors_backward;
    public static readonly opcodes = GSTDJetton_opcodes;
    
    static async init(owner: Address, content: Cell) {
        return await GSTDJetton_init(owner, content);
    }
    
    static async fromInit(owner: Address, content: Cell) {
        const __gen_init = await GSTDJetton_init(owner, content);
        const address = contractAddress(0, __gen_init);
        return new GSTDJetton(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new GSTDJetton(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  GSTDJetton_types,
        getters: GSTDJetton_getters,
        receivers: GSTDJetton_receivers,
        errors: GSTDJetton_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: MintWorkerReward | MintInitialAllocation | BurnNotification | SetMintAuthority | TokenUpdateContent | FreezeMint | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'MintWorkerReward') {
            body = beginCell().store(storeMintWorkerReward(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'MintInitialAllocation') {
            body = beginCell().store(storeMintInitialAllocation(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'BurnNotification') {
            body = beginCell().store(storeBurnNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetMintAuthority') {
            body = beginCell().store(storeSetMintAuthority(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TokenUpdateContent') {
            body = beginCell().store(storeTokenUpdateContent(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'FreezeMint') {
            body = beginCell().store(storeFreezeMint(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetJettonData(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_jetton_data', builder.build())).stack;
        const result = loadGetterTupleJettonData(source);
        return result;
    }
    
    async getGetWalletAddress(provider: ContractProvider, ownerAddress: Address) {
        const builder = new TupleBuilder();
        builder.writeAddress(ownerAddress);
        const source = (await provider.get('get_wallet_address', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getGetMaxSupply(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_max_supply', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetWorkerPoolStats(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_worker_pool_stats', builder.build())).stack;
        const result = loadGetterTupleWorkerPoolStats(source);
        return result;
    }
    
    async getGetBurnStats(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_burn_stats', builder.build())).stack;
        const result = loadGetterTupleBurnStats(source);
        return result;
    }
    
    async getGetMintAuthority(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_mint_authority', builder.build())).stack;
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