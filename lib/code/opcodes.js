

// Remember TXGASPRICE/GASPRICE

var opcodes = {
    // 0x0
    STOP: 0x0,
    ADD: 0x1,
    MUL: 0x2,
    SUB: 0x3,
    DIV: 0x4,
    SDIV: 0x5,
    MOD: 0x6,
    SMOD: 0x7,
    ADDMOD: 0x8,
    MULMOD: 0x9,
    EXP: 0xA,
    SIGNEXTEND: 0xB,

    //0x10
    LT: 0x10,
    GT: 0x11,
    SLT: 0x12,
    SGT: 0x13,
    EQ: 0x14,
    ISZERO: 0x15,
    AND: 0x16,
    OR: 0x17,
    XOR: 0x18,
    NOT: 0x19,
    BYTE: 0x1A,

    // 0x20
    SHA3: 0x20,

    // 0x30
    ADDRESS: 0x30,
    BALANCE: 0x31,
    ORIGIN: 0x32,
    CALLER: 0x33,
    CALLVALUE: 0x34,
    CALLDATALOAD: 0x35,
    CALLDATASIZE: 0x36,
    CALLDATACOPY: 0x37,
    CODESIZE: 0x38,
    CODECOPY: 0x39,
    GASPRICE: 0x3A,
    EXTCODESIZE: 0x3B,
    EXTCODECOPY: 0x3C,

    // 0x40 range - block operations
    BLOCKHASH: 0x40,
    COINBASE: 0x41,
    TIMESTAMP: 0x42,
    NUMBER: 0x43,
    DIFFICULTY: 0x44,
    GASLIMIT: 0x45,

    // 0x50 range - 'storage' and execution
    POP: 0x50,
    MLOAD: 0x51,
    MSTORE: 0x52,
    MSTORE8: 0x53,
    SLOAD: 0x54,
    SSTORE: 0x55,
    JUMP: 0x56,
    JUMPI: 0x57,
    PC: 0x58,
    MSIZE: 0x59,
    GAS: 0x5A,
    JUMPDEST: 0x5B,

    // 0x60 range
    PUSH1: 0x60,
    PUSH2: 0x61,
    PUSH3: 0x62,
    PUSH4: 0x63,
    PUSH5: 0x64,
    PUSH6: 0x65,
    PUSH7: 0x66,
    PUSH8: 0x67,
    PUSH9: 0x68,
    PUSH10: 0x69,
    PUSH11: 0x6A,
    PUSH12: 0x6B,
    PUSH13: 0x6C,
    PUSH14: 0x6D,
    PUSH15: 0x6E,
    PUSH16: 0x6F,

    // 0x70 range
    PUSH17: 0x70,
    PUSH18: 0x71,
    PUSH19: 0x72,
    PUSH20: 0x73,
    PUSH21: 0x74,
    PUSH22: 0x75,
    PUSH23: 0x76,
    PUSH24: 0x77,
    PUSH25: 0x78,
    PUSH26: 0x79,
    PUSH27: 0x7A,
    PUSH28: 0x7B,
    PUSH29: 0x7C,
    PUSH30: 0x7D,
    PUSH31: 0x7E,
    PUSH32: 0x7F,

    // 0x80 range
    DUP1: 0x80,
    DUP2: 0x81,
    DUP3: 0x82,
    DUP4: 0x83,
    DUP5: 0x84,
    DUP6: 0x85,
    DUP7: 0x86,
    DUP8: 0x87,
    DUP9: 0x88,
    DUP10: 0x89,
    DUP11: 0x8A,
    DUP12: 0x8B,
    DUP13: 0x8C,
    DUP14: 0x8D,
    DUP15: 0x8E,
    DUP16: 0x8F,

    // 0x90 range
    SWAP1: 0x90,
    SWAP2: 0x91,
    SWAP3: 0x92,
    SWAP4: 0x93,
    SWAP5: 0x94,
    SWAP6: 0x95,
    SWAP7: 0x96,
    SWAP8: 0x97,
    SWAP9: 0x98,
    SWAP10: 0x99,
    SWAP11: 0x9A,
    SWAP12: 0x9B,
    SWAP13: 0x9C,
    SWAP14: 0x9D,
    SWAP15: 0x9E,
    SWAP16: 0x9F,

    // 0xA0
    LOG0: 0xA0,
    LOG1: 0xA1,
    LOG2: 0xA2,
    LOG3: 0xA3,
    LOG4: 0xA4,

    // 0xF0
    CREATE: 0xF0,
    CALL: 0xF1,
    CALLCODE: 0xF2,
    RETURN: 0xF3,

    // 0xFF range - other
    SUICIDE: 0xFF
};

var opcodeNames = {

    // 0x0
    0: "STOP",
    1: "ADD",
    2: "MUL",
    3: "SUB",
    4: "DIV",
    5: "SDIV",
    6: "MOD",
    7: "SMOD",
    8: "ADDMOD",
    9: "MULMOD",
    10: "EXP",
    11: "SIGNEXTEND",

    //0x10
    16: "LT",
    17: "GT",
    18: "GT",
    19: "SLT",
    20: "SGT",
    21: "ISZERO",
    22: "AND",
    23: "OR",
    24: "XOR",
    25: "NOT",
    26: "BYTE",

    // 0x20
    32: "SHA3",

    // 0x30
    48: "ADDRESS",
    49: "BALANCE",
    50: "ORIGIN",
    51: "CALLER",
    52: "CALLVALUE",
    53: "CALLDATALOAD",
    54: "CALLDATASIZE",
    55: "CALLDATACOPY",
    56: "CODESIZE",
    57: "CODECOPY",
    58: "GASPRICE",
    59: "EXTCODESIZE",
    60: "EXTCODECOPY",

    // 0x40 range - block operations
    64: "BLOCKHASH",
    65: "COINBASE",
    66: "TIMESTAMP",
    67: "NUMBER",
    68: "DIFFICULTY",
    69: "GASLIMIT",

    // 0x50 range - 'storage' and execution
    80: "POP",
    81: "MLOAD",
    82: "MSTORE",
    83: "MSTORE8",
    84: "SLOAD",
    85: "SSTORE",
    86: "JUMP",
    87: "JUMPI",
    88: "PC",
    89: "MSIZE",
    90: "GAS",
    91: "JUMPDEST",

    // 0x60 range
    96: "PUSH1",
    97: "PUSH2",
    98: "PUSH3",
    99: "PUSH4",
    100: "PUSH5",
    101: "PUSH6",
    102: "PUSH7",
    103: "PUSH8",
    104: "PUSH9",
    105: "PUSH10",
    106: "PUSH11",
    107: "PUSH12",
    108: "PUSH13",
    109: "PUSH14",
    110: "PUSH15",
    111: "PUSH16",

    // 0x70 range
    112: "PUSH17",
    113: "PUSH18",
    114: "PUSH19",
    115: "PUSH20",
    116: "PUSH21",
    117: "PUSH22",
    118: "PUSH23",
    119: "PUSH24",
    120: "PUSH25",
    121: "PUSH26",
    122: "PUSH27",
    123: "PUSH28",
    124: "PUSH29",
    125: "PUSH30",
    126: "PUSH31",
    127: "PUSH32",

    // 0x80 range
    128: "DUP1",
    129: "DUP2",
    130: "DUP3",
    131: "DUP4",
    132: "DUP5",
    133: "DUP6",
    134: "DUP7",
    135: "DUP8",
    136: "DUP9",
    137: "DUP10",
    138: "DUP11",
    139: "DUP12",
    140: "DUP13",
    141: "DUP14",
    142: "DUP15",
    143: "DUP16",

    // 0x90 range
    144: "SWAP1",
    145: "SWAP2",
    146: "SWAP3",
    147: "SWAP4",
    148: "SWAP5",
    149: "SWAP6",
    150: "SWAP7",
    151: "SWAP8",
    152: "SWAP9",
    153: "SWAP10",
    154: "SWAP11",
    155: "SWAP12",
    156: "SWAP13",
    157: "SWAP14",
    158: "SWAP15",
    159: "SWAP16",

    // 0xA0
    160: "LOG0",
    161: "LOG1",
    162: "LOG2",
    163: "LOG3",
    164: "LOG4",

    // 0xF0
    240: "CREATE",
    241: "CALL",
    242: "CALLCODE",
    243: "RETURN",

    // 0xFF range - other
    255: "SUICIDE"
};

exports.opcodes = opcodes;
exports.opcodeNames = opcodeNames;

exports.getOpcode = function(opcodeName){
    if(opcodeName === "TXGASPRICE"){
        opcodeName = "GASPRICE"
    }
    return opcodes[opcodeName];
};

exports.getOpcodeName = function(opcode){
    return opcodeNames[opcode];
};

exports.isPush = function(opcode){
    return opcode >= 96 && opcode <= 127;
};