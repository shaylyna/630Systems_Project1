/// <reference path="node.d.ts" />
function readNull(bytecode, ptr, level) {
    console.log(Array(level).join('\t') + 'Null');
    var obj = null;
    return [ptr, obj];
}

function readNone(bytecode, ptr, level) {
    console.log(Array(level).join('\t') + 'None');
    var obj = 'None';
    return [ptr, obj];
}

function readFalse(bytecode, ptr, level) {
    console.log(Array(level).join('\t') + 'False');
    var obj = false;
    return [ptr, obj];
}

function readTrue(bytecode, ptr, level) {
    console.log(Array(level).join('\t') + 'True');
    var obj = true;
    return [ptr, obj];
}

function readStopIter(bytecode, ptr, level) {
    console.log(Array(level).join('\t') + 'StopIteration');
    var obj = 'StopIteration';
    return [ptr, obj];
}

function readEllipsis(bytecode, ptr, level) {
    console.log(Array(level).join('\t') + 'Ellipsis');
    var obj = 'Ellipsis';
    return [ptr, obj];
}

function readInt32(bytecode, ptr, level) {
    var obj = bytecode.readUInt32LE(ptr);
    console.log(Array(level).join('\t') + obj);
    return [ptr + 4, obj];
}

function readInt64(bytecode, ptr, level) {
    console.log('Int64 Not implemented yet!');
    var obj = 'Int64 Not implemented yet!';
    return [ptr + 8, obj];
}

function readFloat32(bytecode, ptr, level) {
    console.log('Float32 Not implemented yet!');
    var obj = 'Float32 Not implemented yet!';
    return [ptr + 4, obj];
}

function readFloat64(bytecode, ptr, level) {
    console.log('Float64 Not implemented yet!');
    var obj = 'Float64 Not implemented yet!';
    return [ptr + 8, obj];
}

function readComplex32(bytecode, ptr, level) {
    console.log('Complex32 Not implemented yet!');
    var obj = 'Complex32 Not implemented yet!';
    return [ptr + 4, obj];
}

function readComplex64(bytecode, ptr, level) {
    console.log('Complex64 Not implemented yet!');
    var obj = 'Complex64 Not implemented yet!';
    return [ptr + 8, obj];
}

function readLong(bytecode, ptr, level) {
    console.log('Long Not implemented yet!');
    var obj = 'Long Not implemented yet!';
    return [ptr + 4, obj];
}

function readString(bytecode, ptr, level) {
    var obj = '';
    var size = bytecode.readUInt32LE(ptr);
    for (var j = 0; j < size; j++) {
        obj = obj + bytecode.toString('ascii', ptr + 4 + j, ptr + 4 + j + 1);
    }
    console.log(Array(level).join('\t') + obj);
    return [ptr + 4 + size, obj];
}

function readStringInterned(bytecode, ptr, level) {
    var obj = '';
    var size = bytecode.readUInt32LE(ptr);
    for (var j = 0; j < size; j++) {
        obj = obj + bytecode.toString('ascii', ptr + 4 + j, ptr + 4 + j + 1);
    }
    console.log(Array(level).join('\t') + '(interned)' + obj);
    byteObject.interned_list.push(obj);
    return [ptr + 4 + size, obj];
}

function readStringRef(bytecode, ptr, level) {
    var obj = bytecode.readUInt32LE(ptr);
    console.log(Array(level).join('\t') + 'ref to interned string in position ' + obj);
    return [ptr + 4, obj];
}

function readUnicode(bytecode, ptr, level) {
    var obj = '';
    var size = bytecode.readUInt32LE(ptr);
    for (var j = 0; j < size; j++) {
        obj = obj + bytecode.toString('utf8', ptr + 4 + j, ptr + 4 + j + 1);
    }
    console.log(Array(level).join('\t') + obj);
    return [ptr + 4 + size, obj];
}

function readDict(bytecode, ptr, level) {
    console.log('readDict Not implemented yet! You are screwed');
    var obj = 'readDict Not implemented yet! You are screwed';
    return [ptr + 4, obj];
}

function readTuple(bytecode, ptr, level) {
    var obj = [];
    var prefix = Array(level).join('\t');
    var nobjs = bytecode.readUInt32LE(ptr);
    process.stdout.write(' (' + String(nobjs) + ')\n');
    level = level + 1;
    ptr = ptr + 4;
    for (var j = 0; j < nobjs; j++) {
        var type = bytecode.toString('ascii', ptr, ptr + 1);
        if (type in readByType) {
            var out = readByType[type](bytecode, ptr + 1, level);
            ptr = out[0];
            obj[j] = out[1];
        } else {
            ptr = ptr + 1;
        }
    }
    return [ptr, obj];
}

function readCodeObject(bytecode, ptr, level) {
    console.log(Array(level).join('\t') + 'code object:');
    var obj = {};
    var out = [];

    level = level + 1;
    var prefix = Array(level).join('\t');

    obj.argcount = bytecode.readUInt32LE(ptr);
    ptr = ptr + 4;
    console.log(prefix + 'argcount:\n' + prefix + String(obj.argcount));

    obj.nlocals = bytecode.readUInt32LE(ptr);
    ptr = ptr + 4;
    console.log(prefix + 'nlocals:\n' + prefix + String(obj.nlocals));

    obj.stacksize = bytecode.readUInt32LE(ptr);
    ptr = ptr + 4;
    console.log(prefix + 'stacksize:\n' + prefix + String(obj.stacksize));

    obj.flags = bytecode.readUInt32LE(ptr);
    ptr = ptr + 4;
    console.log(prefix + 'flags:\n' + prefix + String(obj.flags));

    var type = bytecode.toString('ascii', ptr, ptr + 1);
    ptr = ptr + 1; // should be 's'
    var codelen = bytecode.readUInt32LE(ptr);
    ptr = ptr + 4;

    // Start Reading Op Codes
    obj.code = [];
    console.log(prefix + 'code: (' + String(codelen) + ')');
    var colon = ': ';
    if (codelen > 9) {
        colon = ':  ';
    }
    var ptr0 = ptr;
    while (ptr < ptr0 + codelen) {
        if (ptr - ptr0 > 9) {
            colon = ': ';
        }
        var opcode = bytecode.readUInt8(ptr);
        var logout = '\t' + String(ptr - ptr0) + colon + String(opcode);
        if (opcode >= 90) {
            var arg = bytecode.readUInt16LE(ptr + 1);
            if (opcode > 99) {
                logout = logout + ' (' + String(arg) + ')';
            } else {
                logout = logout + '  (' + String(arg) + ')';
            }
            ptr = ptr + 3;
            obj.code.push([opcode, arg]);
        } else {
            ptr = ptr + 1;
            obj.code.push([opcode, null]);
        }
        console.log(prefix + logout);
    }

    // Start Reading Tuple of Constants
    process.stdout.write(prefix + 'consts:');
    out = readTuple(bytecode, ptr + 1, level);
    ptr = out[0];
    obj.consts = out[1];

    // Start Reading Tuple of Names
    process.stdout.write(prefix + 'names:');
    out = readTuple(bytecode, ptr + 1, level);
    ptr = out[0];
    obj.names = out[1];

    // Start Reading Tuple of Variable Names
    process.stdout.write(prefix + 'varnames:');
    out = readTuple(bytecode, ptr + 1, level);
    ptr = out[0];
    obj.varnames = out[1];

    // Start Reading Tuple of Free Variables
    process.stdout.write(prefix + 'freevars:');
    out = readTuple(bytecode, ptr + 1, level);
    ptr = out[0];
    obj.freevars = out[1];

    // Start Reading Tuple of Variables Used in Nested Functions
    process.stdout.write(prefix + 'cellvars:');
    out = readTuple(bytecode, ptr + 1, level);
    ptr = out[0];
    obj.cellvars = out[1];

    // Read Filename
    console.log(prefix + 'filename:');
    type = bytecode.toString('ascii', ptr, ptr + 1);
    if (type in readByType) {
        out = readByType[type](bytecode, ptr + 1, level);
        ptr = out[0];
        obj.filename = out[1];
    } else {
        ptr = ptr + 1;
    }

    // Read Function Name
    console.log(prefix + 'name:');
    type = bytecode.toString('ascii', ptr, ptr + 1);
    if (type in readByType) {
        out = readByType[type](bytecode, ptr + 1, level);
        ptr = out[0];
        obj.name = out[1];
    } else {
        ptr = ptr + 1;
    }

    // Read First Line Number
    console.log(prefix + 'firstlineno:');
    out = readByType['i'](bytecode, ptr, level);
    ptr = out[0];
    obj.firstlineno = out[1];

    // Read Line Number Tab: http://nedbatchelder.com/blog/200804/wicked_hack_python_bytecode_tracing.html
    obj.lnotab = [];
    ptr = ptr + 1; // skipping the 's' byte
    var npairs = bytecode.readUInt32LE(ptr) / 2;
    ptr = ptr + 4;
    console.log(prefix + 'lnotab: (' + String(npairs) + ')');
    for (var j = 0; j < npairs; j++) {
        var byteDelta = bytecode.readUInt8(ptr);
        ptr = ptr + 1;
        var lineDelta = bytecode.readUInt8(ptr);
        ptr = ptr + 1;
        console.log(prefix + '('.concat(String(byteDelta), ',', String(lineDelta), ')'));
        obj.lnotab.push([byteDelta, lineDelta]);
    }

    return [ptr, obj];
}

//Implemented bytecode functions in a OpCode class
var OpCodeFunctions = (function () {
    function OpCodeFunctions() {
    }
    OpCodeFunctions.STOP_CODE = function () {
        //do nothing
        console.log('STOP_CODE');
    };
    OpCodeFunctions.POP_TOP = function () {
        console.log('POP_TOP');
        return Stack.pop();
    };
    OpCodeFunctions.ROT_TWO = function () {
        console.log('ROT_TWO');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();
        Stack.push(TOS);
        Stack.push(TOS1);
    };
    OpCodeFunctions.ROT_THREE = function () {
        console.log('ROT_THREE');
        var TOS = Stack.pop();
        var TOS2 = Stack.pop();
        var TOS3 = Stack.pop();
        Stack.push(TOS);
        Stack.push(TOS3);
        Stack.push(TOS2);
    };
    OpCodeFunctions.DUP_TOP = function () {
        console.log('DUP_TOP');
        var TOS = Stack.pop();
        Stack.push(TOS);
        Stack.push(TOS);
    };
    OpCodeFunctions.ROT_FOUR = function () {
        console.log('ROT_FOUR');
        console.log('ROT_THREE');
        var TOS = Stack.pop();
        var TOS2 = Stack.pop();
        var TOS3 = Stack.pop();
        var TOS4 = Stack.pop();
        Stack.push(TOS);
        Stack.push(TOS4);
        Stack.push(TOS3);
        Stack.push(TOS2);
    };
    OpCodeFunctions.NOP = function () {
        console.log('NOP');
    };
    OpCodeFunctions.UNARY_POSITIVE = function () {
        console.log('UNARY_POSITIVE');
        var TOS = Stack.pop();
        TOS = +TOS;
        Stack.push(TOS);
    };
    OpCodeFunctions.UNARY_NEGATIVE = function () {
        console.log('UNARY_NEGATIVE');
        var TOS = Stack.pop();
        TOS = -TOS;
        Stack.push(TOS);
    };
    OpCodeFunctions.UNARY_NOT = function () {
        console.log('UNARY_NOT');
        var TOS = Stack.pop();
        TOS = !TOS;
        Stack.push(TOS);
    };
    OpCodeFunctions.UNARY_CONVERT = function () {
        console.log('UNARY_CONVERT');
        var TOS = Stack.pop();
        TOS = String(TOS); // Not completely accurate
        Stack.push(TOS);
    };
    OpCodeFunctions.UNARY_INVERT = function () {
        console.log('UNARY_INVERT');
        var TOS = Stack.pop();
        TOS = ~TOS;
        Stack.push(TOS);
    };
    OpCodeFunctions.BINARY_POWER = function () {
        console.log('BINARY_POWER');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();
        TOS = Math.pow(TOS1, TOS);
        Stack.push(TOS);
    };

    //implements TOS = TOS1 * TOS
    OpCodeFunctions.BINARY_MULTIPLY = function () {
        console.log('BINARY_MULTIPY');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();
        Stack.push(TOS1 * TOS);
    };

    //implements TOS = TOS1/TOS (without from_future_import division)
    OpCodeFunctions.BINARY_DIVIDE = function () {
        console.log('BINARY_DIVIDE');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();

        //*** need to make this so floors ints & longs but gives approx with floats or complex ***/
        Stack.push(TOS1 / TOS);
    };

    //implements TOS = TOS1 % TOS
    OpCodeFunctions.BINARY_MODULO = function () {
        console.log('BINARY_MODULO');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();
        Stack.push(TOS1 % TOS);
    };

    //implemsnts TOS = TOS1 + TOS
    OpCodeFunctions.BINARY_ADD = function () {
        console.log('BINARY_ADD');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();
        Stack.push(TOS1 + TOS);
    };

    //implements TOS = TOS1 - TOS
    OpCodeFunctions.BINARY_SUBTRACT = function () {
        console.log('BINARY_SUBTRACT');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();
        Stack.push(TOS1 - TOS);
    };

    //implements TOS = TOS1[TOS]
    OpCodeFunctions.BINARY_SUBSCR = function () {
        console.log('BINARY_SUBSCR');
    };

    //implements TOS = TOS1 // TOS
    OpCodeFunctions.BINARY_FLOOR_DIVIDE = function () {
        console.log('BINARY_FLOOR_DIVIDE');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();
        Stack.push(Math.floor(TOS1 / TOS));
    };

    //implements TOS = TOS1/TOS (with from_future_import division)
    OpCodeFunctions.BINARY_TRUE_DIVIDE = function () {
        console.log('BINARY_TRUE_DIVIDE');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();
        Stack.push(TOS1 / TOS);
    };

    //DIFFERENCE OF THESE FROM BINARY?
    OpCodeFunctions.INPLACE_FLOOR_DIVIDE = function () {
        console.log('INPLACE_FLOOR_DIVIDE');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();
        Stack.push(Math.floor(TOS1 / TOS));
    };

    //with from_future_import division
    OpCodeFunctions.INPLACE_TRUE_DIVIDE = function () {
        console.log('INPLACE_TRUE_DIVIDE');
        var TOS = Stack.pop();
        var TOS1 = Stack.pop();
        Stack.push(TOS1 / TOS);
    };
    OpCodeFunctions.SLICE = function () {
    };
    OpCodeFunctions.STORE_SLICE = function () {
    };
    OpCodeFunctions.DELETE_SLICE = function () {
    };
    OpCodeFunctions.STORE_MAP = function () {
    };
    OpCodeFunctions.INPLACE_ADD = function () {
    };
    OpCodeFunctions.INPLACE_SUBTRACT = function () {
    };
    OpCodeFunctions.INPLACE_MULTIPY = function () {
    };
    OpCodeFunctions.INPLACE_DIVIDE = function () {
    };
    OpCodeFunctions.INPLACE_MODULO = function () {
    };
    OpCodeFunctions.STORE_SUBSCR = function () {
    };
    OpCodeFunctions.DELETE_SUBSCR = function () {
    };
    OpCodeFunctions.BINARY_LSHIFT = function () {
    };
    OpCodeFunctions.BINARY_RSHIFT = function () {
    };
    OpCodeFunctions.BINARY_AND = function () {
    };
    OpCodeFunctions.BINARY_XOR = function () {
    };
    OpCodeFunctions.BINARY_OR = function () {
    };
    OpCodeFunctions.INPLACE_POWER = function () {
    };
    OpCodeFunctions.GET_ITER = function () {
        console.log('GET_ITER'); // Objects already iterable?
    };
    OpCodeFunctions.PRINT_EXPR = function () {
    };
    OpCodeFunctions.PRINT_ITEM = function () {
        console.log('PRINT_ITEM');
        var TOS = Stack.pop();
        console.log(TOS);
        Stack.push(TOS);
    };
    OpCodeFunctions.PRINT_NEWLINE = function () {
        console.log('PRINT_NEWLINE');
        console.log('\n');
    };
    OpCodeFunctions.PRINT_ITEM_TO = function () {
    };
    OpCodeFunctions.PRINT_NEWLINE_TO = function () {
    };
    OpCodeFunctions.INPLACE_LSHIFT = function () {
    };
    OpCodeFunctions.INPLACE_RSHIFT = function () {
    };
    OpCodeFunctions.INPLACE_AND = function () {
    };
    OpCodeFunctions.INPLACE_XOR = function () {
    };
    OpCodeFunctions.INPLACE_OR = function () {
    };
    OpCodeFunctions.BREAK_LOOP = function () {
    };
    OpCodeFunctions.WITH_CLEANUP = function () {
    };
    OpCodeFunctions.LOAD_LOCALS = function () {
    };
    OpCodeFunctions.RETURN_VALUE = function () {
    };
    OpCodeFunctions.IMPORT_STAR = function () {
    };
    OpCodeFunctions.EXEC_STMT = function () {
    };
    OpCodeFunctions.YIELD_VALUE = function () {
    };
    OpCodeFunctions.POP_BLOCK = function () {
    };
    OpCodeFunctions.END_FINALLY = function () {
    };
    OpCodeFunctions.BUILD_CLASS = function () {
    };

    //Opcodes from here have an argument
    OpCodeFunctions.STORE_NAME = function (index) {
    };
    OpCodeFunctions.DELETE_NAME = function (index) {
    };
    OpCodeFunctions.UNPACK_SEQUENCE = function (numItems) {
    };
    OpCodeFunctions.FOR_ITER = function (incrCounter) {
    };
    OpCodeFunctions.LIST_APPEND = function (value) {
    };
    OpCodeFunctions.STORE_ATTR = function (index) {
    };
    OpCodeFunctions.DELETE_ATTR = function (index) {
    };
    OpCodeFunctions.STORE_GLOBAL = function (index) {
    };
    OpCodeFunctions.DELETE_GLOBAL = function (index) {
    };
    OpCodeFunctions.DUP_TOPX = function (numItemsDup) {
    };
    OpCodeFunctions.LOAD_CONST = function (index) {
    };
    OpCodeFunctions.LOAD_NAME = function (index) {
    };
    OpCodeFunctions.BUILD_TUPLE = function (numItems) {
    };
    OpCodeFunctions.BUILD_LIST = function (numItems) {
    };
    OpCodeFunctions.BUILD_SET = function (numItems) {
    };
    OpCodeFunctions.BUILD_MAP = function (numEntries) {
    };
    OpCodeFunctions.LOAD_ATTR = function (index) {
    };
    OpCodeFunctions.COMPARE_OP = function (opname) {
    };
    OpCodeFunctions.IMPORT_NAME = function (index) {
    };
    OpCodeFunctions.IMPORT_FROM = function (index) {
    };
    OpCodeFunctions.JUMP_FORWARD = function (numBytes) {
    };
    OpCodeFunctions.JUMP_IF_FALSE_OR_POP = function (offest) {
    };
    OpCodeFunctions.JUMP_IF_TRUE_OR_POP = function (offset) {
    };
    OpCodeFunctions.JUMP_ABSOLUTE = function (offset) {
    };
    OpCodeFunctions.POP_JUMP_IF_FALSE = function (offset) {
    };
    OpCodeFunctions.POP_JUMP_IF_TRUE = function (offset) {
    };
    OpCodeFunctions.LOAD_GLOBAL = function (index) {
    };
    OpCodeFunctions.CONTINUE_LOOP = function (start) {
    };
    OpCodeFunctions.SETUP_LOOP = function (addr) {
    };
    OpCodeFunctions.SETUP_EXCEPT = function (addr) {
    };
    OpCodeFunctions.SETUP_FINALLY = function (addr) {
    };
    OpCodeFunctions.LOAD_FAST = function (varNum) {
    };
    OpCodeFunctions.STORE_FAST = function (varNum) {
    };
    OpCodeFunctions.DELETE_FAST = function (varNum) {
    };
    OpCodeFunctions.RAISE_VARARGS = function (numArg) {
    };

    /* CALL_FUNCTION_XXX opcodes defined below depend on this definition */
    OpCodeFunctions.CALL_FUNCTION = function (arg) {
    };
    OpCodeFunctions.MAKE_FUNCTION = function (numDefaults) {
    };
    OpCodeFunctions.BUILD_SLICE = function (numItems) {
    };
    OpCodeFunctions.MAKE_CLOSURE = function (numFreeVars) {
    };
    OpCodeFunctions.LOAD_CLOSURE = function (index) {
    };
    OpCodeFunctions.LOAD_DEREF = function (index) {
    };
    OpCodeFunctions.STORE_DEREF = function (index) {
    };

    /* The next 3 opcodes must be contiguous and satisfy
    (CALL_FUNCTION_VAR - CALL_FUNCTION) & 3 == 1  */
    OpCodeFunctions.CALL_FUNCTION_VAR = function (argc) {
    };
    OpCodeFunctions.CALL_FUNCTION_KW = function (argc) {
    };
    OpCodeFunctions.CALL_FUNCTION_VAR_KW = function (argc) {
    };
    OpCodeFunctions.SETUP_WITH = function (delta) {
    };

    /* Support for opargs more than 16 bits long */
    OpCodeFunctions.EXTENDED_ARG = function (ext) {
    };

    /***** have to determine what type of arguments these take *****/
    OpCodeFunctions.SET_ADD = function () {
    };
    OpCodeFunctions.MAP_ADD = function () {
    };
    return OpCodeFunctions;
})();
function parseBytecode(bytecode) {
    var len = bytecode.length;

    var magic_number = '';
    for (var j = 0; j < 4; j++) {
        magic_number = magic_number + String(bytecode.readUInt8(j));
    }
    console.log('magic number: ' + magic_number);
    byteObject.magic_number = magic_number;

    var time_stamp = '';
    for (j = 4; j < 8; j++) {
        time_stamp = time_stamp + String(bytecode.readUInt8(j));
    }
    console.log('time stamp: ' + time_stamp);
    byteObject.time_stamp = time_stamp;

    // Check Magic Number Against Python 2.7 (03f3 0d0a)
    var my_version = '32431310';
    for (var j = 0; j < 4; j++) {
        if (magic_number[j] != my_version[j]) {
            console.log('Not right version!');
            // exit program
        }
    }

    // Initialize Interned List
    byteObject.interned_list = [];

    // Start Parsing Bytecode
    var ptr = 8;
    while (ptr < len) {
        var type = bytecode.toString('ascii', ptr, ptr + 1);
        if (type in readByType) {
            var out = readByType[type](bytecode, ptr + 1, 1);
            ptr = out[0];
            byteObject.code_object = out[1];
        } else {
            ptr = ptr + 1;
        }
    }
}

function interpretBytecode(bytecode) {
    // Parse Bytecode and Return Op Codes:
    // http://daeken.com/2010-02-20_Python_Marshal_Format.html
    // http://nedbatchelder.com/blog/200804/the_structure_of_pyc_files.html
    parseBytecode(bytecode);

    // console.log(byteObject);
    // console.log(byteObject.code_object.code);
    // console.log(byteObject.code_object.code[0]);
    // console.log(byteObject.code_object.consts[0]);
    console.log(byteObject.interned_list);
    // Execute Op Codes
}

//initalize object to store information of various types
var byteObject = {};

//initalize the stack object
var Stack = [];

var readByType = {};
readByType['0'] = readNull;
readByType['N'] = readNone;
readByType['F'] = readFalse;
readByType['T'] = readTrue;
readByType['S'] = readStopIter;
readByType['.'] = readEllipsis;
readByType['i'] = readInt32;
readByType['I'] = readInt64;
readByType['f'] = readFloat32;
readByType['g'] = readFloat64;
readByType['x'] = readComplex32;
readByType['y'] = readComplex64;
readByType['l'] = readLong;
readByType['s'] = readString;
readByType['t'] = readStringInterned;
readByType['R'] = readStringRef;
readByType['u'] = readUnicode;
readByType['('] = readTuple;
readByType['['] = readTuple;
readByType['{'] = readDict;
readByType['>'] = readTuple;
readByType['c'] = readCodeObject;

//https://android.googlesource.com/platform/prebuilts/python/darwin-x86/2.7.5/+/master/include/python2.7/opcode.h
//enum list of all opcodes
var OpCodeList = new Enum({
    STOP_CODE: 0,
    POP_TOP: 1,
    ROT_TWO: 2,
    ROT_THREE: 3,
    DUP_TOP: 4,
    ROT_FOUR: 5,
    NOP: 9,
    UNARY_POSITIVE: 10,
    UNARY_NEGATIVE: 11,
    UNARY_NOT: 12,
    UNARY_CONVERT: 13,
    UNARY_INVERT: 15,
    BINARY_POWER: 19,
    BINARY_MULTIPLY: 20,
    BINARY_DIVIDE: 21,
    BINARY_MODULO: 22,
    BINARY_ADD: 23,
    BINARY_SUBTRACT: 24,
    BINARY_SUBSCR: 25,
    BINARY_FLOOR_DIVIDE: 26,
    BINARY_TRUE_DIVIDE: 27,
    INPLACE_FLOOR_DIVIDE: 28,
    INPLACE_TRUE_DIVIDE: 29,
    SLICE: 30,
    //SLICE:31,
    //SLICE:32,
    //SLICE:33,
    STORE_SLICE: 40,
    //STORE_SLICE:41,
    //STORE_SLICE:42,
    // STORE_SLICE:43,
    DELETE_SLICE: 50,
    // DELETE_SLICE:51,
    //DELETE_SLICE:52,
    //DELETE_SLICE:53,
    STORE_MAP: 54,
    INPLACE_ADD: 55,
    INPLACE_SUBTRACT: 56,
    INPLACE_MULTIPY: 57,
    INPLACE_DIVIDE: 58,
    INPLACE_MODULO: 59,
    STORE_SUBSCR: 60,
    DELETE_SUBSCR: 61,
    BINARY_LSHIFT: 62,
    BINARY_RSHIFT: 63,
    BINARY_AND: 64,
    BINARY_XOR: 65,
    BINARY_OR: 66,
    INPLACE_POWER: 67,
    GET_ITER: 68,
    PRINT_EXPR: 70,
    PRINT_ITEM: 71,
    PRINT_NEWLINE: 72,
    RINT_ITEM_TO: 73,
    PRINT_NEWLINE_TO: 74,
    INPLACE_LSHIFT: 75,
    INPLACE_RSHIFT: 76,
    INPLACE_AND: 77,
    INPLACE_XOR: 78,
    INPLACE_OR: 79,
    BREAK_LOOP: 80,
    WITH_CLEANUP: 81,
    LOAD_LOCALS: 82,
    RETURN_VALUE: 83,
    IMPORT_STAR: 84,
    EXEC_STMT: 85,
    YIELD_VALUE: 86,
    POP_BLOCK: 87,
    END_FINALLY: 88,
    BUILD_CLASS: 89,
    //Opcodes from here have an argument HAVE_ARGUMENT 90
    STORE_NAME: 90,
    DELETE_NAME: 91,
    UNPACK_SEQUENCE: 92,
    FOR_ITER: 93,
    LIST_APPEND: 94,
    STORE_ATTR: 95,
    DELETE_ATTR: 96,
    STORE_GLOBAL: 97,
    DELETE_GLOBAL: 98,
    DUP_TOPX: 99,
    LOAD_CONST: 100,
    LOAD_NAME: 101,
    BUILD_TUPLE: 102,
    BUILD_LIST: 103,
    BUILD_SET: 104,
    BUILD_MAP: 105,
    LOAD_ATTR: 106,
    COMPARE_OP: 107,
    IMPORT_NAME: 108,
    IMPORT_FROM: 109,
    JUMP_FORWARD: 110,
    JUMP_IF_FALSE_OR_POP: 111,
    JUMP_IF_TRUE_OR_POP: 112,
    JUMP_ABSOLUTE: 113,
    POP_JUMP_IF_FALSE: 114,
    POP_JUMP_IF_TRUE: 115,
    LOAD_GLOBAL: 116,
    CONTINUE_LOOP: 119,
    SETUP_LOOP: 120,
    SETUP_EXCEPT: 121,
    SETUP_FINALLY: 122,
    LOAD_FAST: 124,
    STORE_FAST: 125,
    DELETE_FAST: 126,
    RAISE_VARARGS: 130,
    /* CALL_FUNCTION_XXX opcodes defined below depend on this definition */
    CALL_FUNCTION: 131,
    MAKE_FUNCTION: 132,
    BUILD_SLICE: 133,
    MAKE_CLOSURE: 134,
    LOAD_CLOSURE: 135,
    LOAD_DEREF: 136,
    STORE_DEREF: 137,
    /* The next 3 opcodes must be contiguous and satisfy
    (CALL_FUNCTION_VAR - CALL_FUNCTION) & 3 == 1  */
    CALL_FUNCTION_VAR: 140,
    CALL_FUNCTION_KW: 141,
    CALL_FUNCTION_VAR_KW: 142,
    SETUP_WITH: 143,
    /* Support for opargs more than 16 bits long */
    EXTENDED_ARG: 145,
    SET_ADD: 146,
    MAP_ADD: 147
});

var fs = require('fs');
var Enum = require('enum');
fs.readFile(process.argv[2], function doneReading(err, bytecode) {
    if (err)
        throw err;
    interpretBytecode(bytecode);
});
