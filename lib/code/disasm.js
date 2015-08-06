var opcodes = require("./opcodes");

exports.disasm = disasm;

var push0 = opcodes.getOpcode("PUSH1");

function disasm(code) {
    var buf = new Buffer(code, "hex");
    var out = [];
    for(var pc = 0; pc < buf.length; pc++) {
        var op = buf[pc];
        out.push(opcodes.getOpcodeName(op));
        if(opcodes.isPush(op)){
            var a = op - push0 + 1;
            out.push(buf.slice(pc + 1, pc + 1 + a).toString('hex').toUpperCase());
            pc += a;
        }
    }
    return out;
}