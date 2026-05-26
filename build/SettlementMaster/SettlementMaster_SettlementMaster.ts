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

export type SettleTask = {
    $$type: 'SettleTask';
    taskId: bigint;
    workerAddr: Address;
    gstdBonusAmount: bigint;
    qualityScore: bigint;
    computeUnits: bigint;
}

export function storeSettleTask(src: SettleTask) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1462673144, 32);
        b_0.storeUint(src.taskId, 64);
        b_0.storeAddress(src.workerAddr);
        b_0.storeCoins(src.gstdBonusAmount);
        b_0.storeUint(src.qualityScore, 32);
        b_0.storeUint(src.computeUnits, 64);
    };
}

export function loadSettleTask(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1462673144) { throw Error('Invalid prefix'); }
    const _taskId = sc_0.loadUintBig(64);
    const _workerAddr = sc_0.loadAddress();
    const _gstdBonusAmount = sc_0.loadCoins();
    const _qualityScore = sc_0.loadUintBig(32);
    const _computeUnits = sc_0.loadUintBig(64);
    return { $$type: 'SettleTask' as const, taskId: _taskId, workerAddr: _workerAddr, gstdBonusAmount: _gstdBonusAmount, qualityScore: _qualityScore, computeUnits: _computeUnits };
}

export function loadTupleSettleTask(source: TupleReader) {
    const _taskId = source.readBigNumber();
    const _workerAddr = source.readAddress();
    const _gstdBonusAmount = source.readBigNumber();
    const _qualityScore = source.readBigNumber();
    const _computeUnits = source.readBigNumber();
    return { $$type: 'SettleTask' as const, taskId: _taskId, workerAddr: _workerAddr, gstdBonusAmount: _gstdBonusAmount, qualityScore: _qualityScore, computeUnits: _computeUnits };
}

export function loadGetterTupleSettleTask(source: TupleReader) {
    const _taskId = source.readBigNumber();
    const _workerAddr = source.readAddress();
    const _gstdBonusAmount = source.readBigNumber();
    const _qualityScore = source.readBigNumber();
    const _computeUnits = source.readBigNumber();
    return { $$type: 'SettleTask' as const, taskId: _taskId, workerAddr: _workerAddr, gstdBonusAmount: _gstdBonusAmount, qualityScore: _qualityScore, computeUnits: _computeUnits };
}

export function storeTupleSettleTask(source: SettleTask) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.taskId);
    builder.writeAddress(source.workerAddr);
    builder.writeNumber(source.gstdBonusAmount);
    builder.writeNumber(source.qualityScore);
    builder.writeNumber(source.computeUnits);
    return builder.build();
}

export function dictValueParserSettleTask(): DictionaryValue<SettleTask> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSettleTask(src)).endCell());
        },
        parse: (src) => {
            return loadSettleTask(src.loadRef().beginParse());
        }
    }
}

export type WorkerPayment = {
    $$type: 'WorkerPayment';
    taskId: bigint;
    amount: bigint;
    bonusGSTD: bigint;
}

export function storeWorkerPayment(src: WorkerPayment) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1500073070, 32);
        b_0.storeUint(src.taskId, 64);
        b_0.storeCoins(src.amount);
        b_0.storeCoins(src.bonusGSTD);
    };
}

export function loadWorkerPayment(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1500073070) { throw Error('Invalid prefix'); }
    const _taskId = sc_0.loadUintBig(64);
    const _amount = sc_0.loadCoins();
    const _bonusGSTD = sc_0.loadCoins();
    return { $$type: 'WorkerPayment' as const, taskId: _taskId, amount: _amount, bonusGSTD: _bonusGSTD };
}

export function loadTupleWorkerPayment(source: TupleReader) {
    const _taskId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _bonusGSTD = source.readBigNumber();
    return { $$type: 'WorkerPayment' as const, taskId: _taskId, amount: _amount, bonusGSTD: _bonusGSTD };
}

export function loadGetterTupleWorkerPayment(source: TupleReader) {
    const _taskId = source.readBigNumber();
    const _amount = source.readBigNumber();
    const _bonusGSTD = source.readBigNumber();
    return { $$type: 'WorkerPayment' as const, taskId: _taskId, amount: _amount, bonusGSTD: _bonusGSTD };
}

export function storeTupleWorkerPayment(source: WorkerPayment) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.taskId);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.bonusGSTD);
    return builder.build();
}

export function dictValueParserWorkerPayment(): DictionaryValue<WorkerPayment> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWorkerPayment(src)).endCell());
        },
        parse: (src) => {
            return loadWorkerPayment(src.loadRef().beginParse());
        }
    }
}

export type UpdateShares = {
    $$type: 'UpdateShares';
    worker: bigint;
    treasury: bigint;
    protocol: bigint;
}

export function storeUpdateShares(src: UpdateShares) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3201974444, 32);
        b_0.storeUint(src.worker, 8);
        b_0.storeUint(src.treasury, 8);
        b_0.storeUint(src.protocol, 8);
    };
}

export function loadUpdateShares(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3201974444) { throw Error('Invalid prefix'); }
    const _worker = sc_0.loadUintBig(8);
    const _treasury = sc_0.loadUintBig(8);
    const _protocol = sc_0.loadUintBig(8);
    return { $$type: 'UpdateShares' as const, worker: _worker, treasury: _treasury, protocol: _protocol };
}

export function loadTupleUpdateShares(source: TupleReader) {
    const _worker = source.readBigNumber();
    const _treasury = source.readBigNumber();
    const _protocol = source.readBigNumber();
    return { $$type: 'UpdateShares' as const, worker: _worker, treasury: _treasury, protocol: _protocol };
}

export function loadGetterTupleUpdateShares(source: TupleReader) {
    const _worker = source.readBigNumber();
    const _treasury = source.readBigNumber();
    const _protocol = source.readBigNumber();
    return { $$type: 'UpdateShares' as const, worker: _worker, treasury: _treasury, protocol: _protocol };
}

export function storeTupleUpdateShares(source: UpdateShares) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.worker);
    builder.writeNumber(source.treasury);
    builder.writeNumber(source.protocol);
    return builder.build();
}

export function dictValueParserUpdateShares(): DictionaryValue<UpdateShares> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateShares(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateShares(src.loadRef().beginParse());
        }
    }
}

export type UpdateAddresses = {
    $$type: 'UpdateAddresses';
    treasury: Address;
    protocolFee: Address;
    gstdJetton: Address;
}

export function storeUpdateAddresses(src: UpdateAddresses) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1410061209, 32);
        b_0.storeAddress(src.treasury);
        b_0.storeAddress(src.protocolFee);
        b_0.storeAddress(src.gstdJetton);
    };
}

export function loadUpdateAddresses(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1410061209) { throw Error('Invalid prefix'); }
    const _treasury = sc_0.loadAddress();
    const _protocolFee = sc_0.loadAddress();
    const _gstdJetton = sc_0.loadAddress();
    return { $$type: 'UpdateAddresses' as const, treasury: _treasury, protocolFee: _protocolFee, gstdJetton: _gstdJetton };
}

export function loadTupleUpdateAddresses(source: TupleReader) {
    const _treasury = source.readAddress();
    const _protocolFee = source.readAddress();
    const _gstdJetton = source.readAddress();
    return { $$type: 'UpdateAddresses' as const, treasury: _treasury, protocolFee: _protocolFee, gstdJetton: _gstdJetton };
}

export function loadGetterTupleUpdateAddresses(source: TupleReader) {
    const _treasury = source.readAddress();
    const _protocolFee = source.readAddress();
    const _gstdJetton = source.readAddress();
    return { $$type: 'UpdateAddresses' as const, treasury: _treasury, protocolFee: _protocolFee, gstdJetton: _gstdJetton };
}

export function storeTupleUpdateAddresses(source: UpdateAddresses) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.treasury);
    builder.writeAddress(source.protocolFee);
    builder.writeAddress(source.gstdJetton);
    return builder.build();
}

export function dictValueParserUpdateAddresses(): DictionaryValue<UpdateAddresses> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeUpdateAddresses(src)).endCell());
        },
        parse: (src) => {
            return loadUpdateAddresses(src.loadRef().beginParse());
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

export type SetBaseRate = {
    $$type: 'SetBaseRate';
    rate: bigint;
}

export function storeSetBaseRate(src: SetBaseRate) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3608050927, 32);
        b_0.storeCoins(src.rate);
    };
}

export function loadSetBaseRate(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3608050927) { throw Error('Invalid prefix'); }
    const _rate = sc_0.loadCoins();
    return { $$type: 'SetBaseRate' as const, rate: _rate };
}

export function loadTupleSetBaseRate(source: TupleReader) {
    const _rate = source.readBigNumber();
    return { $$type: 'SetBaseRate' as const, rate: _rate };
}

export function loadGetterTupleSetBaseRate(source: TupleReader) {
    const _rate = source.readBigNumber();
    return { $$type: 'SetBaseRate' as const, rate: _rate };
}

export function storeTupleSetBaseRate(source: SetBaseRate) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.rate);
    return builder.build();
}

export function dictValueParserSetBaseRate(): DictionaryValue<SetBaseRate> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetBaseRate(src)).endCell());
        },
        parse: (src) => {
            return loadSetBaseRate(src.loadRef().beginParse());
        }
    }
}

export type EmergencyPause = {
    $$type: 'EmergencyPause';
    paused: boolean;
}

export function storeEmergencyPause(src: EmergencyPause) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1064338113, 32);
        b_0.storeBit(src.paused);
    };
}

export function loadEmergencyPause(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1064338113) { throw Error('Invalid prefix'); }
    const _paused = sc_0.loadBit();
    return { $$type: 'EmergencyPause' as const, paused: _paused };
}

export function loadTupleEmergencyPause(source: TupleReader) {
    const _paused = source.readBoolean();
    return { $$type: 'EmergencyPause' as const, paused: _paused };
}

export function loadGetterTupleEmergencyPause(source: TupleReader) {
    const _paused = source.readBoolean();
    return { $$type: 'EmergencyPause' as const, paused: _paused };
}

export function storeTupleEmergencyPause(source: EmergencyPause) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.paused);
    return builder.build();
}

export function dictValueParserEmergencyPause(): DictionaryValue<EmergencyPause> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeEmergencyPause(src)).endCell());
        },
        parse: (src) => {
            return loadEmergencyPause(src.loadRef().beginParse());
        }
    }
}

export type SetGateway = {
    $$type: 'SetGateway';
    gateway: Address;
}

export function storeSetGateway(src: SetGateway) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2824752052, 32);
        b_0.storeAddress(src.gateway);
    };
}

export function loadSetGateway(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2824752052) { throw Error('Invalid prefix'); }
    const _gateway = sc_0.loadAddress();
    return { $$type: 'SetGateway' as const, gateway: _gateway };
}

export function loadTupleSetGateway(source: TupleReader) {
    const _gateway = source.readAddress();
    return { $$type: 'SetGateway' as const, gateway: _gateway };
}

export function loadGetterTupleSetGateway(source: TupleReader) {
    const _gateway = source.readAddress();
    return { $$type: 'SetGateway' as const, gateway: _gateway };
}

export function storeTupleSetGateway(source: SetGateway) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.gateway);
    return builder.build();
}

export function dictValueParserSetGateway(): DictionaryValue<SetGateway> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetGateway(src)).endCell());
        },
        parse: (src) => {
            return loadSetGateway(src.loadRef().beginParse());
        }
    }
}

export type SettlementMaster$Data = {
    $$type: 'SettlementMaster$Data';
    owner: Address;
    gateway: Address;
    gstdJetton: Address;
    treasury: Address;
    protocolFee: Address;
    workerShare: bigint;
    treasuryShare: bigint;
    protocolShare: bigint;
    baseRate: bigint;
    totalSettled: bigint;
    totalGSTDMinted: bigint;
    taskCount: bigint;
    paused: boolean;
    minPayment: bigint;
}

export function storeSettlementMaster$Data(src: SettlementMaster$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.gateway);
        b_0.storeAddress(src.gstdJetton);
        const b_1 = new Builder();
        b_1.storeAddress(src.treasury);
        b_1.storeAddress(src.protocolFee);
        b_1.storeUint(src.workerShare, 8);
        b_1.storeUint(src.treasuryShare, 8);
        b_1.storeUint(src.protocolShare, 8);
        b_1.storeCoins(src.baseRate);
        b_1.storeCoins(src.totalSettled);
        b_1.storeCoins(src.totalGSTDMinted);
        b_1.storeUint(src.taskCount, 64);
        b_1.storeBit(src.paused);
        const b_2 = new Builder();
        b_2.storeCoins(src.minPayment);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadSettlementMaster$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _gateway = sc_0.loadAddress();
    const _gstdJetton = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _treasury = sc_1.loadAddress();
    const _protocolFee = sc_1.loadAddress();
    const _workerShare = sc_1.loadUintBig(8);
    const _treasuryShare = sc_1.loadUintBig(8);
    const _protocolShare = sc_1.loadUintBig(8);
    const _baseRate = sc_1.loadCoins();
    const _totalSettled = sc_1.loadCoins();
    const _totalGSTDMinted = sc_1.loadCoins();
    const _taskCount = sc_1.loadUintBig(64);
    const _paused = sc_1.loadBit();
    const sc_2 = sc_1.loadRef().beginParse();
    const _minPayment = sc_2.loadCoins();
    return { $$type: 'SettlementMaster$Data' as const, owner: _owner, gateway: _gateway, gstdJetton: _gstdJetton, treasury: _treasury, protocolFee: _protocolFee, workerShare: _workerShare, treasuryShare: _treasuryShare, protocolShare: _protocolShare, baseRate: _baseRate, totalSettled: _totalSettled, totalGSTDMinted: _totalGSTDMinted, taskCount: _taskCount, paused: _paused, minPayment: _minPayment };
}

export function loadTupleSettlementMaster$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _gateway = source.readAddress();
    const _gstdJetton = source.readAddress();
    const _treasury = source.readAddress();
    const _protocolFee = source.readAddress();
    const _workerShare = source.readBigNumber();
    const _treasuryShare = source.readBigNumber();
    const _protocolShare = source.readBigNumber();
    const _baseRate = source.readBigNumber();
    const _totalSettled = source.readBigNumber();
    const _totalGSTDMinted = source.readBigNumber();
    const _taskCount = source.readBigNumber();
    const _paused = source.readBoolean();
    const _minPayment = source.readBigNumber();
    return { $$type: 'SettlementMaster$Data' as const, owner: _owner, gateway: _gateway, gstdJetton: _gstdJetton, treasury: _treasury, protocolFee: _protocolFee, workerShare: _workerShare, treasuryShare: _treasuryShare, protocolShare: _protocolShare, baseRate: _baseRate, totalSettled: _totalSettled, totalGSTDMinted: _totalGSTDMinted, taskCount: _taskCount, paused: _paused, minPayment: _minPayment };
}

export function loadGetterTupleSettlementMaster$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _gateway = source.readAddress();
    const _gstdJetton = source.readAddress();
    const _treasury = source.readAddress();
    const _protocolFee = source.readAddress();
    const _workerShare = source.readBigNumber();
    const _treasuryShare = source.readBigNumber();
    const _protocolShare = source.readBigNumber();
    const _baseRate = source.readBigNumber();
    const _totalSettled = source.readBigNumber();
    const _totalGSTDMinted = source.readBigNumber();
    const _taskCount = source.readBigNumber();
    const _paused = source.readBoolean();
    const _minPayment = source.readBigNumber();
    return { $$type: 'SettlementMaster$Data' as const, owner: _owner, gateway: _gateway, gstdJetton: _gstdJetton, treasury: _treasury, protocolFee: _protocolFee, workerShare: _workerShare, treasuryShare: _treasuryShare, protocolShare: _protocolShare, baseRate: _baseRate, totalSettled: _totalSettled, totalGSTDMinted: _totalGSTDMinted, taskCount: _taskCount, paused: _paused, minPayment: _minPayment };
}

export function storeTupleSettlementMaster$Data(source: SettlementMaster$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.gateway);
    builder.writeAddress(source.gstdJetton);
    builder.writeAddress(source.treasury);
    builder.writeAddress(source.protocolFee);
    builder.writeNumber(source.workerShare);
    builder.writeNumber(source.treasuryShare);
    builder.writeNumber(source.protocolShare);
    builder.writeNumber(source.baseRate);
    builder.writeNumber(source.totalSettled);
    builder.writeNumber(source.totalGSTDMinted);
    builder.writeNumber(source.taskCount);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.minPayment);
    return builder.build();
}

export function dictValueParserSettlementMaster$Data(): DictionaryValue<SettlementMaster$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSettlementMaster$Data(src)).endCell());
        },
        parse: (src) => {
            return loadSettlementMaster$Data(src.loadRef().beginParse());
        }
    }
}

export type SettlementStats = {
    $$type: 'SettlementStats';
    totalSettled: bigint;
    totalGSTDMinted: bigint;
    taskCount: bigint;
    baseRate: bigint;
}

export function storeSettlementStats(src: SettlementStats) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.totalSettled);
        b_0.storeCoins(src.totalGSTDMinted);
        b_0.storeUint(src.taskCount, 64);
        b_0.storeCoins(src.baseRate);
    };
}

export function loadSettlementStats(slice: Slice) {
    const sc_0 = slice;
    const _totalSettled = sc_0.loadCoins();
    const _totalGSTDMinted = sc_0.loadCoins();
    const _taskCount = sc_0.loadUintBig(64);
    const _baseRate = sc_0.loadCoins();
    return { $$type: 'SettlementStats' as const, totalSettled: _totalSettled, totalGSTDMinted: _totalGSTDMinted, taskCount: _taskCount, baseRate: _baseRate };
}

export function loadTupleSettlementStats(source: TupleReader) {
    const _totalSettled = source.readBigNumber();
    const _totalGSTDMinted = source.readBigNumber();
    const _taskCount = source.readBigNumber();
    const _baseRate = source.readBigNumber();
    return { $$type: 'SettlementStats' as const, totalSettled: _totalSettled, totalGSTDMinted: _totalGSTDMinted, taskCount: _taskCount, baseRate: _baseRate };
}

export function loadGetterTupleSettlementStats(source: TupleReader) {
    const _totalSettled = source.readBigNumber();
    const _totalGSTDMinted = source.readBigNumber();
    const _taskCount = source.readBigNumber();
    const _baseRate = source.readBigNumber();
    return { $$type: 'SettlementStats' as const, totalSettled: _totalSettled, totalGSTDMinted: _totalGSTDMinted, taskCount: _taskCount, baseRate: _baseRate };
}

export function storeTupleSettlementStats(source: SettlementStats) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.totalSettled);
    builder.writeNumber(source.totalGSTDMinted);
    builder.writeNumber(source.taskCount);
    builder.writeNumber(source.baseRate);
    return builder.build();
}

export function dictValueParserSettlementStats(): DictionaryValue<SettlementStats> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSettlementStats(src)).endCell());
        },
        parse: (src) => {
            return loadSettlementStats(src.loadRef().beginParse());
        }
    }
}

export type RevenueSplit = {
    $$type: 'RevenueSplit';
    worker: bigint;
    treasury: bigint;
    protocol: bigint;
}

export function storeRevenueSplit(src: RevenueSplit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(src.worker, 8);
        b_0.storeUint(src.treasury, 8);
        b_0.storeUint(src.protocol, 8);
    };
}

export function loadRevenueSplit(slice: Slice) {
    const sc_0 = slice;
    const _worker = sc_0.loadUintBig(8);
    const _treasury = sc_0.loadUintBig(8);
    const _protocol = sc_0.loadUintBig(8);
    return { $$type: 'RevenueSplit' as const, worker: _worker, treasury: _treasury, protocol: _protocol };
}

export function loadTupleRevenueSplit(source: TupleReader) {
    const _worker = source.readBigNumber();
    const _treasury = source.readBigNumber();
    const _protocol = source.readBigNumber();
    return { $$type: 'RevenueSplit' as const, worker: _worker, treasury: _treasury, protocol: _protocol };
}

export function loadGetterTupleRevenueSplit(source: TupleReader) {
    const _worker = source.readBigNumber();
    const _treasury = source.readBigNumber();
    const _protocol = source.readBigNumber();
    return { $$type: 'RevenueSplit' as const, worker: _worker, treasury: _treasury, protocol: _protocol };
}

export function storeTupleRevenueSplit(source: RevenueSplit) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.worker);
    builder.writeNumber(source.treasury);
    builder.writeNumber(source.protocol);
    return builder.build();
}

export function dictValueParserRevenueSplit(): DictionaryValue<RevenueSplit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRevenueSplit(src)).endCell());
        },
        parse: (src) => {
            return loadRevenueSplit(src.loadRef().beginParse());
        }
    }
}

export type ContractAddresses = {
    $$type: 'ContractAddresses';
    gstdJetton: Address;
    treasury: Address;
    protocolFee: Address;
    owner: Address;
}

export function storeContractAddresses(src: ContractAddresses) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.gstdJetton);
        b_0.storeAddress(src.treasury);
        b_0.storeAddress(src.protocolFee);
        const b_1 = new Builder();
        b_1.storeAddress(src.owner);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadContractAddresses(slice: Slice) {
    const sc_0 = slice;
    const _gstdJetton = sc_0.loadAddress();
    const _treasury = sc_0.loadAddress();
    const _protocolFee = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _owner = sc_1.loadAddress();
    return { $$type: 'ContractAddresses' as const, gstdJetton: _gstdJetton, treasury: _treasury, protocolFee: _protocolFee, owner: _owner };
}

export function loadTupleContractAddresses(source: TupleReader) {
    const _gstdJetton = source.readAddress();
    const _treasury = source.readAddress();
    const _protocolFee = source.readAddress();
    const _owner = source.readAddress();
    return { $$type: 'ContractAddresses' as const, gstdJetton: _gstdJetton, treasury: _treasury, protocolFee: _protocolFee, owner: _owner };
}

export function loadGetterTupleContractAddresses(source: TupleReader) {
    const _gstdJetton = source.readAddress();
    const _treasury = source.readAddress();
    const _protocolFee = source.readAddress();
    const _owner = source.readAddress();
    return { $$type: 'ContractAddresses' as const, gstdJetton: _gstdJetton, treasury: _treasury, protocolFee: _protocolFee, owner: _owner };
}

export function storeTupleContractAddresses(source: ContractAddresses) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.gstdJetton);
    builder.writeAddress(source.treasury);
    builder.writeAddress(source.protocolFee);
    builder.writeAddress(source.owner);
    return builder.build();
}

export function dictValueParserContractAddresses(): DictionaryValue<ContractAddresses> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContractAddresses(src)).endCell());
        },
        parse: (src) => {
            return loadContractAddresses(src.loadRef().beginParse());
        }
    }
}

 type SettlementMaster_init_args = {
    $$type: 'SettlementMaster_init_args';
    owner: Address;
    gstdJetton: Address;
    treasury: Address;
    protocolFee: Address;
}

function initSettlementMaster_init_args(src: SettlementMaster_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.gstdJetton);
        b_0.storeAddress(src.treasury);
        const b_1 = new Builder();
        b_1.storeAddress(src.protocolFee);
        b_0.storeRef(b_1.endCell());
    };
}

async function SettlementMaster_init(owner: Address, gstdJetton: Address, treasury: Address, protocolFee: Address) {
    const __code = Cell.fromHex('b5ee9c724102230100083d000114ff00f4a413f4bcf2c80b0102016202150130d001d072d721d200d200fa4021103450666f04f86102f8620303f4ed44d0d200018e2bfa40fa40fa40d401d0fa40fa40d307d307d307fa00fa00fa00d33fd200d430d0fa003010be10bd10bc6c1e8e2ffa40fa40fa40d401d0fa403014433004d155022380557a7582080f4240705300107b107a1079107870821005f5e100e20fe3020dd70d1ff2e082218210a85e4bb4bae30221040708013c0d8020d7217021d749c21f9430d31f309131e2821059694c6ebae3025f0e0501f070804270882c553010246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010bd551ac87f01ca0055d050dece1bce19ce07c8ce16ce14cb0712cb07cb0701fa0201fa0258fa0212cb3f12ca00c85003fa0212cdcdc9ed5406003400000000626f756e6365645f776f726b65725f7061796d656e7400b2313b0afa40308200f7a7f8422dc705f2f410bd0c109b108a107910681057104610354403c87f01ca0055d050dece1bce19ce07c8ce16ce14cb0712cb07cb0701fa0201fa0258fa0212cb3f12ca00c85003fa0212cdcdc9ed5403f68210572e9ef8bae302218210beda40acbae302218210540bd399ba8e5c3138383805fa40fa40fa40308200f7a7f8422dc705f2f410bd10ac4a9b10681057104613154440c87f01ca0055d050dece1bce19ce07c8ce16ce14cb0712cb07cb0701fa0201fa0258fa0212cb3f12ca00c85003fa0212cdcdc9ed54e021090f1001f231d33ffa40fa00308200c4b1f8425610c705917f95f8422fc705e2f2f4820096d25610b3f2f4f8416f24135f03821005f5e100a1812124215613bef2f4530aa88064a904531aa88064a9045321a121a15093a05173a006a4727f547735c85520821059694c6e5004cb1f12cb3f01fa0201fa02c927040555200a03fa10246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb007270885610040b552010246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb007270882e55300b0c0d0016000000006465706f7369740016000000006275796261636b02a410246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0020c200925f03e30d10bd10ac109b108a10791068105710460350450e1300b2821004c4b400725a7005c855208210bb7a9ab85004cb1f12ce01fa02cb3fc92d504410246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0000e03135353502d307d307d307308200f7a7f8422dc705f2f48158c25da022a0c064f2f48200b36d23c231f2f410bd10ac109b108a1079481603455507c87f01ca0055d050dece1bce19ce07c8ce16ce14cb0712cb07cb0701fa0201fa0258fa0212cb3f12ca00c85003fa0212cdcdc9ed5403fe8210d70e7cefba8e61313403fa00308200f7a7f8422dc705f2f4816caa21c200f2f410bd10ac109b108a1079106810571046443512c87f01ca0055d050dece1bce19ce07c8ce16ce14cb0712cb07cb0701fa0201fa0258fa0212cb3f12ca00c85003fa0212cdcdc9ed54e02182103f7082c1bae302018210946a98b6bae30211121400b4313d0cd200308200f7a7f8422dc705f2f410bd10ac109b108a107910681057104610354403c87f01ca0055d050dece1bce19ce07c8ce16ce14cb0712cb07cb0701fa0201fa0258fa0212cb3f12ca00c85003fa0212cdcdc9ed540196d33f30c8018210aff90f5758cb1fcb3fc910ce10bd10ac109b108a10791068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb0013006ac87f01ca0055d050dece1bce19ce07c8ce16ce14cb0712cb07cb0701fa0201fa0258fa0212cb3f12ca00c85003fa0212cdcdc9ed54000a5f0ff2c082020120161e020120171901d7b9197ed44d0d200018e2bfa40fa40fa40d401d0fa40fa40d307d307d307fa00fa00fa00d33fd200d430d0fa003010be10bd10bc6c1e8e2ffa40fa40fa40d401d0fa403014433004d155022380557a7582080f4240705300107b107a1079107870821005f5e100e2db3c6ce48180008547432280201201a1c01d7b4a3bda89a1a400031c57f481f481f481a803a1f481f481a60fa60fa60ff401f401f401a67fa401a861a1f40060217c217a2178d83d1c5ff481f481f481a803a1f4806028866009a2aa044700aaf4eb04101e8480e0a60020f620f420f220f0e104200bebc201c5b678d9c301b00022d01d7b66f5da89a1a400031c57f481f481f481a803a1f481f481a60fa60fa60ff401f401f401a67fa401a861a1f40060217c217a2178d83d1c5ff481f481f481a803a1f4806028866009a2aa044700aaf4eb04101e8480e0a60020f620f420f220f0e104200bebc201c5b678d9c301d0002210201481f2101d7b5351da89a1a400031c57f481f481f481a803a1f481f481a60fa60fa60ff401f401f401a67fa401a861a1f40060217c217a2178d83d1c5ff481f481f481a803a1f4806028866009a2aa044700aaf4eb04101e8480e0a60020f620f420f220f0e104200bebc201c5b678d9c7020000654787601d7b5f37da89a1a400031c57f481f481f481a803a1f481f481a60fa60fa60ff401f401f401a67fa401a861a1f40060217c217a2178d83d1c5ff481f481f481a803a1f4806028866009a2aa044700aaf4eb04101e8480e0a60020f620f420f220f0e104200bebc201c5b678d9c9022000a547ba956109e7a016b');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initSettlementMaster_init_args({ $$type: 'SettlementMaster_init_args', owner, gstdJetton, treasury, protocolFee })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const SettlementMaster_errors = {
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
    8484: { message: "Payment below minimum" },
    22722: { message: "Must sum to 100" },
    27818: { message: "Rate must be positive" },
    38610: { message: "Settlement paused" },
    45933: { message: "Worker share minimum 50%" },
    50353: { message: "Only DAO or Gateway can settle" },
    63399: { message: "Only DAO" },
} as const

export const SettlementMaster_errors_backward = {
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
    "Payment below minimum": 8484,
    "Must sum to 100": 22722,
    "Rate must be positive": 27818,
    "Settlement paused": 38610,
    "Worker share minimum 50%": 45933,
    "Only DAO or Gateway can settle": 50353,
    "Only DAO": 63399,
} as const

const SettlementMaster_types: ABIType[] = [
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
    {"name":"SettleTask","header":1462673144,"fields":[{"name":"taskId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"workerAddr","type":{"kind":"simple","type":"address","optional":false}},{"name":"gstdBonusAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"qualityScore","type":{"kind":"simple","type":"uint","optional":false,"format":32}},{"name":"computeUnits","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"WorkerPayment","header":1500073070,"fields":[{"name":"taskId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"bonusGSTD","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"UpdateShares","header":3201974444,"fields":[{"name":"worker","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"treasury","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"protocol","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"UpdateAddresses","header":1410061209,"fields":[{"name":"treasury","type":{"kind":"simple","type":"address","optional":false}},{"name":"protocolFee","type":{"kind":"simple","type":"address","optional":false}},{"name":"gstdJetton","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"MintWorkerReward","header":3145374392,"fields":[{"name":"workerAddr","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"taskId","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"SetBaseRate","header":3608050927,"fields":[{"name":"rate","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"EmergencyPause","header":1064338113,"fields":[{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"SetGateway","header":2824752052,"fields":[{"name":"gateway","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SettlementMaster$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"gateway","type":{"kind":"simple","type":"address","optional":false}},{"name":"gstdJetton","type":{"kind":"simple","type":"address","optional":false}},{"name":"treasury","type":{"kind":"simple","type":"address","optional":false}},{"name":"protocolFee","type":{"kind":"simple","type":"address","optional":false}},{"name":"workerShare","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"treasuryShare","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"protocolShare","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"baseRate","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalSettled","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalGSTDMinted","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"taskCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"minPayment","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"SettlementStats","header":null,"fields":[{"name":"totalSettled","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalGSTDMinted","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"taskCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"baseRate","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"RevenueSplit","header":null,"fields":[{"name":"worker","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"treasury","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"protocol","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"ContractAddresses","header":null,"fields":[{"name":"gstdJetton","type":{"kind":"simple","type":"address","optional":false}},{"name":"treasury","type":{"kind":"simple","type":"address","optional":false}},{"name":"protocolFee","type":{"kind":"simple","type":"address","optional":false}},{"name":"owner","type":{"kind":"simple","type":"address","optional":false}}]},
]

const SettlementMaster_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "SettleTask": 1462673144,
    "WorkerPayment": 1500073070,
    "UpdateShares": 3201974444,
    "UpdateAddresses": 1410061209,
    "MintWorkerReward": 3145374392,
    "SetBaseRate": 3608050927,
    "EmergencyPause": 1064338113,
    "SetGateway": 2824752052,
}

const SettlementMaster_getters: ABIGetter[] = [
    {"name":"get_settlement_stats","methodId":70039,"arguments":[],"returnType":{"kind":"simple","type":"SettlementStats","optional":false}},
    {"name":"get_revenue_split","methodId":100776,"arguments":[],"returnType":{"kind":"simple","type":"RevenueSplit","optional":false}},
    {"name":"get_addresses","methodId":110491,"arguments":[],"returnType":{"kind":"simple","type":"ContractAddresses","optional":false}},
    {"name":"is_paused","methodId":95098,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const SettlementMaster_getterMapping: { [key: string]: string } = {
    'get_settlement_stats': 'getGetSettlementStats',
    'get_revenue_split': 'getGetRevenueSplit',
    'get_addresses': 'getGetAddresses',
    'is_paused': 'getIsPaused',
    'owner': 'getOwner',
}

const SettlementMaster_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"SetGateway"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SettleTask"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateShares"}},
    {"receiver":"internal","message":{"kind":"typed","type":"UpdateAddresses"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetBaseRate"}},
    {"receiver":"internal","message":{"kind":"typed","type":"EmergencyPause"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]


export class SettlementMaster implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = SettlementMaster_errors_backward;
    public static readonly opcodes = SettlementMaster_opcodes;
    
    static async init(owner: Address, gstdJetton: Address, treasury: Address, protocolFee: Address) {
        return await SettlementMaster_init(owner, gstdJetton, treasury, protocolFee);
    }
    
    static async fromInit(owner: Address, gstdJetton: Address, treasury: Address, protocolFee: Address) {
        const __gen_init = await SettlementMaster_init(owner, gstdJetton, treasury, protocolFee);
        const address = contractAddress(0, __gen_init);
        return new SettlementMaster(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new SettlementMaster(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  SettlementMaster_types,
        getters: SettlementMaster_getters,
        receivers: SettlementMaster_receivers,
        errors: SettlementMaster_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: SetGateway | SettleTask | UpdateShares | UpdateAddresses | SetBaseRate | EmergencyPause | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetGateway') {
            body = beginCell().store(storeSetGateway(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SettleTask') {
            body = beginCell().store(storeSettleTask(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateShares') {
            body = beginCell().store(storeUpdateShares(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'UpdateAddresses') {
            body = beginCell().store(storeUpdateAddresses(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetBaseRate') {
            body = beginCell().store(storeSetBaseRate(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'EmergencyPause') {
            body = beginCell().store(storeEmergencyPause(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetSettlementStats(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_settlement_stats', builder.build())).stack;
        const result = loadGetterTupleSettlementStats(source);
        return result;
    }
    
    async getGetRevenueSplit(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_revenue_split', builder.build())).stack;
        const result = loadGetterTupleRevenueSplit(source);
        return result;
    }
    
    async getGetAddresses(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_addresses', builder.build())).stack;
        const result = loadGetterTupleContractAddresses(source);
        return result;
    }
    
    async getIsPaused(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('is_paused', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}