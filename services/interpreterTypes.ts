export class InterpreterError extends Error {
  constructor(message: string, public lineNumber: number) {
    super(message);
    this.name = 'InterpreterError';
  }
}

export class ProgramStoppedError extends Error {
  constructor() {
    super("Program execution was stopped by the user.");
    this.name = 'ProgramStoppedError';
  }
}

export enum TokenType {
  // Keywords
  MODULE = 'MODULE',
  END_MODULE = 'END_MODULE',
  FUNCTION = 'FUNCTION',
  END_FUNCTION = 'END_FUNCTION',
  CALL = 'CALL',
  RETURN = 'RETURN',
  CONSTANT = 'CONSTANT',
  DECLARE = 'DECLARE',
  INTEGER_TYPE = 'INTEGER_TYPE',
  REAL_TYPE = 'REAL_TYPE',
  STRING_TYPE = 'STRING_TYPE',
  REF = 'REF',
  SET = 'SET',
  DISPLAY = 'DISPLAY',
  INPUT = 'INPUT',
  IF = 'IF',
  THEN = 'THEN',
  ELSE = 'ELSE',
  END_IF = 'END_IF',
  DO = 'DO',
  UNTIL = 'UNTIL',
  WHILE = 'WHILE',
  END_WHILE = 'END_WHILE',
  FOR = 'FOR',
  TO = 'TO',
  END_FOR = 'END_FOR',
  TAP = 'TAP',
  
  // Literals & Identifiers
  IDENTIFIER = 'IDENTIFIER',
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  
  // Operators
  ASSIGN = 'ASSIGN',
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  MULTIPLY = 'MULTIPLY',
  DIVIDE = 'DIVIDE',
  MOD = 'MOD',
  POWER = 'POWER',
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  COMMA = 'COMMA',

  // Relational & Logical
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  LESS = 'LESS',
  LESS_EQUAL = 'LESS_EQUAL',
  GREATER = 'GREATER',
  GREATER_EQUAL = 'GREATER_EQUAL',
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',

  // Misc
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  lineNumber: number;
}

export enum NodeType {
  // Statements
  PROGRAM = 'PROGRAM',
  MODULE_STATEMENT = 'MODULE_STATEMENT',
  FUNCTION_DECLARATION = 'FUNCTION_DECLARATION',
  RETURN_STATEMENT = 'RETURN_STATEMENT',
  CALL_STATEMENT = 'CALL_STATEMENT',
  VARIABLE_DECLARATION = 'VARIABLE_DECLARATION',
  ASSIGNMENT = 'ASSIGNMENT',
  DISPLAY_STATEMENT = 'DISPLAY_STATEMENT',
  INPUT_STATEMENT = 'INPUT_STATEMENT',
  IF_STATEMENT = 'IF_STATEMENT',
  DO_WHILE_STATEMENT = 'DO_WHILE_STATEMENT',
  DO_UNTIL_STATEMENT = 'DO_UNTIL_STATEMENT',
  WHILE_STATEMENT = 'WHILE_STATEMENT',
  FOR_STATEMENT = 'FOR_STATEMENT',
  TAP_MARKER = 'TAP_MARKER',

  // Expressions
  BINARY_EXPRESSION = 'BINARY_EXPRESSION',
  UNARY_EXPRESSION = 'UNARY_EXPRESSION',
  FUNCTION_CALL = 'FUNCTION_CALL',
  ARRAY_ACCESS = 'ARRAY_ACCESS',
  LITERAL = 'LITERAL',
  ARRAY_LITERAL = 'ARRAY_LITERAL',
  IDENTIFIER = 'IDENTIFIER',
  GROUPING = 'GROUPING',
}


// --- AST Nodes ---

// Expressions
export interface Expression {
  type: NodeType;
  lineNumber: number;
}

export interface Literal extends Expression {
  type: NodeType.LITERAL;
  value: string | number;
}

export interface ArrayLiteral extends Expression {
  type: NodeType.ARRAY_LITERAL;
  elements: Expression[];
}

export interface Identifier extends Expression {
  type: NodeType.IDENTIFIER;
  name: string;
}

export interface BinaryExpression extends Expression {
  type: NodeType.BINARY_EXPRESSION;
  left: Expression;
  operator: string;
  right: Expression;
}

export interface UnaryExpression extends Expression {
    type: NodeType.UNARY_EXPRESSION;
    operator: string;
    right: Expression;
}

export interface Grouping extends Expression {
    type: NodeType.GROUPING;
    expression: Expression;
}

export interface FunctionCall extends Expression {
    type: NodeType.FUNCTION_CALL;
    callee: string;
    args: Expression[];
}

export interface ArrayAccess extends Expression {
    type: NodeType.ARRAY_ACCESS;
    array: Expression;
    index: Expression;
}


// Statements
export interface Statement {
  type: NodeType;
  lineNumber: number;
}

export interface TapMarker {
    type: NodeType.TAP_MARKER;
}

export interface Declarator {
  identifier: string;
  size?: Expression;
  initializer?: Expression;
}

export interface VariableDeclaration extends Statement {
  type: NodeType.VARIABLE_DECLARATION;
  dataType: string;
  declarations: Declarator[];
  isConstant: boolean;
}

export interface Assignment extends Statement {
  type: NodeType.ASSIGNMENT;
  lvalue: Expression;
  value: Expression;
}

export interface DisplayStatement extends Statement {
  type: NodeType.DISPLAY_STATEMENT;
  values: (Expression | TapMarker)[];
}

export interface InputStatement extends Statement {
  type: NodeType.INPUT_STATEMENT;
  identifier: string;
}

export interface IfStatement extends Statement {
  type: NodeType.IF_STATEMENT;
  condition: Expression;
  thenBranch: Statement[];
  elseBranch?: Statement[];
}

export interface DoWhileStatement extends Statement {
    type: NodeType.DO_WHILE_STATEMENT;
    condition: Expression;
    body: Statement[];
}

export interface DoUntilStatement extends Statement {
    type: NodeType.DO_UNTIL_STATEMENT;
    condition: Expression;
    body: Statement[];
}

export interface WhileStatement extends Statement {
  type: NodeType.WHILE_STATEMENT;
  condition: Expression;
  body: Statement[];
}

export interface ForStatement extends Statement {
    type: NodeType.FOR_STATEMENT;
    identifier: string;
    start: Expression;
    end: Expression;
    body: Statement[];
}

export interface Parameter {
    name: string;
    dataType: string;
    isReference: boolean;
    isArray: boolean;
}

export interface ModuleStatement extends Statement {
    type: NodeType.MODULE_STATEMENT;
    name: string;
    parameters: Parameter[];
    body: Statement[];
}

export interface FunctionDeclaration extends Statement {
    type: NodeType.FUNCTION_DECLARATION;
    name: string;
    returnType: string;
    parameters: Parameter[];
    body: Statement[];
}

export interface ReturnStatement extends Statement {
    type: NodeType.RETURN_STATEMENT;
    value: Expression;
}

export interface CallStatement extends Statement {
    type: NodeType.CALL_STATEMENT;
    name: string;
    args: Expression[];
}