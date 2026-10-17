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

export type SetOwnJettonWallet = {
    $$type: 'SetOwnJettonWallet';
    wallet: Address;
}

export function storeSetOwnJettonWallet(src: SetOwnJettonWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3570918315, 32);
        b_0.storeAddress(src.wallet);
    };
}

export function loadSetOwnJettonWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3570918315) { throw Error('Invalid prefix'); }
    const _wallet = sc_0.loadAddress();
    return { $$type: 'SetOwnJettonWallet' as const, wallet: _wallet };
}

export function loadTupleSetOwnJettonWallet(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'SetOwnJettonWallet' as const, wallet: _wallet };
}

export function loadGetterTupleSetOwnJettonWallet(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'SetOwnJettonWallet' as const, wallet: _wallet };
}

export function storeTupleSetOwnJettonWallet(source: SetOwnJettonWallet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserSetOwnJettonWallet(): DictionaryValue<SetOwnJettonWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetOwnJettonWallet(src)).endCell());
        },
        parse: (src) => {
            return loadSetOwnJettonWallet(src.loadRef().beginParse());
        }
    }
}

export type SetClaimVerifier = {
    $$type: 'SetClaimVerifier';
    pubkey: bigint;
}

export function storeSetClaimVerifier(src: SetClaimVerifier) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3248553985, 32);
        b_0.storeUint(src.pubkey, 256);
    };
}

export function loadSetClaimVerifier(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3248553985) { throw Error('Invalid prefix'); }
    const _pubkey = sc_0.loadUintBig(256);
    return { $$type: 'SetClaimVerifier' as const, pubkey: _pubkey };
}

export function loadTupleSetClaimVerifier(source: TupleReader) {
    const _pubkey = source.readBigNumber();
    return { $$type: 'SetClaimVerifier' as const, pubkey: _pubkey };
}

export function loadGetterTupleSetClaimVerifier(source: TupleReader) {
    const _pubkey = source.readBigNumber();
    return { $$type: 'SetClaimVerifier' as const, pubkey: _pubkey };
}

export function storeTupleSetClaimVerifier(source: SetClaimVerifier) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.pubkey);
    return builder.build();
}

export function dictValueParserSetClaimVerifier(): DictionaryValue<SetClaimVerifier> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetClaimVerifier(src)).endCell());
        },
        parse: (src) => {
            return loadSetClaimVerifier(src.loadRef().beginParse());
        }
    }
}

export type ClaimUptime = {
    $$type: 'ClaimUptime';
    wallet: Address;
    amount: bigint;
    nonce: bigint;
    expiry: bigint;
    sigCell: Cell;
}

export function storeClaimUptime(src: ClaimUptime) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3248553986, 32);
        b_0.storeAddress(src.wallet);
        b_0.storeCoins(src.amount);
        b_0.storeUint(src.nonce, 64);
        b_0.storeUint(src.expiry, 64);
        b_0.storeRef(src.sigCell);
    };
}

export function loadClaimUptime(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3248553986) { throw Error('Invalid prefix'); }
    const _wallet = sc_0.loadAddress();
    const _amount = sc_0.loadCoins();
    const _nonce = sc_0.loadUintBig(64);
    const _expiry = sc_0.loadUintBig(64);
    const _sigCell = sc_0.loadRef();
    return { $$type: 'ClaimUptime' as const, wallet: _wallet, amount: _amount, nonce: _nonce, expiry: _expiry, sigCell: _sigCell };
}

export function loadTupleClaimUptime(source: TupleReader) {
    const _wallet = source.readAddress();
    const _amount = source.readBigNumber();
    const _nonce = source.readBigNumber();
    const _expiry = source.readBigNumber();
    const _sigCell = source.readCell();
    return { $$type: 'ClaimUptime' as const, wallet: _wallet, amount: _amount, nonce: _nonce, expiry: _expiry, sigCell: _sigCell };
}

export function loadGetterTupleClaimUptime(source: TupleReader) {
    const _wallet = source.readAddress();
    const _amount = source.readBigNumber();
    const _nonce = source.readBigNumber();
    const _expiry = source.readBigNumber();
    const _sigCell = source.readCell();
    return { $$type: 'ClaimUptime' as const, wallet: _wallet, amount: _amount, nonce: _nonce, expiry: _expiry, sigCell: _sigCell };
}

export function storeTupleClaimUptime(source: ClaimUptime) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    builder.writeNumber(source.amount);
    builder.writeNumber(source.nonce);
    builder.writeNumber(source.expiry);
    builder.writeCell(source.sigCell);
    return builder.build();
}

export function dictValueParserClaimUptime(): DictionaryValue<ClaimUptime> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeClaimUptime(src)).endCell());
        },
        parse: (src) => {
            return loadClaimUptime(src.loadRef().beginParse());
        }
    }
}

export type RegisterAttestorKey = {
    $$type: 'RegisterAttestorKey';
    pubkey: bigint;
    authorized: boolean;
}

export function storeRegisterAttestorKey(src: RegisterAttestorKey) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2339755838, 32);
        b_0.storeUint(src.pubkey, 256);
        b_0.storeBit(src.authorized);
    };
}

export function loadRegisterAttestorKey(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2339755838) { throw Error('Invalid prefix'); }
    const _pubkey = sc_0.loadUintBig(256);
    const _authorized = sc_0.loadBit();
    return { $$type: 'RegisterAttestorKey' as const, pubkey: _pubkey, authorized: _authorized };
}

export function loadTupleRegisterAttestorKey(source: TupleReader) {
    const _pubkey = source.readBigNumber();
    const _authorized = source.readBoolean();
    return { $$type: 'RegisterAttestorKey' as const, pubkey: _pubkey, authorized: _authorized };
}

export function loadGetterTupleRegisterAttestorKey(source: TupleReader) {
    const _pubkey = source.readBigNumber();
    const _authorized = source.readBoolean();
    return { $$type: 'RegisterAttestorKey' as const, pubkey: _pubkey, authorized: _authorized };
}

export function storeTupleRegisterAttestorKey(source: RegisterAttestorKey) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.pubkey);
    builder.writeBoolean(source.authorized);
    return builder.build();
}

export function dictValueParserRegisterAttestorKey(): DictionaryValue<RegisterAttestorKey> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRegisterAttestorKey(src)).endCell());
        },
        parse: (src) => {
            return loadRegisterAttestorKey(src.loadRef().beginParse());
        }
    }
}

export type SetQuorumThreshold = {
    $$type: 'SetQuorumThreshold';
    threshold: bigint;
}

export function storeSetQuorumThreshold(src: SetQuorumThreshold) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2068563096, 32);
        b_0.storeUint(src.threshold, 8);
    };
}

export function loadSetQuorumThreshold(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2068563096) { throw Error('Invalid prefix'); }
    const _threshold = sc_0.loadUintBig(8);
    return { $$type: 'SetQuorumThreshold' as const, threshold: _threshold };
}

export function loadTupleSetQuorumThreshold(source: TupleReader) {
    const _threshold = source.readBigNumber();
    return { $$type: 'SetQuorumThreshold' as const, threshold: _threshold };
}

export function loadGetterTupleSetQuorumThreshold(source: TupleReader) {
    const _threshold = source.readBigNumber();
    return { $$type: 'SetQuorumThreshold' as const, threshold: _threshold };
}

export function storeTupleSetQuorumThreshold(source: SetQuorumThreshold) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.threshold);
    return builder.build();
}

export function dictValueParserSetQuorumThreshold(): DictionaryValue<SetQuorumThreshold> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetQuorumThreshold(src)).endCell());
        },
        parse: (src) => {
            return loadSetQuorumThreshold(src.loadRef().beginParse());
        }
    }
}

export type SettleTaskWithProof = {
    $$type: 'SettleTaskWithProof';
    taskId: bigint;
    workerAddr: Address;
    resultHash: bigint;
    attestationCount: bigint;
    attestations: Cell;
    gstdBonusAmount: bigint;
    computeUnits: bigint;
}

export function storeSettleTaskWithProof(src: SettleTaskWithProof) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2168072470, 32);
        b_0.storeUint(src.taskId, 64);
        b_0.storeAddress(src.workerAddr);
        b_0.storeUint(src.resultHash, 256);
        b_0.storeUint(src.attestationCount, 8);
        b_0.storeRef(src.attestations);
        b_0.storeCoins(src.gstdBonusAmount);
        b_0.storeUint(src.computeUnits, 64);
    };
}

export function loadSettleTaskWithProof(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2168072470) { throw Error('Invalid prefix'); }
    const _taskId = sc_0.loadUintBig(64);
    const _workerAddr = sc_0.loadAddress();
    const _resultHash = sc_0.loadUintBig(256);
    const _attestationCount = sc_0.loadUintBig(8);
    const _attestations = sc_0.loadRef();
    const _gstdBonusAmount = sc_0.loadCoins();
    const _computeUnits = sc_0.loadUintBig(64);
    return { $$type: 'SettleTaskWithProof' as const, taskId: _taskId, workerAddr: _workerAddr, resultHash: _resultHash, attestationCount: _attestationCount, attestations: _attestations, gstdBonusAmount: _gstdBonusAmount, computeUnits: _computeUnits };
}

export function loadTupleSettleTaskWithProof(source: TupleReader) {
    const _taskId = source.readBigNumber();
    const _workerAddr = source.readAddress();
    const _resultHash = source.readBigNumber();
    const _attestationCount = source.readBigNumber();
    const _attestations = source.readCell();
    const _gstdBonusAmount = source.readBigNumber();
    const _computeUnits = source.readBigNumber();
    return { $$type: 'SettleTaskWithProof' as const, taskId: _taskId, workerAddr: _workerAddr, resultHash: _resultHash, attestationCount: _attestationCount, attestations: _attestations, gstdBonusAmount: _gstdBonusAmount, computeUnits: _computeUnits };
}

export function loadGetterTupleSettleTaskWithProof(source: TupleReader) {
    const _taskId = source.readBigNumber();
    const _workerAddr = source.readAddress();
    const _resultHash = source.readBigNumber();
    const _attestationCount = source.readBigNumber();
    const _attestations = source.readCell();
    const _gstdBonusAmount = source.readBigNumber();
    const _computeUnits = source.readBigNumber();
    return { $$type: 'SettleTaskWithProof' as const, taskId: _taskId, workerAddr: _workerAddr, resultHash: _resultHash, attestationCount: _attestationCount, attestations: _attestations, gstdBonusAmount: _gstdBonusAmount, computeUnits: _computeUnits };
}

export function storeTupleSettleTaskWithProof(source: SettleTaskWithProof) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.taskId);
    builder.writeAddress(source.workerAddr);
    builder.writeNumber(source.resultHash);
    builder.writeNumber(source.attestationCount);
    builder.writeCell(source.attestations);
    builder.writeNumber(source.gstdBonusAmount);
    builder.writeNumber(source.computeUnits);
    return builder.build();
}

export function dictValueParserSettleTaskWithProof(): DictionaryValue<SettleTaskWithProof> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSettleTaskWithProof(src)).endCell());
        },
        parse: (src) => {
            return loadSettleTaskWithProof(src.loadRef().beginParse());
        }
    }
}

export type SettleBatch = {
    $$type: 'SettleBatch';
    workerAddr: Address;
    entryCount: bigint;
    entries: Cell;
    totalGstdBonusAmount: bigint;
}

export function storeSettleBatch(src: SettleBatch) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(745424004, 32);
        b_0.storeAddress(src.workerAddr);
        b_0.storeUint(src.entryCount, 8);
        b_0.storeRef(src.entries);
        b_0.storeCoins(src.totalGstdBonusAmount);
    };
}

export function loadSettleBatch(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 745424004) { throw Error('Invalid prefix'); }
    const _workerAddr = sc_0.loadAddress();
    const _entryCount = sc_0.loadUintBig(8);
    const _entries = sc_0.loadRef();
    const _totalGstdBonusAmount = sc_0.loadCoins();
    return { $$type: 'SettleBatch' as const, workerAddr: _workerAddr, entryCount: _entryCount, entries: _entries, totalGstdBonusAmount: _totalGstdBonusAmount };
}

export function loadTupleSettleBatch(source: TupleReader) {
    const _workerAddr = source.readAddress();
    const _entryCount = source.readBigNumber();
    const _entries = source.readCell();
    const _totalGstdBonusAmount = source.readBigNumber();
    return { $$type: 'SettleBatch' as const, workerAddr: _workerAddr, entryCount: _entryCount, entries: _entries, totalGstdBonusAmount: _totalGstdBonusAmount };
}

export function loadGetterTupleSettleBatch(source: TupleReader) {
    const _workerAddr = source.readAddress();
    const _entryCount = source.readBigNumber();
    const _entries = source.readCell();
    const _totalGstdBonusAmount = source.readBigNumber();
    return { $$type: 'SettleBatch' as const, workerAddr: _workerAddr, entryCount: _entryCount, entries: _entries, totalGstdBonusAmount: _totalGstdBonusAmount };
}

export function storeTupleSettleBatch(source: SettleBatch) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.workerAddr);
    builder.writeNumber(source.entryCount);
    builder.writeCell(source.entries);
    builder.writeNumber(source.totalGstdBonusAmount);
    return builder.build();
}

export function dictValueParserSettleBatch(): DictionaryValue<SettleBatch> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSettleBatch(src)).endCell());
        },
        parse: (src) => {
            return loadSettleBatch(src.loadRef().beginParse());
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
    ownJettonWallet: Address;
    settledTasks: Dictionary<bigint, boolean>;
    paused: boolean;
    minPayment: bigint;
    attestorKeys: Dictionary<bigint, boolean>;
    quorumThreshold: bigint;
    claimVerifierPubkey: bigint;
    usedClaimNonces: Dictionary<bigint, boolean>;
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
        const b_2 = new Builder();
        b_2.storeAddress(src.ownJettonWallet);
        b_2.storeDict(src.settledTasks, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_2.storeBit(src.paused);
        b_2.storeCoins(src.minPayment);
        b_2.storeDict(src.attestorKeys, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
        b_2.storeUint(src.quorumThreshold, 8);
        b_2.storeUint(src.claimVerifierPubkey, 256);
        b_2.storeDict(src.usedClaimNonces, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool());
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
    const sc_2 = sc_1.loadRef().beginParse();
    const _ownJettonWallet = sc_2.loadAddress();
    const _settledTasks = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_2);
    const _paused = sc_2.loadBit();
    const _minPayment = sc_2.loadCoins();
    const _attestorKeys = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_2);
    const _quorumThreshold = sc_2.loadUintBig(8);
    const _claimVerifierPubkey = sc_2.loadUintBig(256);
    const _usedClaimNonces = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), sc_2);
    return { $$type: 'SettlementMaster$Data' as const, owner: _owner, gateway: _gateway, gstdJetton: _gstdJetton, treasury: _treasury, protocolFee: _protocolFee, workerShare: _workerShare, treasuryShare: _treasuryShare, protocolShare: _protocolShare, baseRate: _baseRate, totalSettled: _totalSettled, totalGSTDMinted: _totalGSTDMinted, taskCount: _taskCount, ownJettonWallet: _ownJettonWallet, settledTasks: _settledTasks, paused: _paused, minPayment: _minPayment, attestorKeys: _attestorKeys, quorumThreshold: _quorumThreshold, claimVerifierPubkey: _claimVerifierPubkey, usedClaimNonces: _usedClaimNonces };
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
    const _ownJettonWallet = source.readAddress();
    const _settledTasks = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    source = source.readTuple();
    const _paused = source.readBoolean();
    const _minPayment = source.readBigNumber();
    const _attestorKeys = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _quorumThreshold = source.readBigNumber();
    const _claimVerifierPubkey = source.readBigNumber();
    const _usedClaimNonces = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'SettlementMaster$Data' as const, owner: _owner, gateway: _gateway, gstdJetton: _gstdJetton, treasury: _treasury, protocolFee: _protocolFee, workerShare: _workerShare, treasuryShare: _treasuryShare, protocolShare: _protocolShare, baseRate: _baseRate, totalSettled: _totalSettled, totalGSTDMinted: _totalGSTDMinted, taskCount: _taskCount, ownJettonWallet: _ownJettonWallet, settledTasks: _settledTasks, paused: _paused, minPayment: _minPayment, attestorKeys: _attestorKeys, quorumThreshold: _quorumThreshold, claimVerifierPubkey: _claimVerifierPubkey, usedClaimNonces: _usedClaimNonces };
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
    const _ownJettonWallet = source.readAddress();
    const _settledTasks = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _paused = source.readBoolean();
    const _minPayment = source.readBigNumber();
    const _attestorKeys = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    const _quorumThreshold = source.readBigNumber();
    const _claimVerifierPubkey = source.readBigNumber();
    const _usedClaimNonces = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Bool(), source.readCellOpt());
    return { $$type: 'SettlementMaster$Data' as const, owner: _owner, gateway: _gateway, gstdJetton: _gstdJetton, treasury: _treasury, protocolFee: _protocolFee, workerShare: _workerShare, treasuryShare: _treasuryShare, protocolShare: _protocolShare, baseRate: _baseRate, totalSettled: _totalSettled, totalGSTDMinted: _totalGSTDMinted, taskCount: _taskCount, ownJettonWallet: _ownJettonWallet, settledTasks: _settledTasks, paused: _paused, minPayment: _minPayment, attestorKeys: _attestorKeys, quorumThreshold: _quorumThreshold, claimVerifierPubkey: _claimVerifierPubkey, usedClaimNonces: _usedClaimNonces };
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
    builder.writeAddress(source.ownJettonWallet);
    builder.writeCell(source.settledTasks.size > 0 ? beginCell().storeDictDirect(source.settledTasks, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeBoolean(source.paused);
    builder.writeNumber(source.minPayment);
    builder.writeCell(source.attestorKeys.size > 0 ? beginCell().storeDictDirect(source.attestorKeys, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
    builder.writeNumber(source.quorumThreshold);
    builder.writeNumber(source.claimVerifierPubkey);
    builder.writeCell(source.usedClaimNonces.size > 0 ? beginCell().storeDictDirect(source.usedClaimNonces, Dictionary.Keys.BigInt(257), Dictionary.Values.Bool()).endCell() : null);
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
    const __code = Cell.fromHex('b5ee9c7241024601001352000114ff00f4a413f4bcf2c80b01020162022c0130d001d072d721d200d200fa4021103450666f04f86102f8620304f8ed44d0d200018e5bfa40fa40fa40d401d0fa40fa40d307d307d307fa00fa00fa00d33fd430d0fa40f404d200fa00f404d307d3fff4043011111114111111111113111111111112111157141112111311121111111211111110111111100f11100f550ee30e1115e3021113d70d1ff2e082218210a85e4bb4bae302214304060702f411138020d7217021d749c21f9430d31f309131e2821059694c6eba8f5870804270885612553010246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb001111111311111110111211100f11110f0e11100e10df551ce05f0f5f05052b003400000000626f756e6365645f776f726b65725f7061796d656e7401783157111110fa40308200f7a7f8425613c705f2f411111113111111120f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046103544032b044a8210572e9ef8bae302218210813a2916bae3022182102c6e4484bae3022182108b75d73eba080b0e1e01f831d33ffa40fa00d31f31d33f308200c4b1f8425617c705917f96f8425616c705e2f2f4820096d228b3f2f4817e248d08600000000000000000000000000000000000000000000000000000000000000000045240c705b3f2f48200d4132981010126714133f40c6fa19401d70030925b6de26ef2f408810101247f710901fc216e955b59f45a3098c801cf004133f442e2813f76f8416f24135f03821005f5e100bcf2f4f8416f24135f03821005f5e100a18121245318bef2f41116111811161115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac1b108a1079106810570a01b6400605db3cc87f01ca001114111311121111111055e0011113011114ce01111101ce1fce0dc8ce1cce1acb0718cb0716cb075004fa0258fa0201fa02cb3f01c8ce12f40012ca0058fa0213f40013cb0713cbff13f400cdcdc9ed541801fe31d33ffa40d3ffd307d4fa00d33f30820096d22bb3f2f4817e248d08600000000000000000000000000000000000000000000000000000000000000000045270c705b3f2f48200d4132c81010129714133f40c6fa19401d70030925b6de26ef2f41115111811151114111711141113111611131112111811121111111711110c02fe1110111611100f11180f0e11170e0d11160d0c11180c0b11170b0a11160a0911180908111708071116070611180605111705041116040311190302111a028200c075561903561903021119025c01111e01111fdb3c01111501f2f40581010156167f71216e955b59f45a3098c801cf004133f442e2813f76f8416f24135f03120d02c0821005f5e100bcf2f4f8416f24135f03821005f5e100a18121245315bef2f41113111811131112111711121111111611111110111511100f11140f0e11130e0d11120d0c11110c0b11100b10af109e108d107c1b105a1049103840175034db3c182b03fe31fa40d307d4fa0030820096d228b3f2f4817e248d08600000000000000000000000000000000000000000000000000000000000000000045250c705b3f2f48114b423c200f2f48150e523c106f2f4813f76f8416f24135f03821005f5e100bcf2f4f8416f24135f03821005f5e100a18121245318bef2f47053008a8ae8320f101700065326b901fc25d0d33fd3ffd307d33ffa00d48200d413561481010129714133f40c6fa19401d70030925b6de26ef2f41115112011151114111f11141113111e11131112111d11121111111c11111110111b11100f111a0f0e11190e0d11180d0c11170c0b11160b0a11200a09111f0908111e0807111d0706111c0605111b0504111a041102fe03112103021122028145af561d03561b0302111e02562502562502111f01db3c01111a01f2f41581010101111a7f71216e955b59f45a3098c801cf004133f442e201111a01111da001111801111da05614d74ac2009a57111113d43011101113925714e21118a41114111b11141115111a11150e11190e0d11180d0c11170c1216016a5319b9935f0770e021c205935f0770e0c817cb3f5005cf1613cbff01fa02cb3fc9f9007f547000207020935308b98ae8195f0923be1302fe29d0d3ff8308d7185329ba917f935328bae2917f935327bae2917f935326bae2917f935325bae224933a220adf24c00193392209de24c00293382208de24c00393372207de24c00493362206deb38e1f561081010124714133f40c6fa19401d70030925b6de27f216e925b7091bae29170e295544a03f910936c2170e2e3001415000602a402001e20d74ac200953a09d430099130e2a400540b11160b0a11150a0911140908111308071112070611110605111005104f103e102d10ac401b0a50990802a834348200ea665124ba12f2f41115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810571046104570044133db3c182b01f6225614a88064a904235614a88064a9045341a121a12382103b9aca00bc9782103b9aca0034de56135004a85340bc91349130e20111110104a051f2a00ea4727f27561326c85520821059694c6e5004cb1f12cb3f01fa0201fa02c927041114552010246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c1903fe6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0072708856180406552010246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0072708856160405552010246d50436d03c8cf8580ca00cf8440ce01fa028069cf40021a1b1c0016000000006465706f7369740016000000006275796261636b01b05c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0020c2008e298d086000000000000000000000000000000000000000000000000000000000000000000452b0c705b39170e2925f03e30d109a10891d00d8821007270e0072707070c882100f8a7ea501cb1f18cb3f5005fa0225cf165005cf1615ca008208989680fa0212ca00c92b4414503310246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0004ec8ed731d3ffd200308200f7a7f8425615c705f2f410238101015971216e955b59f45a3098c801cf004133f442e21111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354143e02182107b4bc498bae302218210d4d7e3abbae302218210c1a10001ba2b1f202101646c21d307308200f7a7f8425613c705f2f482009ea821c200f2f41111111311111110111211100f11110f0e11100e10df551c2b017c313605fa40308200f7a7f8425613c705f2f41111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106807104610354430122b04be8ec03157131112d3ff308200e240f8425613c705f2f41111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057104610354403e0218210c1a10002bae302218210beda40acbae302218210540bd399ba2b22262701fe31fa40fa00d33fd33fd430811c2c5618c300f2f48200e84129b3f2f4820086b0f84226c705f2f4813360f8235230bcf2f48142c3561981010125714133f40c6fa19401d70030925b6de26ef2f48200e413f8416f24135f03821008f0d180bef2f4811c1524c200f2f4c825cf16c9d0800bd721d3ff30c8cbff5240cb3f52302302fccb3f12cb3fc9d0f90101d0018200bd11025618f910f2f4111681010156177f71216e955b59f45a3098c801cf004133f442e251a1a08d08600000000000000000000000000000000000000000000000000000000000000000045290c705b39357165be30d1111111311111110111211100f11110f0e11100e10df10ce10bd242500e8821007270e0072707070c882100f8a7ea501cb1f01111c01cb3f5006fa0226cf165006cf1601111901ca008208989680fa0213ca00c92904021118020110246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0000bc10ac109b108a5516c87f01ca001114111311121111111055e0011113011114ce01111101ce1fce0dc8ce1cce1acb0718cb0716cb075004fa0258fa0201fa02cb3f01c8ce12f40012ca0058fa0213f40013cb0713cbff13f400cdcdc9ed5401a6313b3b3b08d307d307d307308200f7a7f8425613c705f2f48158c25da022a0c064f2f48200b36d23c231f2f41111111311111110111211100f11110f0e11100e10df4edc109b108a10791068105710460345552b04c08ec1313e3e3e0bfa40fa40fa40308200f7a7f8425613c705f2f41111111311111110111211101111021110021f10ce10bd10ac109b108a107910681057104613154440e0218210d70e7cefbae3022182103f7082c1bae302018210946a98b6ba2b28292a018c313a09fa00308200f7a7f8425613c705f2f4816caa21c200f2f41111111311111110111211100f11110f0e11100e10df10ce10bd10ac0b108a107910681057104610354430122b017a313403d200308200f7a7f8425613c705f2f41111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710464435122b01e28ee7d33f30c8018210aff90f5758cb1fcb3fc91112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00e05f0f5f06f2c0822b00acc87f01ca001114111311121111111055e0011113011114ce01111101ce1fce0dc8ce1cce1acb0718cb0716cb075004fa0258fa0201fa02cb3f01c8ce12f40012ca0058fa0213f40013cb0713cbff13f400cdcdc9ed540201202d3c0201202e340201662f3102dbaccbf6a268690000c72dfd207d207d206a00e87d207d206983e983e983fd007d007d00699fea18687d207a0269007d007a026983e9fffa02180888888a0888888888898888888888890888ab8a08890889888908888889088888880888888807888807aa8771876d9e366236424043300008547a982e02f3ada5f6a268690000c72dfd207d207d206a00e87d207d206983e983e983fd007d007d00699fea18687d207a0269007d007a026983e9fffa02180888888a0888888888898888888888890888ab8a08890889888908888889088888880888888807888807aa8771870889888a0889888908898889088888890888c0433201281110111111100f11100f550edb3c57105f0f6c4133002e8101012802714133f40c6fa19401d70030925b6de26eb3020120353a020120363802dfb1477b51343480006396fe903e903e903500743e903e9034c1f4c1f4c1fe803e803e8034cff50c343e903d0134803e803d0134c1f4fffd010c04444445044444444444c44444444444844455c504448444c44484444444844444440444444403c44403d543b8c3b6cf15c417c3db106043370004561302dfb245fb51343480006396fe903e903e903500743e903e9034c1f4c1f4c1fe803e803e8034cff50c343e903d0134803e803d0134c1f4fffd010c04444445044444444444c44444444444844455c504448444c44484444444844444440444444403c44403d543b8c3b6cf15c417c3db1060433900022202dfb66f5da89a1a400031cb7f481f481f481a803a1f481f481a60fa60fa60ff401f401f401a67fa861a1f481e809a401f401e809a60fa7ffe80860222222282222222222262222222222242222ae282224222622242222222422222220222222201e22201eaa1dc61db678ae20be1ed8830433b0002250201203d420201203e4002dbb5351da89a1a400031cb7f481f481f481a803a1f481f481a60fa60fa60ff401f401f401a67fa861a1f481e809a401f401e809a60fa7ffe80860222222282222222222262222222222242222ae282224222622242222222422222220222222201e22201eaa1dc61db678d9e6d8a70433f0006547edc02dbb5f37da89a1a400031cb7f481f481f481a803a1f481f481a60fa60fa60ff401f401f401a67fa861a1f481e809a401f401e809a60fa7ffe80860222222282222222222262222222222242222ae282224222622242222222422222220222222201e22201eaa1dc61db678d988d909043410010561156115611561602f3ba142ed44d0d200018e5bfa40fa40fa40d401d0fa40fa40d307d307d307fa00fa00fa00d33fd430d0fa40f404d200fa00f404d307d3fff4043011111114111111111113111111111112111157141112111311121111111211111110111111100f11100f550ee30e1113111411131112111311121111111211118434400ecfa40fa40fa40d401d0fa403014433004d155026d6d6d2680557a7582080f424070530070820afaf0808d086000000000000000000000000000000000000000000000000000000000000000000472240c11130c0c11120c0c11110c0c11100c10cf10be10ad109c108b107a106910581027104510345801281110111111100f11100f550edb3c57105f0f6c4145003c8101012502714133f40c6fa19401d70030925b6de27f216e925b7091bae2a907759b');
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
    5300: { message: "Empty batch" },
    7189: { message: "Zero amount" },
    7212: { message: "Claims disabled" },
    8484: { message: "Payment below minimum" },
    13152: { message: "Voucher expired" },
    16246: { message: "Insufficient value for gas reserve" },
    17091: { message: "Nonce already used" },
    17839: { message: "Insufficient attested quorum for batch entry" },
    20709: { message: "Batch too large" },
    22722: { message: "Must sum to 100" },
    27818: { message: "Rate must be positive" },
    32292: { message: "Worker address cannot be zero" },
    34480: { message: "Wallet mismatch — send from wallet in voucher" },
    38610: { message: "Settlement paused" },
    40616: { message: "Threshold must be at least 1" },
    45933: { message: "Worker share minimum 50%" },
    48401: { message: "Invalid signature" },
    49269: { message: "Insufficient attested quorum" },
    50353: { message: "Only DAO or Gateway can settle" },
    54291: { message: "Task already settled" },
    57920: { message: "Owner only" },
    58387: { message: "Attach 0.15 TON" },
    59457: { message: "Paused" },
    60006: { message: "Batch bonus mismatch" },
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
    "Empty batch": 5300,
    "Zero amount": 7189,
    "Claims disabled": 7212,
    "Payment below minimum": 8484,
    "Voucher expired": 13152,
    "Insufficient value for gas reserve": 16246,
    "Nonce already used": 17091,
    "Insufficient attested quorum for batch entry": 17839,
    "Batch too large": 20709,
    "Must sum to 100": 22722,
    "Rate must be positive": 27818,
    "Worker address cannot be zero": 32292,
    "Wallet mismatch — send from wallet in voucher": 34480,
    "Settlement paused": 38610,
    "Threshold must be at least 1": 40616,
    "Worker share minimum 50%": 45933,
    "Invalid signature": 48401,
    "Insufficient attested quorum": 49269,
    "Only DAO or Gateway can settle": 50353,
    "Task already settled": 54291,
    "Owner only": 57920,
    "Attach 0.15 TON": 58387,
    "Paused": 59457,
    "Batch bonus mismatch": 60006,
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
    {"name":"SetOwnJettonWallet","header":3570918315,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetClaimVerifier","header":3248553985,"fields":[{"name":"pubkey","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"ClaimUptime","header":3248553986,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"nonce","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"expiry","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"sigCell","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"RegisterAttestorKey","header":2339755838,"fields":[{"name":"pubkey","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"authorized","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"SetQuorumThreshold","header":2068563096,"fields":[{"name":"threshold","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"SettleTaskWithProof","header":2168072470,"fields":[{"name":"taskId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"workerAddr","type":{"kind":"simple","type":"address","optional":false}},{"name":"resultHash","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"attestationCount","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"attestations","type":{"kind":"simple","type":"cell","optional":false}},{"name":"gstdBonusAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"computeUnits","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"SettleBatch","header":745424004,"fields":[{"name":"workerAddr","type":{"kind":"simple","type":"address","optional":false}},{"name":"entryCount","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"entries","type":{"kind":"simple","type":"cell","optional":false}},{"name":"totalGstdBonusAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}}]},
    {"name":"SettlementMaster$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"gateway","type":{"kind":"simple","type":"address","optional":false}},{"name":"gstdJetton","type":{"kind":"simple","type":"address","optional":false}},{"name":"treasury","type":{"kind":"simple","type":"address","optional":false}},{"name":"protocolFee","type":{"kind":"simple","type":"address","optional":false}},{"name":"workerShare","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"treasuryShare","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"protocolShare","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"baseRate","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalSettled","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalGSTDMinted","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"taskCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"ownJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"settledTasks","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"paused","type":{"kind":"simple","type":"bool","optional":false}},{"name":"minPayment","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"attestorKeys","type":{"kind":"dict","key":"int","value":"bool"}},{"name":"quorumThreshold","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"claimVerifierPubkey","type":{"kind":"simple","type":"uint","optional":false,"format":256}},{"name":"usedClaimNonces","type":{"kind":"dict","key":"int","value":"bool"}}]},
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
    "SetOwnJettonWallet": 3570918315,
    "SetClaimVerifier": 3248553985,
    "ClaimUptime": 3248553986,
    "RegisterAttestorKey": 2339755838,
    "SetQuorumThreshold": 2068563096,
    "SettleTaskWithProof": 2168072470,
    "SettleBatch": 745424004,
}

const SettlementMaster_getters: ABIGetter[] = [
    {"name":"get_settlement_stats","methodId":70039,"arguments":[],"returnType":{"kind":"simple","type":"SettlementStats","optional":false}},
    {"name":"get_revenue_split","methodId":100776,"arguments":[],"returnType":{"kind":"simple","type":"RevenueSplit","optional":false}},
    {"name":"get_addresses","methodId":110491,"arguments":[],"returnType":{"kind":"simple","type":"ContractAddresses","optional":false}},
    {"name":"is_paused","methodId":95098,"arguments":[],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"get_quorum_threshold","methodId":88343,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"is_attestor_authorized","methodId":123202,"arguments":[{"name":"pubkey","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"is_task_settled","methodId":72523,"arguments":[{"name":"taskId","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"bool","optional":false}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const SettlementMaster_getterMapping: { [key: string]: string } = {
    'get_settlement_stats': 'getGetSettlementStats',
    'get_revenue_split': 'getGetRevenueSplit',
    'get_addresses': 'getGetAddresses',
    'is_paused': 'getIsPaused',
    'get_quorum_threshold': 'getGetQuorumThreshold',
    'is_attestor_authorized': 'getIsAttestorAuthorized',
    'is_task_settled': 'getIsTaskSettled',
    'owner': 'getOwner',
}

const SettlementMaster_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"SetGateway"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SettleTask"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SettleTaskWithProof"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SettleBatch"}},
    {"receiver":"internal","message":{"kind":"typed","type":"RegisterAttestorKey"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetQuorumThreshold"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetOwnJettonWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetClaimVerifier"}},
    {"receiver":"internal","message":{"kind":"typed","type":"ClaimUptime"}},
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
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: SetGateway | SettleTask | SettleTaskWithProof | SettleBatch | RegisterAttestorKey | SetQuorumThreshold | SetOwnJettonWallet | SetClaimVerifier | ClaimUptime | UpdateShares | UpdateAddresses | SetBaseRate | EmergencyPause | Deploy) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetGateway') {
            body = beginCell().store(storeSetGateway(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SettleTask') {
            body = beginCell().store(storeSettleTask(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SettleTaskWithProof') {
            body = beginCell().store(storeSettleTaskWithProof(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SettleBatch') {
            body = beginCell().store(storeSettleBatch(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'RegisterAttestorKey') {
            body = beginCell().store(storeRegisterAttestorKey(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetQuorumThreshold') {
            body = beginCell().store(storeSetQuorumThreshold(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetOwnJettonWallet') {
            body = beginCell().store(storeSetOwnJettonWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetClaimVerifier') {
            body = beginCell().store(storeSetClaimVerifier(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'ClaimUptime') {
            body = beginCell().store(storeClaimUptime(message)).endCell();
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
    
    async getGetQuorumThreshold(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_quorum_threshold', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getIsAttestorAuthorized(provider: ContractProvider, pubkey: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(pubkey);
        const source = (await provider.get('is_attestor_authorized', builder.build())).stack;
        const result = source.readBoolean();
        return result;
    }
    
    async getIsTaskSettled(provider: ContractProvider, taskId: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(taskId);
        const source = (await provider.get('is_task_settled', builder.build())).stack;
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