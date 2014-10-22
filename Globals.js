/// <reference path="Parsers.ts" />
/// <reference path="Log.ts" />
/// <reference path="Built_Ins.ts" />
// Assume verbose output requested
var isVerbose = true;

// Initalize the stack object
var Stack = [];

// Initalize object to store information of various types
var byteObject = {};

// Dictionary of potential types to be read
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

// Enum list of all opcodes
var OpCodeList;
(function (OpCodeList) {
    OpCodeList[OpCodeList["STOP_CODE"] = 0] = "STOP_CODE";
    OpCodeList[OpCodeList["POP_TOP"] = 1] = "POP_TOP";
    OpCodeList[OpCodeList["ROT_TWO"] = 2] = "ROT_TWO";
    OpCodeList[OpCodeList["ROT_THREE"] = 3] = "ROT_THREE";
    OpCodeList[OpCodeList["DUP_TOP"] = 4] = "DUP_TOP";
    OpCodeList[OpCodeList["ROT_FOUR"] = 5] = "ROT_FOUR";
    OpCodeList[OpCodeList["NOP"] = 9] = "NOP";
    OpCodeList[OpCodeList["UNARY_POSITIVE"] = 10] = "UNARY_POSITIVE";
    OpCodeList[OpCodeList["UNARY_NEGATIVE"] = 11] = "UNARY_NEGATIVE";
    OpCodeList[OpCodeList["UNARY_NOT"] = 12] = "UNARY_NOT";
    OpCodeList[OpCodeList["UNARY_CONVERT"] = 13] = "UNARY_CONVERT";
    OpCodeList[OpCodeList["UNARY_INVERT"] = 15] = "UNARY_INVERT";
    OpCodeList[OpCodeList["BINARY_POWER"] = 19] = "BINARY_POWER";
    OpCodeList[OpCodeList["BINARY_MULTIPLY"] = 20] = "BINARY_MULTIPLY";
    OpCodeList[OpCodeList["BINARY_DIVIDE"] = 21] = "BINARY_DIVIDE";
    OpCodeList[OpCodeList["BINARY_MODULO"] = 22] = "BINARY_MODULO";
    OpCodeList[OpCodeList["BINARY_ADD"] = 23] = "BINARY_ADD";
    OpCodeList[OpCodeList["BINARY_SUBTRACT"] = 24] = "BINARY_SUBTRACT";
    OpCodeList[OpCodeList["BINARY_SUBSCR"] = 25] = "BINARY_SUBSCR";
    OpCodeList[OpCodeList["BINARY_FLOOR_DIVIDE"] = 26] = "BINARY_FLOOR_DIVIDE";
    OpCodeList[OpCodeList["BINARY_TRUE_DIVIDE"] = 27] = "BINARY_TRUE_DIVIDE";
    OpCodeList[OpCodeList["INPLACE_FLOOR_DIVIDE"] = 28] = "INPLACE_FLOOR_DIVIDE";
    OpCodeList[OpCodeList["INPLACE_TRUE_DIVIDE"] = 29] = "INPLACE_TRUE_DIVIDE";
    OpCodeList[OpCodeList["SLICE_0"] = 30] = "SLICE_0";
    OpCodeList[OpCodeList["SLICE_1"] = 31] = "SLICE_1";
    OpCodeList[OpCodeList["SLICE_2"] = 32] = "SLICE_2";
    OpCodeList[OpCodeList["SLICE_3"] = 33] = "SLICE_3";
    OpCodeList[OpCodeList["STORE_SLICE_0"] = 40] = "STORE_SLICE_0";
    OpCodeList[OpCodeList["STORE_SLICE_1"] = 41] = "STORE_SLICE_1";
    OpCodeList[OpCodeList["STORE_SLICE_2"] = 42] = "STORE_SLICE_2";
    OpCodeList[OpCodeList["STORE_SLICE_3"] = 43] = "STORE_SLICE_3";
    OpCodeList[OpCodeList["DELETE_SLICE_0"] = 50] = "DELETE_SLICE_0";
    OpCodeList[OpCodeList["DELETE_SLICE_1"] = 51] = "DELETE_SLICE_1";
    OpCodeList[OpCodeList["DELETE_SLICE_2"] = 52] = "DELETE_SLICE_2";
    OpCodeList[OpCodeList["DELETE_SLICE_3"] = 53] = "DELETE_SLICE_3";
    OpCodeList[OpCodeList["STORE_MAP"] = 54] = "STORE_MAP";
    OpCodeList[OpCodeList["INPLACE_ADD"] = 55] = "INPLACE_ADD";
    OpCodeList[OpCodeList["INPLACE_SUBTRACT"] = 56] = "INPLACE_SUBTRACT";
    OpCodeList[OpCodeList["INPLACE_MULTIPY"] = 57] = "INPLACE_MULTIPY";
    OpCodeList[OpCodeList["INPLACE_DIVIDE"] = 58] = "INPLACE_DIVIDE";
    OpCodeList[OpCodeList["INPLACE_MODULO"] = 59] = "INPLACE_MODULO";
    OpCodeList[OpCodeList["STORE_SUBSCR"] = 60] = "STORE_SUBSCR";
    OpCodeList[OpCodeList["DELETE_SUBSCR"] = 61] = "DELETE_SUBSCR";
    OpCodeList[OpCodeList["BINARY_LSHIFT"] = 62] = "BINARY_LSHIFT";
    OpCodeList[OpCodeList["BINARY_RSHIFT"] = 63] = "BINARY_RSHIFT";
    OpCodeList[OpCodeList["BINARY_AND"] = 64] = "BINARY_AND";
    OpCodeList[OpCodeList["BINARY_XOR"] = 65] = "BINARY_XOR";
    OpCodeList[OpCodeList["BINARY_OR"] = 66] = "BINARY_OR";
    OpCodeList[OpCodeList["INPLACE_POWER"] = 67] = "INPLACE_POWER";
    OpCodeList[OpCodeList["GET_ITER"] = 68] = "GET_ITER";
    OpCodeList[OpCodeList["PRINT_EXPR"] = 70] = "PRINT_EXPR";
    OpCodeList[OpCodeList["PRINT_ITEM"] = 71] = "PRINT_ITEM";
    OpCodeList[OpCodeList["PRINT_NEWLINE"] = 72] = "PRINT_NEWLINE";
    OpCodeList[OpCodeList["RINT_ITEM_TO"] = 73] = "RINT_ITEM_TO";
    OpCodeList[OpCodeList["PRINT_NEWLINE_TO"] = 74] = "PRINT_NEWLINE_TO";
    OpCodeList[OpCodeList["INPLACE_LSHIFT"] = 75] = "INPLACE_LSHIFT";
    OpCodeList[OpCodeList["INPLACE_RSHIFT"] = 76] = "INPLACE_RSHIFT";
    OpCodeList[OpCodeList["INPLACE_AND"] = 77] = "INPLACE_AND";
    OpCodeList[OpCodeList["INPLACE_XOR"] = 78] = "INPLACE_XOR";
    OpCodeList[OpCodeList["INPLACE_OR"] = 79] = "INPLACE_OR";
    OpCodeList[OpCodeList["BREAK_LOOP"] = 80] = "BREAK_LOOP";
    OpCodeList[OpCodeList["WITH_CLEANUP"] = 81] = "WITH_CLEANUP";
    OpCodeList[OpCodeList["LOAD_LOCALS"] = 82] = "LOAD_LOCALS";
    OpCodeList[OpCodeList["RETURN_VALUE"] = 83] = "RETURN_VALUE";
    OpCodeList[OpCodeList["IMPORT_STAR"] = 84] = "IMPORT_STAR";
    OpCodeList[OpCodeList["EXEC_STMT"] = 85] = "EXEC_STMT";
    OpCodeList[OpCodeList["YIELD_VALUE"] = 86] = "YIELD_VALUE";
    OpCodeList[OpCodeList["POP_BLOCK"] = 87] = "POP_BLOCK";
    OpCodeList[OpCodeList["END_FINALLY"] = 88] = "END_FINALLY";
    OpCodeList[OpCodeList["BUILD_CLASS"] = 89] = "BUILD_CLASS";

    //Opcodes from here have an argument HAVE_ARGUMENT 90
    OpCodeList[OpCodeList["STORE_NAME"] = 90] = "STORE_NAME";
    OpCodeList[OpCodeList["DELETE_NAME"] = 91] = "DELETE_NAME";
    OpCodeList[OpCodeList["UNPACK_SEQUENCE"] = 92] = "UNPACK_SEQUENCE";
    OpCodeList[OpCodeList["FOR_ITER"] = 93] = "FOR_ITER";
    OpCodeList[OpCodeList["LIST_APPEND"] = 94] = "LIST_APPEND";
    OpCodeList[OpCodeList["STORE_ATTR"] = 95] = "STORE_ATTR";
    OpCodeList[OpCodeList["DELETE_ATTR"] = 96] = "DELETE_ATTR";
    OpCodeList[OpCodeList["STORE_GLOBAL"] = 97] = "STORE_GLOBAL";
    OpCodeList[OpCodeList["DELETE_GLOBAL"] = 98] = "DELETE_GLOBAL";
    OpCodeList[OpCodeList["DUP_TOPX"] = 99] = "DUP_TOPX";
    OpCodeList[OpCodeList["LOAD_CONST"] = 100] = "LOAD_CONST";
    OpCodeList[OpCodeList["LOAD_NAME"] = 101] = "LOAD_NAME";
    OpCodeList[OpCodeList["BUILD_TUPLE"] = 102] = "BUILD_TUPLE";
    OpCodeList[OpCodeList["BUILD_LIST"] = 103] = "BUILD_LIST";
    OpCodeList[OpCodeList["BUILD_SET"] = 104] = "BUILD_SET";
    OpCodeList[OpCodeList["BUILD_MAP"] = 105] = "BUILD_MAP";
    OpCodeList[OpCodeList["LOAD_ATTR"] = 106] = "LOAD_ATTR";
    OpCodeList[OpCodeList["COMPARE_OP"] = 107] = "COMPARE_OP";
    OpCodeList[OpCodeList["IMPORT_NAME"] = 108] = "IMPORT_NAME";
    OpCodeList[OpCodeList["IMPORT_FROM"] = 109] = "IMPORT_FROM";
    OpCodeList[OpCodeList["JUMP_FORWARD"] = 110] = "JUMP_FORWARD";
    OpCodeList[OpCodeList["JUMP_IF_FALSE_OR_POP"] = 111] = "JUMP_IF_FALSE_OR_POP";
    OpCodeList[OpCodeList["JUMP_IF_TRUE_OR_POP"] = 112] = "JUMP_IF_TRUE_OR_POP";
    OpCodeList[OpCodeList["JUMP_ABSOLUTE"] = 113] = "JUMP_ABSOLUTE";
    OpCodeList[OpCodeList["POP_JUMP_IF_FALSE"] = 114] = "POP_JUMP_IF_FALSE";
    OpCodeList[OpCodeList["POP_JUMP_IF_TRUE"] = 115] = "POP_JUMP_IF_TRUE";
    OpCodeList[OpCodeList["LOAD_GLOBAL"] = 116] = "LOAD_GLOBAL";
    OpCodeList[OpCodeList["CONTINUE_LOOP"] = 119] = "CONTINUE_LOOP";
    OpCodeList[OpCodeList["SETUP_LOOP"] = 120] = "SETUP_LOOP";
    OpCodeList[OpCodeList["SETUP_EXCEPT"] = 121] = "SETUP_EXCEPT";
    OpCodeList[OpCodeList["SETUP_FINALLY"] = 122] = "SETUP_FINALLY";
    OpCodeList[OpCodeList["LOAD_FAST"] = 124] = "LOAD_FAST";
    OpCodeList[OpCodeList["STORE_FAST"] = 125] = "STORE_FAST";
    OpCodeList[OpCodeList["DELETE_FAST"] = 126] = "DELETE_FAST";
    OpCodeList[OpCodeList["RAISE_VARARGS"] = 130] = "RAISE_VARARGS";

    /* CALL_FUNCTION_XXX opcodes defined below depend on this definition */
    OpCodeList[OpCodeList["CALL_FUNCTION"] = 131] = "CALL_FUNCTION";
    OpCodeList[OpCodeList["MAKE_FUNCTION"] = 132] = "MAKE_FUNCTION";
    OpCodeList[OpCodeList["BUILD_SLICE"] = 133] = "BUILD_SLICE";
    OpCodeList[OpCodeList["MAKE_CLOSURE"] = 134] = "MAKE_CLOSURE";
    OpCodeList[OpCodeList["LOAD_CLOSURE"] = 135] = "LOAD_CLOSURE";
    OpCodeList[OpCodeList["LOAD_DEREF"] = 136] = "LOAD_DEREF";
    OpCodeList[OpCodeList["STORE_DEREF"] = 137] = "STORE_DEREF";

    /* The next 3 opcodes must be contiguous and satisfy
    (CALL_FUNCTION_VAR - CALL_FUNCTION) & 3 == 1  */
    OpCodeList[OpCodeList["CALL_FUNCTION_VAR"] = 140] = "CALL_FUNCTION_VAR";
    OpCodeList[OpCodeList["CALL_FUNCTION_KW"] = 141] = "CALL_FUNCTION_KW";
    OpCodeList[OpCodeList["CALL_FUNCTION_VAR_KW"] = 142] = "CALL_FUNCTION_VAR_KW";
    OpCodeList[OpCodeList["SETUP_WITH"] = 143] = "SETUP_WITH";

    /* Support for opargs more than 16 bits long */
    OpCodeList[OpCodeList["EXTENDED_ARG"] = 145] = "EXTENDED_ARG";
    OpCodeList[OpCodeList["SET_ADD"] = 146] = "SET_ADD";
    OpCodeList[OpCodeList["MAP_ADD"] = 147] = "MAP_ADD";
})(OpCodeList || (OpCodeList = {}));
;

//Dictionary ist of Python built-in functions
var builtIns = {};
builtIns['abs'] = abs;
builtIns['all'] = all;
builtIns['any'] = any;
/*basestring,
bin,
bool,
bytearray,
callable,
chr,
classmethod,
cmp,
compile,
complex,
delattr,
dict,
dir,
divmod,
enumerate,
eval,
execfile,
file,
filter,
float,
format,
frozenset,
getattr,
func_globals,
hashattr,
hash,
help,
hex,
id,
input,
int,
isinstance,
issubclass,
iter,
len,
list,
locals,
long,
map,
max,
memoryview,
min,
next,
object,
oct,
open,
ord,
pow,
print,
property,
range,
raw_input,
reduce,
reload,
repr,
reversed,
round,
set,
setattr,
slice,
sorted,
staticmethod,
str,
sum,
super,
tuple,
type,
unichar,
unicode,
vars,
xrange,
zip,
_import_,
apply,
buffer,
coerce,
intern
};*/
