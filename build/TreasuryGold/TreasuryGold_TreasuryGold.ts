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

export type SetConvertRatio = {
    $$type: 'SetConvertRatio';
    ratio: bigint;
}

export function storeSetConvertRatio(src: SetConvertRatio) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3740403761, 32);
        b_0.storeUint(src.ratio, 8);
    };
}

export function loadSetConvertRatio(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3740403761) { throw Error('Invalid prefix'); }
    const _ratio = sc_0.loadUintBig(8);
    return { $$type: 'SetConvertRatio' as const, ratio: _ratio };
}

export function loadTupleSetConvertRatio(source: TupleReader) {
    const _ratio = source.readBigNumber();
    return { $$type: 'SetConvertRatio' as const, ratio: _ratio };
}

export function loadGetterTupleSetConvertRatio(source: TupleReader) {
    const _ratio = source.readBigNumber();
    return { $$type: 'SetConvertRatio' as const, ratio: _ratio };
}

export function storeTupleSetConvertRatio(source: SetConvertRatio) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.ratio);
    return builder.build();
}

export function dictValueParserSetConvertRatio(): DictionaryValue<SetConvertRatio> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetConvertRatio(src)).endCell());
        },
        parse: (src) => {
            return loadSetConvertRatio(src.loadRef().beginParse());
        }
    }
}

export type SetDexRouter = {
    $$type: 'SetDexRouter';
    router: Address;
}

export function storeSetDexRouter(src: SetDexRouter) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2701254185, 32);
        b_0.storeAddress(src.router);
    };
}

export function loadSetDexRouter(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2701254185) { throw Error('Invalid prefix'); }
    const _router = sc_0.loadAddress();
    return { $$type: 'SetDexRouter' as const, router: _router };
}

export function loadTupleSetDexRouter(source: TupleReader) {
    const _router = source.readAddress();
    return { $$type: 'SetDexRouter' as const, router: _router };
}

export function loadGetterTupleSetDexRouter(source: TupleReader) {
    const _router = source.readAddress();
    return { $$type: 'SetDexRouter' as const, router: _router };
}

export function storeTupleSetDexRouter(source: SetDexRouter) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.router);
    return builder.build();
}

export function dictValueParserSetDexRouter(): DictionaryValue<SetDexRouter> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetDexRouter(src)).endCell());
        },
        parse: (src) => {
            return loadSetDexRouter(src.loadRef().beginParse());
        }
    }
}

export type WithdrawOperational = {
    $$type: 'WithdrawOperational';
    amount: bigint;
    destination: Address;
}

export function storeWithdrawOperational(src: WithdrawOperational) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2255565524, 32);
        b_0.storeCoins(src.amount);
        b_0.storeAddress(src.destination);
    };
}

export function loadWithdrawOperational(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2255565524) { throw Error('Invalid prefix'); }
    const _amount = sc_0.loadCoins();
    const _destination = sc_0.loadAddress();
    return { $$type: 'WithdrawOperational' as const, amount: _amount, destination: _destination };
}

export function loadTupleWithdrawOperational(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'WithdrawOperational' as const, amount: _amount, destination: _destination };
}

export function loadGetterTupleWithdrawOperational(source: TupleReader) {
    const _amount = source.readBigNumber();
    const _destination = source.readAddress();
    return { $$type: 'WithdrawOperational' as const, amount: _amount, destination: _destination };
}

export function storeTupleWithdrawOperational(source: WithdrawOperational) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.amount);
    builder.writeAddress(source.destination);
    return builder.build();
}

export function dictValueParserWithdrawOperational(): DictionaryValue<WithdrawOperational> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawOperational(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawOperational(src.loadRef().beginParse());
        }
    }
}

export type SetXautJetton = {
    $$type: 'SetXautJetton';
    xautAddr: Address;
}

export function storeSetXautJetton(src: SetXautJetton) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3103292198, 32);
        b_0.storeAddress(src.xautAddr);
    };
}

export function loadSetXautJetton(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3103292198) { throw Error('Invalid prefix'); }
    const _xautAddr = sc_0.loadAddress();
    return { $$type: 'SetXautJetton' as const, xautAddr: _xautAddr };
}

export function loadTupleSetXautJetton(source: TupleReader) {
    const _xautAddr = source.readAddress();
    return { $$type: 'SetXautJetton' as const, xautAddr: _xautAddr };
}

export function loadGetterTupleSetXautJetton(source: TupleReader) {
    const _xautAddr = source.readAddress();
    return { $$type: 'SetXautJetton' as const, xautAddr: _xautAddr };
}

export function storeTupleSetXautJetton(source: SetXautJetton) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.xautAddr);
    return builder.build();
}

export function dictValueParserSetXautJetton(): DictionaryValue<SetXautJetton> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetXautJetton(src)).endCell());
        },
        parse: (src) => {
            return loadSetXautJetton(src.loadRef().beginParse());
        }
    }
}

export type SetPtonMaster = {
    $$type: 'SetPtonMaster';
    ptonMaster: Address;
}

export function storeSetPtonMaster(src: SetPtonMaster) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3491397779, 32);
        b_0.storeAddress(src.ptonMaster);
    };
}

export function loadSetPtonMaster(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3491397779) { throw Error('Invalid prefix'); }
    const _ptonMaster = sc_0.loadAddress();
    return { $$type: 'SetPtonMaster' as const, ptonMaster: _ptonMaster };
}

export function loadTupleSetPtonMaster(source: TupleReader) {
    const _ptonMaster = source.readAddress();
    return { $$type: 'SetPtonMaster' as const, ptonMaster: _ptonMaster };
}

export function loadGetterTupleSetPtonMaster(source: TupleReader) {
    const _ptonMaster = source.readAddress();
    return { $$type: 'SetPtonMaster' as const, ptonMaster: _ptonMaster };
}

export function storeTupleSetPtonMaster(source: SetPtonMaster) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.ptonMaster);
    return builder.build();
}

export function dictValueParserSetPtonMaster(): DictionaryValue<SetPtonMaster> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetPtonMaster(src)).endCell());
        },
        parse: (src) => {
            return loadSetPtonMaster(src.loadRef().beginParse());
        }
    }
}

export type SetOwnXautJettonWallet = {
    $$type: 'SetOwnXautJettonWallet';
    wallet: Address;
}

export function storeSetOwnXautJettonWallet(src: SetOwnXautJettonWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1004249603, 32);
        b_0.storeAddress(src.wallet);
    };
}

export function loadSetOwnXautJettonWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1004249603) { throw Error('Invalid prefix'); }
    const _wallet = sc_0.loadAddress();
    return { $$type: 'SetOwnXautJettonWallet' as const, wallet: _wallet };
}

export function loadTupleSetOwnXautJettonWallet(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'SetOwnXautJettonWallet' as const, wallet: _wallet };
}

export function loadGetterTupleSetOwnXautJettonWallet(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'SetOwnXautJettonWallet' as const, wallet: _wallet };
}

export function storeTupleSetOwnXautJettonWallet(source: SetOwnXautJettonWallet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserSetOwnXautJettonWallet(): DictionaryValue<SetOwnXautJettonWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetOwnXautJettonWallet(src)).endCell());
        },
        parse: (src) => {
            return loadSetOwnXautJettonWallet(src.loadRef().beginParse());
        }
    }
}

export type SetOwnPtonJettonWallet = {
    $$type: 'SetOwnPtonJettonWallet';
    wallet: Address;
}

export function storeSetOwnPtonJettonWallet(src: SetOwnPtonJettonWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1646744519, 32);
        b_0.storeAddress(src.wallet);
    };
}

export function loadSetOwnPtonJettonWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1646744519) { throw Error('Invalid prefix'); }
    const _wallet = sc_0.loadAddress();
    return { $$type: 'SetOwnPtonJettonWallet' as const, wallet: _wallet };
}

export function loadTupleSetOwnPtonJettonWallet(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'SetOwnPtonJettonWallet' as const, wallet: _wallet };
}

export function loadGetterTupleSetOwnPtonJettonWallet(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'SetOwnPtonJettonWallet' as const, wallet: _wallet };
}

export function storeTupleSetOwnPtonJettonWallet(source: SetOwnPtonJettonWallet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserSetOwnPtonJettonWallet(): DictionaryValue<SetOwnPtonJettonWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetOwnPtonJettonWallet(src)).endCell());
        },
        parse: (src) => {
            return loadSetOwnPtonJettonWallet(src.loadRef().beginParse());
        }
    }
}

export type SetRouterXautWallet = {
    $$type: 'SetRouterXautWallet';
    wallet: Address;
}

export function storeSetRouterXautWallet(src: SetRouterXautWallet) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(616787849, 32);
        b_0.storeAddress(src.wallet);
    };
}

export function loadSetRouterXautWallet(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 616787849) { throw Error('Invalid prefix'); }
    const _wallet = sc_0.loadAddress();
    return { $$type: 'SetRouterXautWallet' as const, wallet: _wallet };
}

export function loadTupleSetRouterXautWallet(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'SetRouterXautWallet' as const, wallet: _wallet };
}

export function loadGetterTupleSetRouterXautWallet(source: TupleReader) {
    const _wallet = source.readAddress();
    return { $$type: 'SetRouterXautWallet' as const, wallet: _wallet };
}

export function storeTupleSetRouterXautWallet(source: SetRouterXautWallet) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.wallet);
    return builder.build();
}

export function dictValueParserSetRouterXautWallet(): DictionaryValue<SetRouterXautWallet> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSetRouterXautWallet(src)).endCell());
        },
        parse: (src) => {
            return loadSetRouterXautWallet(src.loadRef().beginParse());
        }
    }
}

export type SwapGold = {
    $$type: 'SwapGold';
    minAskAmount: bigint;
    deadline: bigint;
}

export function storeSwapGold(src: SwapGold) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2021599419, 32);
        b_0.storeCoins(src.minAskAmount);
        b_0.storeUint(src.deadline, 32);
    };
}

export function loadSwapGold(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2021599419) { throw Error('Invalid prefix'); }
    const _minAskAmount = sc_0.loadCoins();
    const _deadline = sc_0.loadUintBig(32);
    return { $$type: 'SwapGold' as const, minAskAmount: _minAskAmount, deadline: _deadline };
}

export function loadTupleSwapGold(source: TupleReader) {
    const _minAskAmount = source.readBigNumber();
    const _deadline = source.readBigNumber();
    return { $$type: 'SwapGold' as const, minAskAmount: _minAskAmount, deadline: _deadline };
}

export function loadGetterTupleSwapGold(source: TupleReader) {
    const _minAskAmount = source.readBigNumber();
    const _deadline = source.readBigNumber();
    return { $$type: 'SwapGold' as const, minAskAmount: _minAskAmount, deadline: _deadline };
}

export function storeTupleSwapGold(source: SwapGold) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.minAskAmount);
    builder.writeNumber(source.deadline);
    return builder.build();
}

export function dictValueParserSwapGold(): DictionaryValue<SwapGold> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSwapGold(src)).endCell());
        },
        parse: (src) => {
            return loadSwapGold(src.loadRef().beginParse());
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

export type TreasuryGold$Data = {
    $$type: 'TreasuryGold$Data';
    owner: Address;
    xautJetton: Address;
    dexRouter: Address;
    ptonMaster: Address;
    ownXautJettonWallet: Address;
    ownPtonJettonWallet: Address;
    routerXautWallet: Address;
    goldReserveXAUt: bigint;
    totalTONReceived: bigint;
    totalTONConvertedToGold: bigint;
    totalOperationalSpent: bigint;
    goldConvertRatio: bigint;
    depositCount: bigint;
    lastDepositTime: bigint;
}

export function storeTreasuryGold$Data(src: TreasuryGold$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.xautJetton);
        b_0.storeAddress(src.dexRouter);
        const b_1 = new Builder();
        b_1.storeAddress(src.ptonMaster);
        b_1.storeAddress(src.ownXautJettonWallet);
        b_1.storeAddress(src.ownPtonJettonWallet);
        const b_2 = new Builder();
        b_2.storeAddress(src.routerXautWallet);
        b_2.storeCoins(src.goldReserveXAUt);
        b_2.storeCoins(src.totalTONReceived);
        b_2.storeCoins(src.totalTONConvertedToGold);
        b_2.storeCoins(src.totalOperationalSpent);
        b_2.storeUint(src.goldConvertRatio, 8);
        b_2.storeUint(src.depositCount, 64);
        b_2.storeUint(src.lastDepositTime, 64);
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadTreasuryGold$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _xautJetton = sc_0.loadAddress();
    const _dexRouter = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _ptonMaster = sc_1.loadAddress();
    const _ownXautJettonWallet = sc_1.loadAddress();
    const _ownPtonJettonWallet = sc_1.loadAddress();
    const sc_2 = sc_1.loadRef().beginParse();
    const _routerXautWallet = sc_2.loadAddress();
    const _goldReserveXAUt = sc_2.loadCoins();
    const _totalTONReceived = sc_2.loadCoins();
    const _totalTONConvertedToGold = sc_2.loadCoins();
    const _totalOperationalSpent = sc_2.loadCoins();
    const _goldConvertRatio = sc_2.loadUintBig(8);
    const _depositCount = sc_2.loadUintBig(64);
    const _lastDepositTime = sc_2.loadUintBig(64);
    return { $$type: 'TreasuryGold$Data' as const, owner: _owner, xautJetton: _xautJetton, dexRouter: _dexRouter, ptonMaster: _ptonMaster, ownXautJettonWallet: _ownXautJettonWallet, ownPtonJettonWallet: _ownPtonJettonWallet, routerXautWallet: _routerXautWallet, goldReserveXAUt: _goldReserveXAUt, totalTONReceived: _totalTONReceived, totalTONConvertedToGold: _totalTONConvertedToGold, totalOperationalSpent: _totalOperationalSpent, goldConvertRatio: _goldConvertRatio, depositCount: _depositCount, lastDepositTime: _lastDepositTime };
}

export function loadTupleTreasuryGold$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _xautJetton = source.readAddress();
    const _dexRouter = source.readAddress();
    const _ptonMaster = source.readAddress();
    const _ownXautJettonWallet = source.readAddress();
    const _ownPtonJettonWallet = source.readAddress();
    const _routerXautWallet = source.readAddress();
    const _goldReserveXAUt = source.readBigNumber();
    const _totalTONReceived = source.readBigNumber();
    const _totalTONConvertedToGold = source.readBigNumber();
    const _totalOperationalSpent = source.readBigNumber();
    const _goldConvertRatio = source.readBigNumber();
    const _depositCount = source.readBigNumber();
    const _lastDepositTime = source.readBigNumber();
    return { $$type: 'TreasuryGold$Data' as const, owner: _owner, xautJetton: _xautJetton, dexRouter: _dexRouter, ptonMaster: _ptonMaster, ownXautJettonWallet: _ownXautJettonWallet, ownPtonJettonWallet: _ownPtonJettonWallet, routerXautWallet: _routerXautWallet, goldReserveXAUt: _goldReserveXAUt, totalTONReceived: _totalTONReceived, totalTONConvertedToGold: _totalTONConvertedToGold, totalOperationalSpent: _totalOperationalSpent, goldConvertRatio: _goldConvertRatio, depositCount: _depositCount, lastDepositTime: _lastDepositTime };
}

export function loadGetterTupleTreasuryGold$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _xautJetton = source.readAddress();
    const _dexRouter = source.readAddress();
    const _ptonMaster = source.readAddress();
    const _ownXautJettonWallet = source.readAddress();
    const _ownPtonJettonWallet = source.readAddress();
    const _routerXautWallet = source.readAddress();
    const _goldReserveXAUt = source.readBigNumber();
    const _totalTONReceived = source.readBigNumber();
    const _totalTONConvertedToGold = source.readBigNumber();
    const _totalOperationalSpent = source.readBigNumber();
    const _goldConvertRatio = source.readBigNumber();
    const _depositCount = source.readBigNumber();
    const _lastDepositTime = source.readBigNumber();
    return { $$type: 'TreasuryGold$Data' as const, owner: _owner, xautJetton: _xautJetton, dexRouter: _dexRouter, ptonMaster: _ptonMaster, ownXautJettonWallet: _ownXautJettonWallet, ownPtonJettonWallet: _ownPtonJettonWallet, routerXautWallet: _routerXautWallet, goldReserveXAUt: _goldReserveXAUt, totalTONReceived: _totalTONReceived, totalTONConvertedToGold: _totalTONConvertedToGold, totalOperationalSpent: _totalOperationalSpent, goldConvertRatio: _goldConvertRatio, depositCount: _depositCount, lastDepositTime: _lastDepositTime };
}

export function storeTupleTreasuryGold$Data(source: TreasuryGold$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeAddress(source.xautJetton);
    builder.writeAddress(source.dexRouter);
    builder.writeAddress(source.ptonMaster);
    builder.writeAddress(source.ownXautJettonWallet);
    builder.writeAddress(source.ownPtonJettonWallet);
    builder.writeAddress(source.routerXautWallet);
    builder.writeNumber(source.goldReserveXAUt);
    builder.writeNumber(source.totalTONReceived);
    builder.writeNumber(source.totalTONConvertedToGold);
    builder.writeNumber(source.totalOperationalSpent);
    builder.writeNumber(source.goldConvertRatio);
    builder.writeNumber(source.depositCount);
    builder.writeNumber(source.lastDepositTime);
    return builder.build();
}

export function dictValueParserTreasuryGold$Data(): DictionaryValue<TreasuryGold$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeTreasuryGold$Data(src)).endCell());
        },
        parse: (src) => {
            return loadTreasuryGold$Data(src.loadRef().beginParse());
        }
    }
}

export type GoldReserveData = {
    $$type: 'GoldReserveData';
    goldReserveXAUt: bigint;
    totalTONReceived: bigint;
    totalTONConvertedToGold: bigint;
    convertRatio: bigint;
    depositCount: bigint;
    lastDepositTime: bigint;
}

export function storeGoldReserveData(src: GoldReserveData) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeCoins(src.goldReserveXAUt);
        b_0.storeCoins(src.totalTONReceived);
        b_0.storeCoins(src.totalTONConvertedToGold);
        b_0.storeUint(src.convertRatio, 8);
        b_0.storeUint(src.depositCount, 64);
        b_0.storeUint(src.lastDepositTime, 64);
    };
}

export function loadGoldReserveData(slice: Slice) {
    const sc_0 = slice;
    const _goldReserveXAUt = sc_0.loadCoins();
    const _totalTONReceived = sc_0.loadCoins();
    const _totalTONConvertedToGold = sc_0.loadCoins();
    const _convertRatio = sc_0.loadUintBig(8);
    const _depositCount = sc_0.loadUintBig(64);
    const _lastDepositTime = sc_0.loadUintBig(64);
    return { $$type: 'GoldReserveData' as const, goldReserveXAUt: _goldReserveXAUt, totalTONReceived: _totalTONReceived, totalTONConvertedToGold: _totalTONConvertedToGold, convertRatio: _convertRatio, depositCount: _depositCount, lastDepositTime: _lastDepositTime };
}

export function loadTupleGoldReserveData(source: TupleReader) {
    const _goldReserveXAUt = source.readBigNumber();
    const _totalTONReceived = source.readBigNumber();
    const _totalTONConvertedToGold = source.readBigNumber();
    const _convertRatio = source.readBigNumber();
    const _depositCount = source.readBigNumber();
    const _lastDepositTime = source.readBigNumber();
    return { $$type: 'GoldReserveData' as const, goldReserveXAUt: _goldReserveXAUt, totalTONReceived: _totalTONReceived, totalTONConvertedToGold: _totalTONConvertedToGold, convertRatio: _convertRatio, depositCount: _depositCount, lastDepositTime: _lastDepositTime };
}

export function loadGetterTupleGoldReserveData(source: TupleReader) {
    const _goldReserveXAUt = source.readBigNumber();
    const _totalTONReceived = source.readBigNumber();
    const _totalTONConvertedToGold = source.readBigNumber();
    const _convertRatio = source.readBigNumber();
    const _depositCount = source.readBigNumber();
    const _lastDepositTime = source.readBigNumber();
    return { $$type: 'GoldReserveData' as const, goldReserveXAUt: _goldReserveXAUt, totalTONReceived: _totalTONReceived, totalTONConvertedToGold: _totalTONConvertedToGold, convertRatio: _convertRatio, depositCount: _depositCount, lastDepositTime: _lastDepositTime };
}

export function storeTupleGoldReserveData(source: GoldReserveData) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.goldReserveXAUt);
    builder.writeNumber(source.totalTONReceived);
    builder.writeNumber(source.totalTONConvertedToGold);
    builder.writeNumber(source.convertRatio);
    builder.writeNumber(source.depositCount);
    builder.writeNumber(source.lastDepositTime);
    return builder.build();
}

export function dictValueParserGoldReserveData(): DictionaryValue<GoldReserveData> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeGoldReserveData(src)).endCell());
        },
        parse: (src) => {
            return loadGoldReserveData(src.loadRef().beginParse());
        }
    }
}

export type SwapWiring = {
    $$type: 'SwapWiring';
    ptonMaster: Address;
    ownXautJettonWallet: Address;
    ownPtonJettonWallet: Address;
    routerXautWallet: Address;
}

export function storeSwapWiring(src: SwapWiring) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.ptonMaster);
        b_0.storeAddress(src.ownXautJettonWallet);
        b_0.storeAddress(src.ownPtonJettonWallet);
        const b_1 = new Builder();
        b_1.storeAddress(src.routerXautWallet);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadSwapWiring(slice: Slice) {
    const sc_0 = slice;
    const _ptonMaster = sc_0.loadAddress();
    const _ownXautJettonWallet = sc_0.loadAddress();
    const _ownPtonJettonWallet = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _routerXautWallet = sc_1.loadAddress();
    return { $$type: 'SwapWiring' as const, ptonMaster: _ptonMaster, ownXautJettonWallet: _ownXautJettonWallet, ownPtonJettonWallet: _ownPtonJettonWallet, routerXautWallet: _routerXautWallet };
}

export function loadTupleSwapWiring(source: TupleReader) {
    const _ptonMaster = source.readAddress();
    const _ownXautJettonWallet = source.readAddress();
    const _ownPtonJettonWallet = source.readAddress();
    const _routerXautWallet = source.readAddress();
    return { $$type: 'SwapWiring' as const, ptonMaster: _ptonMaster, ownXautJettonWallet: _ownXautJettonWallet, ownPtonJettonWallet: _ownPtonJettonWallet, routerXautWallet: _routerXautWallet };
}

export function loadGetterTupleSwapWiring(source: TupleReader) {
    const _ptonMaster = source.readAddress();
    const _ownXautJettonWallet = source.readAddress();
    const _ownPtonJettonWallet = source.readAddress();
    const _routerXautWallet = source.readAddress();
    return { $$type: 'SwapWiring' as const, ptonMaster: _ptonMaster, ownXautJettonWallet: _ownXautJettonWallet, ownPtonJettonWallet: _ownPtonJettonWallet, routerXautWallet: _routerXautWallet };
}

export function storeTupleSwapWiring(source: SwapWiring) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.ptonMaster);
    builder.writeAddress(source.ownXautJettonWallet);
    builder.writeAddress(source.ownPtonJettonWallet);
    builder.writeAddress(source.routerXautWallet);
    return builder.build();
}

export function dictValueParserSwapWiring(): DictionaryValue<SwapWiring> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSwapWiring(src)).endCell());
        },
        parse: (src) => {
            return loadSwapWiring(src.loadRef().beginParse());
        }
    }
}

 type TreasuryGold_init_args = {
    $$type: 'TreasuryGold_init_args';
    owner: Address;
    xautJetton: Address;
    dexRouter: Address;
}

function initTreasuryGold_init_args(src: TreasuryGold_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeAddress(src.xautJetton);
        b_0.storeAddress(src.dexRouter);
    };
}

async function TreasuryGold_init(owner: Address, xautJetton: Address, dexRouter: Address) {
    const __code = Cell.fromHex('b5ee9c724102260100095b000114ff00f4a413f4bcf2c80b01020162021603dcd0eda2edfb01d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e2bfa40fa40fa40d401d0fa40fa40fa40d430d0fa40fa00fa00fa00fa00d307d33fd33f3010be10bd10bc6c1e8e8bfa40fa40fa40552003d158e20f925f0fe02dd749c21f913ee30d0cf90123031404fe0dd31f218210787f28bbbae302218210f4e4f591ba8ed531d33f31fa00308130d8f8422ac705f2f48200c1e68d086000000000000000000000000000000000000000000000000000000000000000000452a0c705b3f2f415a010bd10ac109b108a1079106810570610354403e0218210867132d4bae302218210def20831ba0409070a02fe31fa00d31f308200f7a7f8422fc705f2f48200d6768d086000000000000000000000000000000000000000000000000000000000000000000452c0c705b3f2f48126548d086000000000000000000000000000000000000000000000000000000000000000000452a0c705b3f2f48152cf895290c705b3f2f4816a3d22c200240501fef2f4820094332582103b9aca00bcf2f48210127a39808200d927f8276f105372a0820afaf080a0bef2f470229832f823810384a002df6d6dc85006fa02f828cf1622fa0215f40021fa0214f4005230cb0f5230cb01c9c882106664de2a01cb1f2acf16f828cf16f828cf1613cb3f12ccc97fc88209f3835d01cb1f5240cb3f06019c27fa02f828cf16ca00ccc95055a0727f2a040710246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010bd551a0902d231fa00fa40308200f7a7f8422fc705f2f4813bb3f8276f1082103b9aca00a15230bbf2f45131a07270881046103610246d50436d03c8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0010bd551a08090034000000006f7065726174696f6e616c5f7769746864726177616c006ac87f01ca0055d050dece1bce19ce07c8ce16ce14ce02c8ce01fa0258fa0258fa025003fa0213cb0713cb3f13cb3fcdcdc9ed54db3104f68e596c21d307308200f7a7f8422dc705f2f48200ee0a21c2319321c1609170e2f2f410bd551ac87f01ca0055d050dece1bce19ce07c8ce16ce14ce02c8ce01fa0258fa0258fa025003fa0213cb0713cb3f13cb3fcdcdc9ed54db31e0218210a101de29bae302218210b8f87b26bae302218210d01a8093bae302210b0c0d0e00b4313a09fa40308200f7a7f8422dc705f2f410bd10ac0b108a10791068105710461035443012c87f01ca0055d050dece1bce19ce07c8ce16ce14ce02c8ce01fa0258fa0258fa025003fa0213cb0713cb3f13cb3fcdcdc9ed54db3100b2313b0afa40308200f7a7f8422dc705f2f410bd0c109b108a107910681057104610354403c87f01ca0055d050dece1bce19ce07c8ce16ce14ce02c8ce01fa0258fa0258fa025003fa0213cb0713cb3f13cb3fcdcdc9ed54db3100b2313908fa40308200f7a7f8422dc705f2f410bd10ac109b0a107910681057104610354403c87f01ca0055d050dece1bce19ce07c8ce16ce14ce02c8ce01fa0258fa0258fa025003fa0213cb0713cb3f13cb3fcdcdc9ed54db3103fe82103bdba203ba8e5a313807fa40308200f7a7f8422dc705f2f410bd10ac109b108a091068105710461035443012c87f01ca0055d050dece1bce19ce07c8ce16ce14ce02c8ce01fa0258fa0258fa025003fa0213cb0713cb3f13cb3fcdcdc9ed54db31e0218210622753c7bae30221821024c36f89bae302018210946a98b60f101100b2313706fa40308200f7a7f8422dc705f2f410bd10ac109b108a1079081057104610354403c87f01ca0055d050dece1bce19ce07c8ce16ce14ce02c8ce01fa0258fa0258fa025003fa0213cb0713cb3f13cb3fcdcdc9ed54db3100b4313605fa40308200f7a7f8422dc705f2f410bd10ac109b108a107910680710461035443012c87f01ca0055d050dece1bce19ce07c8ce16ce14ce02c8ce01fa0258fa0258fa025003fa0213cb0713cb3f13cb3fcdcdc9ed54db31010cbae3023e10cd1201fcd33f30c8018210aff90f5758cb1fcb3fc910ce10bd10ac109b108a10791068105710461035443012f84270705003804201503304c8cf8580ca00cf8440ce01fa02806acf40f400c901fb00c87f01ca0055d050dece1bce19ce07c8ce16ce14ce02c8ce01fa0258fa0258fa025003fa0213cb0713cb3f13cb3fcdcdc9ed54130004db31015482f066d23e7744329745f6f26d2907874b52b0232e43983b1c95de8dc315bb45ba1fbae3025f0df2c0821500d4f8416f24135f03820afaf080a1811dc421c200f2f45133a00da4f823514da88064a90413a010bd10ac109b108a10791068105704466603c87f01ca0055d050dece1bce19ce07c8ce16ce14ce02c8ce01fa0258fa0258fa025003fa0213cb0713cb3f13cb3fcdcdc9ed54020120171c020120181a028fb83f5ed44d0d200018e2bfa40fa40fa40d401d0fa40fa40fa40d430d0fa40fa00fa00fa00fa00d307d33fd33f3010be10bd10bc6c1e8e8bfa40fa40fa40552003d158e2db3c6ce4823190008547a982a028fb851ded44d0d200018e2bfa40fa40fa40d401d0fa40fa40fa40d430d0fa40fa00fa00fa00fa00d307d33fd33f3010be10bd10bc6c1e8e8bfa40fa40fa40552003d158e2db3c6ce18231b00022d0201581d1f028fb6f69da89a1a400031c57f481f481f481a803a1f481f481f481a861a1f481f401f401f401f401a60fa67fa67e60217c217a2178d83d1d17f481f481f480aa4007a2b1c5b678d9c30231e0002220201202022028fb086bb5134348000638afe903e903e903500743e903e903e90350c343e903e803e803e803e8034c1f4cff4cfcc042f842f442f1b07a3a2fe903e903e90154800f45638b6cf1b39a02321000c547654547543028fb1e67b5134348000638afe903e903e903500743e903e903e90350c343e903e803e803e803e8034c1f4cff4cfcc042f842f442f1b07a3a2fe903e903e90154800f45638b6cf1b3860232501ea8d08600000000000000000000000000000000000000000000000000000000000000000048d08600000000000000000000000000000000000000000000000000000000000000000048d0860000000000000000000000000000000000000000000000000000000000000000004897054700080465311240043800000000000000000000000000000000000000000000000000000000000000000100008f8276f10eaa65a2b');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initTreasuryGold_init_args({ $$type: 'TreasuryGold_init_args', owner, xautJetton, dexRouter })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const TreasuryGold_errors = {
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
    7620: { message: "Deposit too small" },
    9812: { message: "Own pTON wallet not configured" },
    12504: { message: "Only our own verified XAUt wallet" },
    15283: { message: "Insufficient operational balance" },
    21199: { message: "Router XAUt wallet not configured" },
    27197: { message: "minAskAmount required for slippage protection" },
    37939: { message: "Insufficient gold fund" },
    49638: { message: "Own XAUt wallet not configured" },
    54902: { message: "pTON master not configured" },
    55591: { message: "Insufficient contract balance" },
    60938: { message: "Ratio must be 50-95%" },
    63399: { message: "Only DAO" },
} as const

export const TreasuryGold_errors_backward = {
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
    "Deposit too small": 7620,
    "Own pTON wallet not configured": 9812,
    "Only our own verified XAUt wallet": 12504,
    "Insufficient operational balance": 15283,
    "Router XAUt wallet not configured": 21199,
    "minAskAmount required for slippage protection": 27197,
    "Insufficient gold fund": 37939,
    "Own XAUt wallet not configured": 49638,
    "pTON master not configured": 54902,
    "Insufficient contract balance": 55591,
    "Ratio must be 50-95%": 60938,
    "Only DAO": 63399,
} as const

const TreasuryGold_types: ABIType[] = [
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
    {"name":"SetConvertRatio","header":3740403761,"fields":[{"name":"ratio","type":{"kind":"simple","type":"uint","optional":false,"format":8}}]},
    {"name":"SetDexRouter","header":2701254185,"fields":[{"name":"router","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"WithdrawOperational","header":2255565524,"fields":[{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"destination","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetXautJetton","header":3103292198,"fields":[{"name":"xautAddr","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetPtonMaster","header":3491397779,"fields":[{"name":"ptonMaster","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetOwnXautJettonWallet","header":1004249603,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetOwnPtonJettonWallet","header":1646744519,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SetRouterXautWallet","header":616787849,"fields":[{"name":"wallet","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SwapGold","header":2021599419,"fields":[{"name":"minAskAmount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"deadline","type":{"kind":"simple","type":"uint","optional":false,"format":32}}]},
    {"name":"TransferNotification","header":4108645777,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"amount","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"forwardPayload","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"TreasuryGold$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"xautJetton","type":{"kind":"simple","type":"address","optional":false}},{"name":"dexRouter","type":{"kind":"simple","type":"address","optional":false}},{"name":"ptonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"ownXautJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"ownPtonJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"routerXautWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"goldReserveXAUt","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalTONReceived","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalTONConvertedToGold","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalOperationalSpent","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"goldConvertRatio","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"depositCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"lastDepositTime","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"GoldReserveData","header":null,"fields":[{"name":"goldReserveXAUt","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalTONReceived","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"totalTONConvertedToGold","type":{"kind":"simple","type":"uint","optional":false,"format":"coins"}},{"name":"convertRatio","type":{"kind":"simple","type":"uint","optional":false,"format":8}},{"name":"depositCount","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"lastDepositTime","type":{"kind":"simple","type":"uint","optional":false,"format":64}}]},
    {"name":"SwapWiring","header":null,"fields":[{"name":"ptonMaster","type":{"kind":"simple","type":"address","optional":false}},{"name":"ownXautJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"ownPtonJettonWallet","type":{"kind":"simple","type":"address","optional":false}},{"name":"routerXautWallet","type":{"kind":"simple","type":"address","optional":false}}]},
]

const TreasuryGold_opcodes = {
    "Deploy": 2490013878,
    "DeployOk": 2952335191,
    "FactoryDeploy": 1829761339,
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "SetConvertRatio": 3740403761,
    "SetDexRouter": 2701254185,
    "WithdrawOperational": 2255565524,
    "SetXautJetton": 3103292198,
    "SetPtonMaster": 3491397779,
    "SetOwnXautJettonWallet": 1004249603,
    "SetOwnPtonJettonWallet": 1646744519,
    "SetRouterXautWallet": 616787849,
    "SwapGold": 2021599419,
    "TransferNotification": 4108645777,
}

const TreasuryGold_getters: ABIGetter[] = [
    {"name":"get_gold_reserve","methodId":123418,"arguments":[],"returnType":{"kind":"simple","type":"GoldReserveData","optional":false}},
    {"name":"get_operational_balance","methodId":128921,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_convert_ratio","methodId":120756,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"get_swap_wiring","methodId":66549,"arguments":[],"returnType":{"kind":"simple","type":"SwapWiring","optional":false}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const TreasuryGold_getterMapping: { [key: string]: string } = {
    'get_gold_reserve': 'getGetGoldReserve',
    'get_operational_balance': 'getGetOperationalBalance',
    'get_convert_ratio': 'getGetConvertRatio',
    'get_swap_wiring': 'getGetSwapWiring',
    'owner': 'getOwner',
}

const TreasuryGold_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"text","text":"deposit"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SwapGold"}},
    {"receiver":"internal","message":{"kind":"typed","type":"TransferNotification"}},
    {"receiver":"internal","message":{"kind":"typed","type":"WithdrawOperational"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetConvertRatio"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetDexRouter"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetXautJetton"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetPtonMaster"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetOwnXautJettonWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetOwnPtonJettonWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"SetRouterXautWallet"}},
    {"receiver":"internal","message":{"kind":"typed","type":"Deploy"}},
]

export const STONFI_SWAP_OP = 1717886506n;
export const PTON_TON_TRANSFER_OP = 32736093n;
export const JETTON_TRANSFER_NOTIFICATION_OP = 1935855772n;

export class TreasuryGold implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = TreasuryGold_errors_backward;
    public static readonly opcodes = TreasuryGold_opcodes;
    
    static async init(owner: Address, xautJetton: Address, dexRouter: Address) {
        return await TreasuryGold_init(owner, xautJetton, dexRouter);
    }
    
    static async fromInit(owner: Address, xautJetton: Address, dexRouter: Address) {
        const __gen_init = await TreasuryGold_init(owner, xautJetton, dexRouter);
        const address = contractAddress(0, __gen_init);
        return new TreasuryGold(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new TreasuryGold(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  TreasuryGold_types,
        getters: TreasuryGold_getters,
        receivers: TreasuryGold_receivers,
        errors: TreasuryGold_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: "deposit" | SwapGold | TransferNotification | WithdrawOperational | SetConvertRatio | SetDexRouter | SetXautJetton | SetPtonMaster | SetOwnXautJettonWallet | SetOwnPtonJettonWallet | SetRouterXautWallet | Deploy) {
        
        let body: Cell | null = null;
        if (message === "deposit") {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SwapGold') {
            body = beginCell().store(storeSwapGold(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'TransferNotification') {
            body = beginCell().store(storeTransferNotification(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawOperational') {
            body = beginCell().store(storeWithdrawOperational(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetConvertRatio') {
            body = beginCell().store(storeSetConvertRatio(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetDexRouter') {
            body = beginCell().store(storeSetDexRouter(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetXautJetton') {
            body = beginCell().store(storeSetXautJetton(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetPtonMaster') {
            body = beginCell().store(storeSetPtonMaster(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetOwnXautJettonWallet') {
            body = beginCell().store(storeSetOwnXautJettonWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetOwnPtonJettonWallet') {
            body = beginCell().store(storeSetOwnPtonJettonWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'SetRouterXautWallet') {
            body = beginCell().store(storeSetRouterXautWallet(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'Deploy') {
            body = beginCell().store(storeDeploy(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getGetGoldReserve(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_gold_reserve', builder.build())).stack;
        const result = loadGetterTupleGoldReserveData(source);
        return result;
    }
    
    async getGetOperationalBalance(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_operational_balance', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetConvertRatio(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_convert_ratio', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getGetSwapWiring(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('get_swap_wiring', builder.build())).stack;
        const result = loadGetterTupleSwapWiring(source);
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}