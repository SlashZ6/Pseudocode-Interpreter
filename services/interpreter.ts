// This is a simplified interpreter for the pseudocode dialect.
// It includes a lexer, a recursive descent parser, and an evaluator.
// It supports variables, constants, basic arithmetic, I/O, and control structures.

import {
  TokenType,
  Token,
  Expression,
  Statement,
  BinaryExpression,
  NodeType,
  Literal,
  UnaryExpression,
  VariableDeclaration,
  Assignment,
  DisplayStatement,
  InputStatement,
  IfStatement,
  WhileStatement,
  ForStatement,
  ModuleStatement,
  CallStatement,
  InterpreterError,
  Identifier,
  Grouping,
  DoWhileStatement,
  Declarator,
  Parameter,
  FunctionDeclaration,
  ReturnStatement,
  FunctionCall,
  DoUntilStatement,
  ProgramStoppedError,
  TapMarker,
  ArrayLiteral,
  ArrayAccess,
} from './interpreterTypes';
import { DebuggerState } from '../models';

// --- LEXER ---
export class Lexer {
  private readonly input: string;
  private position: number = 0;
  private tokens: Token[] = [];
  private lineNumber: number = 1;

  private static readonly KEYWORDS: { [key: string]: TokenType } = {
    'module': TokenType.MODULE,
    'end module': TokenType.END_MODULE,
    'function': TokenType.FUNCTION,
    'end function': TokenType.END_FUNCTION,
    'call': TokenType.CALL,
    'return': TokenType.RETURN,
    'constant': TokenType.CONSTANT,
    'declare': TokenType.DECLARE,
    'integer': TokenType.INTEGER_TYPE,
    'real': TokenType.REAL_TYPE,
    'string': TokenType.STRING_TYPE,
    'ref': TokenType.REF,
    'set': TokenType.SET,
    'display': TokenType.DISPLAY,
    'input': TokenType.INPUT,
    'if': TokenType.IF,
    'then': TokenType.THEN,
    'else': TokenType.ELSE,
    'end if': TokenType.END_IF,
    'do': TokenType.DO,
    'until': TokenType.UNTIL,
    'while': TokenType.WHILE,
    'end while': TokenType.END_WHILE,
    'for': TokenType.FOR,
    'to': TokenType.TO,
    'end for': TokenType.END_FOR,
    'and': TokenType.AND,
    'or': TokenType.OR,
    'not': TokenType.NOT,
    'tap': TokenType.TAP,
    'mod': TokenType.MOD,
  };

  private static readonly OPERATORS: { [key: string]: TokenType } = {
      '==': TokenType.EQUAL,
      '!=': TokenType.NOT_EQUAL,
      '<=': TokenType.LESS_EQUAL,
      '>=': TokenType.GREATER_EQUAL,
      '=': TokenType.ASSIGN,
      '<': TokenType.LESS,
      '>': TokenType.GREATER,
      '+': TokenType.PLUS,
      '-': TokenType.MINUS,
      '*': TokenType.MULTIPLY,
      '/': TokenType.DIVIDE,
      '%': TokenType.MOD,
      '^': TokenType.POWER,
      '(': TokenType.LPAREN,
      ')': TokenType.RPAREN,
      '[': TokenType.LBRACKET,
      ']': TokenType.RBRACKET,
      ',': TokenType.COMMA,
  };

  private static readonly SORTED_KEYWORDS = Object.keys(Lexer.KEYWORDS).sort((a, b) => b.length - a.length);
  private static readonly SORTED_OPERATORS = Object.keys(Lexer.OPERATORS).sort((a, b) => b.length - a.length);


  constructor(input: string) {
    this.input = input;
  }

  tokenize(): Token[] {
    while (this.position < this.input.length) {
      const char = this.input[this.position];

      if (/\s/.test(char)) {
        if (char === '\n') this.lineNumber++;
        this.position++;
        continue;
      }

      if (char === '/' && this.input[this.position + 1] === '/') {
        this.consumeComment();
        continue;
      }

      let matchedKeyword = false;
      for (const keyword of Lexer.SORTED_KEYWORDS) {
          if (this.matchKeyword(keyword)) {
              matchedKeyword = true;
              break;
          }
      }
      if (matchedKeyword) continue;
      
      if (char === '"') {
        this.consumeString();
        continue;
      }

      if (/\d/.test(char)) {
        this.consumeNumber();
        continue;
      }

      if (/[a-zA-Z]/.test(char)) {
        this.consumeIdentifier();
        continue;
      }

      if (this.matchOperator()) continue;

      throw new InterpreterError(`Unexpected character: ${char}`, this.lineNumber);
    }

    this.tokens.push({ type: TokenType.EOF, value: '', lineNumber: this.lineNumber });
    return this.tokens;
  }

  private matchKeyword(keyword: string): boolean {
    const keywordRegex = new RegExp(`^${keyword.replace(/\s/g, '\\s+')}\\b`, 'i');
    const match = this.input.substring(this.position).match(keywordRegex);
    if(match) {
        const type = Lexer.KEYWORDS[keyword.toLowerCase()];
        this.tokens.push({ type, value: keyword, lineNumber: this.lineNumber });
        this.position += match[0].length;
        return true;
    }
    return false;
  }
  
  private consumeComment() {
    while (this.position < this.input.length && this.input[this.position] !== '\n') {
      this.position++;
    }
  }

  private consumeString() {
    let value = '';
    this.position++; // Skip opening quote
    while (this.position < this.input.length && this.input[this.position] !== '"') {
      value += this.input[this.position];
      this.position++;
    }
    if (this.input[this.position] !== '"') {
      throw new InterpreterError('Unterminated string literal', this.lineNumber);
    }
    this.position++; // Skip closing quote
    this.tokens.push({ type: TokenType.STRING, value, lineNumber: this.lineNumber });
  }

  private consumeNumber() {
    let value = '';
    while (this.position < this.input.length && (/\d/.test(this.input[this.position]) || this.input[this.position] === '.')) {
      value += this.input[this.position];
      this.position++;
    }
    this.tokens.push({ type: TokenType.NUMBER, value, lineNumber: this.lineNumber });
  }

  private consumeIdentifier() {
    let value = '';
    while (this.position < this.input.length && /[a-zA-Z0-9_]/.test(this.input[this.position])) {
      value += this.input[this.position];
      this.position++;
    }
    this.tokens.push({ type: TokenType.IDENTIFIER, value, lineNumber: this.lineNumber });
  }

  private matchOperator(): boolean {
      for(const op of Lexer.SORTED_OPERATORS) {
          if(this.input.startsWith(op, this.position)) {
              this.tokens.push({ type: Lexer.OPERATORS[op], value: op, lineNumber: this.lineNumber });
              this.position += op.length;
              return true;
          }
      }
      return false;
  }
}

// --- PARSER ---
export class Parser {
  private tokens: Token[];
  private position: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): Statement[] {
    const statements: Statement[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.parseDeclaration());
    }
    return statements;
  }

  private parseDeclaration(): Statement {
      if(this.peek().type === TokenType.MODULE){
          return this.parseModuleStatement();
      }
      if (this.peek().type === TokenType.FUNCTION) {
          return this.parseFunctionDeclaration();
      }
      if (this.peek().type === TokenType.CONSTANT || this.peek().type === TokenType.DECLARE) {
          return this.parseVariableDeclaration(true); // Top-level declarations are allowed
      }
      return this.parseStatement();
  }
  
  private parseStatement(): Statement {
    switch (this.peek().type) {
      case TokenType.CONSTANT:
      case TokenType.DECLARE:
        return this.parseVariableDeclaration(false); // Not a top-level declaration
      case TokenType.SET:
        return this.parseAssignment();
      case TokenType.DISPLAY:
        return this.parseDisplayStatement();
      case TokenType.INPUT:
        return this.parseInputStatement();
      case TokenType.IF:
        return this.parseIfStatement();
      case TokenType.DO:
        return this.parseDoLoopStatement();
      case TokenType.WHILE:
        return this.parseWhileStatement();
       case TokenType.FOR:
        return this.parseForStatement();
       case TokenType.CALL:
        return this.parseCallStatement();
       case TokenType.RETURN:
        return this.parseReturnStatement();
      default:
        throw new InterpreterError(`Unexpected token: ${this.peek().value}`, this.peek().lineNumber);
    }
  }

  private parseParameters(): Parameter[] {
      const params: Parameter[] = [];
      if (!this.check(TokenType.RPAREN)) {
          do {
              let isReference = this.match(TokenType.REF);
              let dataType: string | undefined = undefined;

              if (this.check(TokenType.INTEGER_TYPE) || this.check(TokenType.REAL_TYPE) || this.check(TokenType.STRING_TYPE)) {
                  dataType = this.advance().value;
              }
              
              if (!isReference) {
                  isReference = this.match(TokenType.REF);
              }

              const name = this.consume(TokenType.IDENTIFIER).value;
              
              const isArray = this.match(TokenType.LBRACKET);
              if (isArray) {
                  this.consume(TokenType.RBRACKET);
              }

              if (!dataType) {
                dataType = 'auto';
              }

              params.push({ name, dataType, isReference, isArray });
          } while (this.match(TokenType.COMMA));
      }
      return params;
  }

  private parseArguments(): Expression[] {
      const args: Expression[] = [];
      if (!this.check(TokenType.RPAREN)) {
          do {
              args.push(this.parseExpression());
          } while (this.match(TokenType.COMMA));
      }
      return args;
  }
  
  private parseModuleStatement(): ModuleStatement {
      const moduleToken = this.consume(TokenType.MODULE);
      const name = this.consume(TokenType.IDENTIFIER).value;
      this.consume(TokenType.LPAREN);
      const parameters = this.parseParameters();
      this.consume(TokenType.RPAREN);

      const body: Statement[] = [];
      while(this.peek().type !== TokenType.END_MODULE && !this.isAtEnd()){
          body.push(this.parseStatement());
      }
      this.consume(TokenType.END_MODULE);
      return { type: NodeType.MODULE_STATEMENT, name, parameters, body, lineNumber: moduleToken.lineNumber };
  }

  private parseFunctionDeclaration(): FunctionDeclaration {
      const funcToken = this.consume(TokenType.FUNCTION);
      const returnType = this.consumeOneOf(TokenType.INTEGER_TYPE, TokenType.REAL_TYPE, TokenType.STRING_TYPE).value;
      const name = this.consume(TokenType.IDENTIFIER).value;
      this.consume(TokenType.LPAREN);
      const parameters = this.parseParameters();
      this.consume(TokenType.RPAREN);

      const body: Statement[] = [];
      while (this.peek().type !== TokenType.END_FUNCTION && !this.isAtEnd()) {
          body.push(this.parseStatement());
      }
      this.consume(TokenType.END_FUNCTION);
      return { type: NodeType.FUNCTION_DECLARATION, name, returnType, parameters, body, lineNumber: funcToken.lineNumber };
  }

  private parseReturnStatement(): ReturnStatement {
      const returnToken = this.consume(TokenType.RETURN);
      const value = this.parseExpression();
      return { type: NodeType.RETURN_STATEMENT, value, lineNumber: returnToken.lineNumber };
  }

  private parseCallStatement(): CallStatement {
    const callToken = this.consume(TokenType.CALL);
    const name = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.LPAREN);
    const args = this.parseArguments();
    this.consume(TokenType.RPAREN);
    return { type: NodeType.CALL_STATEMENT, name, args, lineNumber: callToken.lineNumber };
  }

  private parseVariableDeclaration(allowGlobals: boolean): VariableDeclaration {
    let keywordToken: Token;
    const isConstant = this.peek().type === TokenType.CONSTANT;
    if (isConstant) {
      keywordToken = this.consume(TokenType.CONSTANT);
    } else {
      keywordToken = this.consume(TokenType.DECLARE);
    }
    
    const dataType = this.consumeOneOf(TokenType.INTEGER_TYPE, TokenType.REAL_TYPE, TokenType.STRING_TYPE).value;
    
    const declarations: Declarator[] = [];
    
    do {
        const identifier = this.consume(TokenType.IDENTIFIER).value;
        let size: Expression | undefined = undefined;
        if (this.match(TokenType.LBRACKET)) {
            size = this.parseExpression();
            this.consume(TokenType.RBRACKET);
        }

        let initializer: Expression | undefined = undefined;
        if (this.match(TokenType.ASSIGN)) {
            if (size) { // Array initialization
                const elements: Expression[] = [];
                const firstToken = this.peek();
                do {
                    elements.push(this.parseExpression());
                } while (this.match(TokenType.COMMA));
                // FIX: Cast object to ArrayLiteral to satisfy TypeScript's type checking for the 'Expression' union type.
                initializer = { type: NodeType.ARRAY_LITERAL, elements, lineNumber: firstToken.lineNumber } as ArrayLiteral;
            } else { // Scalar initialization
                initializer = this.parseExpression();
            }
        }
        declarations.push({ identifier, initializer, size });
    } while (this.match(TokenType.COMMA));
    
    return { type: NodeType.VARIABLE_DECLARATION, dataType, declarations, isConstant, lineNumber: keywordToken.lineNumber };
  }

  private parseAssignment(): Assignment {
    const setToken = this.consume(TokenType.SET);
    const lvalue = this.parsePostfix();
    if (lvalue.type !== NodeType.IDENTIFIER && lvalue.type !== NodeType.ARRAY_ACCESS) {
        throw new InterpreterError(`Invalid assignment target.`, setToken.lineNumber);
    }
    this.consume(TokenType.ASSIGN);
    const value = this.parseExpression();
    return { type: NodeType.ASSIGNMENT, lvalue, value, lineNumber: setToken.lineNumber };
  }

  private parseDisplayStatement(): DisplayStatement {
    const displayToken = this.consume(TokenType.DISPLAY);
    const values: (Expression | TapMarker)[] = [];

    do {
      if (this.peek().type === TokenType.TAP) {
        if (values.length === 0) {
          throw new InterpreterError(`'Display' statement cannot start with 'Tap'.`, this.peek().lineNumber);
        }
        this.consume(TokenType.TAP);
        values.push({ type: NodeType.TAP_MARKER });
      } else {
        values.push(this.parseExpression());
      }
    } while (this.match(TokenType.COMMA));

    return { type: NodeType.DISPLAY_STATEMENT, values, lineNumber: displayToken.lineNumber };
  }

  private parseInputStatement(): InputStatement {
    const inputToken = this.consume(TokenType.INPUT);
    const identifier = this.consume(TokenType.IDENTIFIER).value;
    return { type: NodeType.INPUT_STATEMENT, identifier, lineNumber: inputToken.lineNumber };
  }

  private parseIfStatement(): IfStatement {
    const ifToken = this.consume(TokenType.IF);
    const condition = this.parseExpression();
    this.consume(TokenType.THEN);
    
    const thenBranch: Statement[] = [];
    while (![TokenType.ELSE, TokenType.END_IF].includes(this.peek().type) && !this.isAtEnd()) {
      thenBranch.push(this.parseStatement());
    }
    
    let elseBranch: Statement[] | undefined;
    
    if (this.match(TokenType.ELSE)) {
      elseBranch = [];
      if (this.peek().type === TokenType.IF) {
        elseBranch.push(this.parseIfStatement());
      } else {
        while (this.peek().type !== TokenType.END_IF && !this.isAtEnd()) {
          elseBranch.push(this.parseStatement());
        }
        this.consume(TokenType.END_IF);
      }
    } else {
      this.consume(TokenType.END_IF);
    }
    
    return { type: NodeType.IF_STATEMENT, condition, thenBranch, elseBranch, lineNumber: ifToken.lineNumber };
  }
  
  private parseDoLoopStatement(): DoWhileStatement | DoUntilStatement {
      const doToken = this.consume(TokenType.DO);
      const body: Statement[] = [];
      while (!this.check(TokenType.WHILE) && !this.check(TokenType.UNTIL) && !this.isAtEnd()) {
          body.push(this.parseStatement());
      }

      if (this.match(TokenType.WHILE)) {
          const condition = this.parseExpression();
          return { type: NodeType.DO_WHILE_STATEMENT, body, condition, lineNumber: doToken.lineNumber };
      }

      if (this.match(TokenType.UNTIL)) {
          const condition = this.parseExpression();
          return { type: NodeType.DO_UNTIL_STATEMENT, body, condition, lineNumber: doToken.lineNumber };
      }
      
      throw new InterpreterError(`Expected 'While' or 'Until' after 'Do' block.`, this.peek().lineNumber);
  }

  private parseWhileStatement(): WhileStatement {
    const whileToken = this.consume(TokenType.WHILE);
    const condition = this.parseExpression();
    const body: Statement[] = [];
    while (this.peek().type !== TokenType.END_WHILE && !this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    this.consume(TokenType.END_WHILE);
    return { type: NodeType.WHILE_STATEMENT, condition, body, lineNumber: whileToken.lineNumber };
  }

  private parseForStatement(): ForStatement {
    const forToken = this.consume(TokenType.FOR);
    const identifier = this.consume(TokenType.IDENTIFIER).value;
    this.consume(TokenType.ASSIGN);
    const start = this.parseExpression();
    this.consume(TokenType.TO);
    const end = this.parseExpression();
    const body: Statement[] = [];
    while(this.peek().type !== TokenType.END_FOR && !this.isAtEnd()){
        body.push(this.parseStatement());
    }
    this.consume(TokenType.END_FOR);
    return {type: NodeType.FOR_STATEMENT, identifier, start, end, body, lineNumber: forToken.lineNumber};
  }
  
  private parseExpression(): Expression {
    return this.parseOr();
  }

  private parseOr(): Expression {
      let expr = this.parseAnd();
      while (this.match(TokenType.OR)) {
          const operatorToken = this.previous();
          const operator = operatorToken.value;
          const right = this.parseAnd();
          expr = { type: NodeType.BINARY_EXPRESSION, left: expr, operator, right, lineNumber: operatorToken.lineNumber } as BinaryExpression;
      }
      return expr;
  }

  private parseAnd(): Expression {
      let expr = this.parseEquality();
      while(this.match(TokenType.AND)) {
          const operatorToken = this.previous();
          const operator = operatorToken.value;
          const right = this.parseEquality();
          expr = { type: NodeType.BINARY_EXPRESSION, left: expr, operator, right, lineNumber: operatorToken.lineNumber } as BinaryExpression;
      }
      return expr;
  }

  private parseEquality(): Expression {
    let expr = this.parseComparison();
    while (this.match(TokenType.EQUAL, TokenType.NOT_EQUAL, TokenType.ASSIGN)) {
      const operatorToken = this.previous();
      const operator = operatorToken.type === TokenType.ASSIGN ? '==' : operatorToken.value;
      const right = this.parseComparison();
      expr = { type: NodeType.BINARY_EXPRESSION, left: expr, operator, right, lineNumber: operatorToken.lineNumber } as BinaryExpression;
    }
    return expr;
  }

  private parseComparison(): Expression {
    let expr = this.parseTerm();
    while (this.match(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operatorToken = this.previous();
      const operator = operatorToken.value;
      const right = this.parseTerm();
      expr = { type: NodeType.BINARY_EXPRESSION, left: expr, operator, right, lineNumber: operatorToken.lineNumber } as BinaryExpression;
    }
    return expr;
  }
  
  private parseTerm(): Expression {
    let expr = this.parseFactor();
    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operatorToken = this.previous();
      const operator = operatorToken.value;
      const right = this.parseFactor();
      expr = { type: NodeType.BINARY_EXPRESSION, left: expr, operator, right, lineNumber: operatorToken.lineNumber } as BinaryExpression;
    }
    return expr;
  }

  private parseFactor(): Expression {
    let expr = this.parseUnary();
    while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MOD)) {
      const operatorToken = this.previous();
      const operator = operatorToken.value;
      const right = this.parseUnary();
      expr = { type: NodeType.BINARY_EXPRESSION, left: expr, operator, right, lineNumber: operatorToken.lineNumber } as BinaryExpression;
    }
    return expr;
  }

  private parseUnary(): Expression {
    if (this.match(TokenType.MINUS, TokenType.NOT)) {
      const operatorToken = this.previous();
      const operator = operatorToken.value;
      const right = this.parseUnary();
      return { type: NodeType.UNARY_EXPRESSION, operator, right, lineNumber: operatorToken.lineNumber } as UnaryExpression;
    }
    return this.parsePostfix();
  }
  
  private parsePostfix(): Expression {
      let expr = this.parsePrimary();

      while (true) {
          if (this.match(TokenType.LPAREN)) {
              if (expr.type !== NodeType.IDENTIFIER) {
                  throw new InterpreterError(`Can only call functions, not expressions.`, this.previous().lineNumber);
              }
              const calleeName = (expr as Identifier).name;
              const args = this.parseArguments();
              this.consume(TokenType.RPAREN);
              expr = { type: NodeType.FUNCTION_CALL, callee: calleeName, args, lineNumber: expr.lineNumber } as FunctionCall;
          } else if (this.match(TokenType.LBRACKET)) {
              const index = this.parseExpression();
              const bracketToken = this.consume(TokenType.RBRACKET);
              // FIX: Cast object to ArrayAccess to satisfy TypeScript's type checking for the 'Expression' union type.
              expr = { type: NodeType.ARRAY_ACCESS, array: expr, index: index, lineNumber: bracketToken.lineNumber } as ArrayAccess;
          } else {
              break;
          }
      }
      return expr;
  }

  private parsePrimary(): Expression {
      const token = this.peek();
      if (this.match(TokenType.NUMBER)) {
          return { type: NodeType.LITERAL, value: parseFloat(this.previous().value), lineNumber: token.lineNumber } as Literal;
      }
      if (this.match(TokenType.STRING)) {
          return { type: NodeType.LITERAL, value: this.previous().value, lineNumber: token.lineNumber } as Literal;
      }
      if (this.match(TokenType.IDENTIFIER)) {
          return { type: NodeType.IDENTIFIER, name: this.previous().value, lineNumber: token.lineNumber } as Identifier;
      }
      if (this.match(TokenType.LPAREN)) {
          const expr = this.parseExpression();
          this.consume(TokenType.RPAREN);
          return { type: NodeType.GROUPING, expression: expr, lineNumber: token.lineNumber } as Grouping;
      }
      throw new InterpreterError(`Expected expression, got ${this.peek().value}`, this.peek().lineNumber);
  }
  
  private consume(type: TokenType): Token {
    if (this.check(type)) return this.advance();
    throw new InterpreterError(`Expected ${type} but got ${this.peek().type}`, this.peek().lineNumber);
  }

  private consumeOneOf(...types: TokenType[]): Token {
    for (const type of types) {
        if(this.check(type)) return this.advance();
    }
    throw new InterpreterError(`Expected one of ${types.join(', ')} but got ${this.peek().type}`, this.peek().lineNumber);
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.position++;
    return this.previous();
  }
  
  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.position];
  }

  private previous(): Token {
    return this.tokens[this.position - 1];
  }
}

type EnvironmentValue = {
    value: any;
    isConstant: boolean;
    dataType: string;
};

type EnvironmentEntry = {
    entry: EnvironmentValue;
    originalName: string;
};

class Environment {
    private readonly values = new Map<string, EnvironmentEntry>();

    constructor(private readonly enclosing: Environment | null = null) {}

    define(name: string, isConstant: boolean, dataType: string, value: any) {
        const lowerName = name.toLowerCase();
        if (this.values.has(lowerName)) {
            throw new Error(`Variable ${name} already defined in this scope.`);
        }
        this.values.set(lowerName, {
            entry: { value, isConstant, dataType },
            originalName: name
        });
    }

    defineReference(name: string, valueEntry: EnvironmentEntry) {
        const lowerName = name.toLowerCase();
        if (this.values.has(lowerName)) {
            throw new Error(`Variable ${name} already defined in this scope.`);
        }
        this.values.set(lowerName, valueEntry);
    }

    assign(name: string, value: any, lineNumber: number): EnvironmentValue {
        const lowerName = name.toLowerCase();
        if (this.values.has(lowerName)) {
            const existing = this.values.get(lowerName)!;
            if (existing.entry.isConstant) {
                throw new InterpreterError(`Cannot assign to constant "${name}".`, lineNumber);
            }
            existing.entry.value = value;
            return existing.entry;
        }
        if (this.enclosing !== null) {
            return this.enclosing.assign(name, value, lineNumber);
        }
        throw new InterpreterError(`Variable "${name}" has not been declared.`, lineNumber);
    }

    get(name: string, lineNumber: number): any {
        return this.getEntry(name, lineNumber).entry.value;
    }

    getEntry(name: string, lineNumber: number): EnvironmentEntry {
        const lowerName = name.toLowerCase();
        if (this.values.has(lowerName)) {
            return this.values.get(lowerName)!;
        }
        if (this.enclosing !== null) {
            return this.enclosing.getEntry(name, lineNumber);
        }
        throw new InterpreterError(`Variable "${name}" not found.`, lineNumber);
    }

    serialize(): Record<string, any> {
        const scope: Record<string, any> = {};
        if (this.enclosing) {
            Object.assign(scope, this.enclosing.serialize());
        }
        for (const value of this.values.values()) {
            scope[value.originalName] = value.entry.value;
        }
        return scope;
    }
}

class ReturnError extends Error {
    constructor(public readonly value: any) {
        super('Return value');
        this.name = 'ReturnError';
    }
}

class Interpreter {
  private readonly statements: Statement[];
  private readonly displayProvider: (values: any[]) => void;
  private readonly inputProvider: (prompt: string) => Promise<string | null>;
  private readonly shouldStop: () => boolean;
  private readonly globals = new Environment();
  private environment = this.globals;
  private modules: Map<string, ModuleStatement> = new Map();
  private functions: Map<string, FunctionDeclaration> = new Map();
  private readonly builtInFunctions: { [key: string]: { implementation: (...args: any[]) => any, argCount: number | number[] } } = {
    'sqrt': { implementation: (n: number) => Math.sqrt(n), argCount: 1 },
    'round': { implementation: (n: number) => Math.round(n), argCount: 1 },
    'abs': { implementation: (n: number) => Math.abs(n), argCount: 1 },
    'cos': { implementation: (n: number) => Math.cos(n), argCount: 1 },
    'sin': { implementation: (n: number) => Math.sin(n), argCount: 1 },
    'tan': { implementation: (n: number) => Math.tan(n), argCount: 1 },
    'power': { implementation: (base: number, exp: number) => Math.pow(base, exp), argCount: 2 },
    'random': { 
      implementation: (min: number, max: number) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }, 
      argCount: 2 
    },
    'tointeger': { implementation: (n: number) => Math.trunc(n), argCount: 1 },
    'toreal': { implementation: (n: number) => parseFloat(String(n)), argCount: 1 },
    'stringtointeger': { implementation: (s: string) => parseInt(s, 10), argCount: 1 },
    'stringtoreal': { implementation: (s: string) => parseFloat(s), argCount: 1 },
    'isinteger': { implementation: (s: any) => /^-?\d+$/.test(String(s).trim()), argCount: 1 },
    'isreal': { implementation: (s: any) => /^-?\d+(\.\d+)?$/.test(String(s).trim()), argCount: 1 },
    'currencyformat': {
        implementation: (n: number) => {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
        },
        argCount: 1
    },
    'length': { implementation: (s: any) => String(s).length, argCount: 1 },
    'toupper': { implementation: (s: any) => String(s).toUpperCase(), argCount: 1 },
    'tolower': { implementation: (s: any) => String(s).toLowerCase(), argCount: 1 },
    'append': { implementation: (s1: any, s2: any) => String(s1) + String(s2), argCount: 2 },
    'contains': { implementation: (s1: any, s2: any) => String(s1).includes(String(s2)), argCount: 2 },
    'substring': { 
        implementation: (s: any, start: any, end: any) => {
            const str = String(s);
            if (typeof start !== 'number') {
                throw new Error('Substring start argument must be a number.');
            }

            if (end === undefined) {
                return str.substring(start);
            }

            if (typeof end !== 'number') {
                throw new Error('Substring end argument must be a number if provided.');
            }

            if (start > end) {
                throw new Error('Substring start index cannot be greater than end index.');
            }

            return str.substring(start, end);
        },
        argCount: [2, 3] 
    },
  };

  constructor(statements: Statement[], displayProvider: (values: any[]) => void, inputProvider: (prompt: string) => Promise<string | null>, shouldStop: () => boolean) {
    this.statements = statements;
    this.displayProvider = displayProvider;
    this.inputProvider = inputProvider;
    this.shouldStop = shouldStop;
    this.environment = this.globals;

    for(const stmt of this.statements) {
        if(stmt.type === NodeType.MODULE_STATEMENT) {
            const moduleStmt = stmt as ModuleStatement;
            this.modules.set(moduleStmt.name.toLowerCase(), moduleStmt);
        } else if (stmt.type === NodeType.FUNCTION_DECLARATION) {
            const funcStmt = stmt as FunctionDeclaration;
            this.functions.set(funcStmt.name.toLowerCase(), funcStmt);
        }
    }
  }

  private checkStopSignal() {
      if (this.shouldStop()) {
          throw new ProgramStoppedError();
      }
  }
  
  async run() {
    for await (const _ of this.runGenerator()) {
        // In non-debug mode, we just exhaust the generator.
    }
  }

  async* runGenerator(): AsyncGenerator<DebuggerState, void, unknown> {
    this.checkStopSignal();
    
    if (this.modules.size > 0) {
        const mainModule = this.modules.get('main');
        if (!mainModule) {
            throw new InterpreterError("A 'main' module is required when other modules are defined.", 1);
        }

        for (const stmt of this.statements) {
            if (stmt.type === NodeType.VARIABLE_DECLARATION) {
                yield* this.executeStatementGenerator(stmt);
            }
        }
        
        yield* this.executeCallGenerator(mainModule, [], 1);
    } else {
        for(const stmt of this.statements) {
            if (stmt.type !== NodeType.FUNCTION_DECLARATION) {
                yield* this.executeStatementGenerator(stmt);
            }
        }
    }
  }
  
  private async* executeBlockGenerator(statements: Statement[], environment: Environment): AsyncGenerator<DebuggerState, void, unknown> {
      const previousEnv = this.environment;
      try {
          this.environment = environment;
          for(const stmt of statements) {
              this.checkStopSignal();
              yield* this.executeStatementGenerator(stmt);
          }
      } finally {
          this.environment = previousEnv;
      }
  }

  private async* executeStatementGenerator(stmt: Statement): AsyncGenerator<DebuggerState, void, unknown> {
    this.checkStopSignal();
    yield { lineNumber: stmt.lineNumber, scope: this.environment.serialize() };

    switch (stmt.type) {
        case NodeType.VARIABLE_DECLARATION:
            const decl = stmt as VariableDeclaration;
            for (const declaration of decl.declarations) {
                let initialValue: any = null;

                if (declaration.size) { // It's an array
                    const size = await this.evaluate(declaration.size);
                    if (typeof size !== 'number' || !Number.isInteger(size) || size < 0) {
                        throw new InterpreterError(`Array size must be a non-negative integer.`, declaration.size.lineNumber);
                    }
                    initialValue = new Array(size).fill(null); // Initialize with nulls

                    if (declaration.initializer) {
                        if (declaration.initializer.type !== NodeType.ARRAY_LITERAL) {
                            throw new InterpreterError(`Array initializer must be a comma-separated list of values.`, declaration.initializer.lineNumber);
                        }
                        const elements = (declaration.initializer as ArrayLiteral).elements;
                        if (elements.length > size) {
                            throw new InterpreterError(`Too many initializers for array "${declaration.identifier}". Expected ${size}, got ${elements.length}.`, declaration.initializer.lineNumber);
                        }
                        for (let i = 0; i < elements.length; i++) {
                            initialValue[i] = await this.evaluate(elements[i]);
                        }
                    }
                } else { // It's a scalar
                    if (declaration.initializer) {
                        if (declaration.initializer.type === NodeType.ARRAY_LITERAL) {
                           throw new InterpreterError(`Cannot initialize a scalar variable with an array literal.`, declaration.initializer.lineNumber);
                        }
                        initialValue = await this.evaluate(declaration.initializer);
                    }
                }

                if (decl.isConstant && initialValue === null) {
                    throw new InterpreterError(`Constant "${declaration.identifier}" must be initialized.`, decl.lineNumber);
                }
                
                this.environment.define(declaration.identifier, decl.isConstant, decl.dataType, initialValue);
            }
            break;
        case NodeType.ASSIGNMENT:
            const assignment = stmt as Assignment;
            const value = await this.evaluate(assignment.value);
            if (assignment.lvalue.type === NodeType.IDENTIFIER) {
                this.environment.assign((assignment.lvalue as Identifier).name, value, assignment.lineNumber);
            } else if (assignment.lvalue.type === NodeType.ARRAY_ACCESS) {
                const accessExpr = assignment.lvalue as ArrayAccess;
                const array = await this.evaluate(accessExpr.array);
                const index = await this.evaluate(accessExpr.index);
                if (!Array.isArray(array)) {
                    throw new InterpreterError(`Cannot access an element of a non-array variable.`, accessExpr.lineNumber);
                }
                if (typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index >= array.length) {
                    throw new InterpreterError(`Array index out of bounds. Index ${index} is not valid for array of size ${array.length}.`, accessExpr.lineNumber);
                }
                array[index] = value;
            } else {
                throw new InterpreterError(`Invalid assignment target.`, assignment.lineNumber);
            }
            break;
        case NodeType.DISPLAY_STATEMENT:
            const displayStmt = stmt as DisplayStatement;
            const evaluatedValues: any[] = [];
            for (const valueNode of displayStmt.values) {
                this.checkStopSignal();
                if (valueNode.type === NodeType.TAP_MARKER) {
                    evaluatedValues.push('    '); 
                } else {
                    const value = await this.evaluate(valueNode as Expression);
                    evaluatedValues.push(value);
                }
            }
            this.displayProvider(evaluatedValues);
            break;
        case NodeType.INPUT_STATEMENT:
            const inputStmt = stmt as InputStatement;
            const inputIdentifier = inputStmt.identifier;
            const inputVarEntry = this.environment.getEntry(inputIdentifier, inputStmt.lineNumber).entry;

            let validInput = false;
            while (!validInput) {
              this.checkStopSignal();
              const rawInput = await this.inputProvider(`Enter a value for ${inputStmt.identifier} (${inputVarEntry.dataType}):`);
              
              if (rawInput === null) {
                  this.checkStopSignal();
                  this.displayProvider([`Input for ${inputStmt.identifier} cancelled.`]);
                  break; 
              }

              const validationResult = this.validateAndParseInput(rawInput, inputVarEntry.dataType);
              if (validationResult.isValid) {
                  this.environment.assign(inputIdentifier, validationResult.value, inputStmt.lineNumber);
                  validInput = true;
              } else {
                  this.displayProvider([`Invalid input. Please enter a valid ${inputVarEntry.dataType}.`]);
              }
            }
            break;
        case NodeType.IF_STATEMENT:
            const ifStmt = stmt as IfStatement;
            const condition = await this.evaluate(ifStmt.condition);
            if(condition) {
                yield* this.executeBlockGenerator(ifStmt.thenBranch, new Environment(this.environment));
            } else if (ifStmt.elseBranch) {
                yield* this.executeBlockGenerator(ifStmt.elseBranch, new Environment(this.environment));
            }
            break;
        case NodeType.DO_WHILE_STATEMENT:
            const doWhileStmt = stmt as DoWhileStatement;
            do {
                this.checkStopSignal();
                yield* this.executeBlockGenerator(doWhileStmt.body, new Environment(this.environment));
            } while (await this.evaluate(doWhileStmt.condition));
            break;
        case NodeType.DO_UNTIL_STATEMENT:
            const doUntilStmt = stmt as DoUntilStatement;
            do {
                this.checkStopSignal();
                yield* this.executeBlockGenerator(doUntilStmt.body, new Environment(this.environment));
            } while (!(await this.evaluate(doUntilStmt.condition)));
            break;
        case NodeType.WHILE_STATEMENT:
            const whileStmt = stmt as WhileStatement;
            while(await this.evaluate(whileStmt.condition)) {
                this.checkStopSignal();
                yield* this.executeBlockGenerator(whileStmt.body, new Environment(this.environment));
            }
            break;
        case NodeType.FOR_STATEMENT:
            const forStmt = stmt as ForStatement;
            const scope = new Environment(this.environment);
            const start = await this.evaluate(forStmt.start);
            const end = await this.evaluate(forStmt.end);
            if (typeof start !== 'number' || typeof end !== 'number') {
                throw new InterpreterError('For loop bounds must be numbers', forStmt.lineNumber);
            }

            scope.define(forStmt.identifier, false, 'Real', start);
            for(let i = start; i <= end; i++) {
                this.checkStopSignal();
                scope.assign(forStmt.identifier, i, forStmt.lineNumber);
                yield* this.executeBlockGenerator(forStmt.body, new Environment(scope));
            }
            break;
        case NodeType.CALL_STATEMENT:
            const callStmt = stmt as CallStatement;
            const moduleToCall = this.modules.get(callStmt.name.toLowerCase());
            if(!moduleToCall) {
                throw new InterpreterError(`Module "${callStmt.name}" not found.`, callStmt.lineNumber);
            }
            yield* this.executeCallGenerator(moduleToCall, callStmt.args, callStmt.lineNumber);
            break;
        case NodeType.RETURN_STATEMENT:
            const returnStmt = stmt as ReturnStatement;
            const returnValue = await this.evaluate(returnStmt.value);
            throw new ReturnError(returnValue);
        case NodeType.FUNCTION_DECLARATION:
        case NodeType.MODULE_STATEMENT:
            break;
        default:
             throw new InterpreterError(`Unknown statement type`, 1);
    }
  }

  private async* executeCallGenerator(callee: ModuleStatement | FunctionDeclaration, args: Expression[], lineNumber: number): AsyncGenerator<DebuggerState, void, unknown> {
      if (args.length !== callee.parameters.length) {
          throw new InterpreterError(`Expected ${callee.parameters.length} arguments but got ${args.length}.`, lineNumber);
      }

      const calleeEnv = new Environment(this.globals);

      for(let i = 0; i < callee.parameters.length; i++) {
          const param = callee.parameters[i];
          const arg = args[i];

          if(param.isReference) {
              if (arg.type !== NodeType.IDENTIFIER) {
                  throw new InterpreterError(`Argument for reference parameter "${param.name}" must be a variable.`, lineNumber);
              }
              const varName = (arg as Identifier).name;
              const valueEntry = this.environment.getEntry(varName, lineNumber);
              calleeEnv.defineReference(param.name, valueEntry);
          } else {
              const argValue = await this.evaluate(arg);
              let paramDataType = param.dataType;
              if (paramDataType === 'auto') {
                  const originalEntry = this.environment.getEntry((arg as Identifier).name, (arg as Identifier).lineNumber).entry;
                  paramDataType = originalEntry.dataType;
              }
              calleeEnv.define(param.name, false, paramDataType, argValue);
          }
      }

      yield* this.executeBlockGenerator(callee.body, calleeEnv);
  }

  private async evaluate(expr: Expression): Promise<any> {
    switch(expr.type) {
      case NodeType.LITERAL:
        return (expr as Literal).value;
      case NodeType.IDENTIFIER:
        const identifierExpr = expr as Identifier;
        return this.environment.get(identifierExpr.name, identifierExpr.lineNumber);
      case NodeType.BINARY_EXPRESSION:
        const binaryExpr = expr as BinaryExpression;
        const left = await this.evaluate(binaryExpr.left);
        const right = await this.evaluate(binaryExpr.right);
        switch (binaryExpr.operator.toLowerCase()) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/':
            if (right === 0) {
                throw new InterpreterError(`Division by zero.`, binaryExpr.lineNumber);
            }
            return left / right;
          case 'mod':
          case '%':
            if (typeof left !== 'number' || typeof right !== 'number') {
                throw new InterpreterError('Operands for MOD must be numbers.', binaryExpr.lineNumber);
            }
            if (right === 0) {
                throw new InterpreterError('Division by zero in MOD operation.', binaryExpr.lineNumber);
            }
            return left % right;
          case '>': return left > right;
          case '<': return left < right;
          case '>=': return left >= right;
          case '<=': return left <= right;
          case '==': return left == right;
          case '!=': return left != right;
          case 'and': return left && right;
          case 'or': return left || right;
          default: throw new InterpreterError(`Unknown operator: ${binaryExpr.operator}`, binaryExpr.lineNumber);
        }
       case NodeType.UNARY_EXPRESSION:
         const unaryExpr = expr as UnaryExpression;
         const unaryRight = await this.evaluate(unaryExpr.right);
         switch(unaryExpr.operator.toLowerCase()) {
            case '-': return -unaryRight;
            case 'not': return !unaryRight;
            default: throw new InterpreterError(`Unknown unary operator: ${unaryExpr.operator}`, unaryExpr.lineNumber);
         }
       case NodeType.GROUPING:
        return this.evaluate((expr as Grouping).expression);
       case NodeType.FUNCTION_CALL:
        const funcCallExpr = expr as FunctionCall;
        const calleeName = funcCallExpr.callee.toLowerCase();

        if (this.builtInFunctions.hasOwnProperty(calleeName)) {
            const builtIn = this.builtInFunctions[calleeName];
            
            const actualArgCount = funcCallExpr.args.length;
            const expectedArgCount = builtIn.argCount;

            const isValid = Array.isArray(expectedArgCount)
              ? expectedArgCount.includes(actualArgCount)
              : actualArgCount === expectedArgCount;

            if (!isValid) {
              const expectedMessage = Array.isArray(expectedArgCount)
                ? `either ${expectedArgCount.join(' or ')}`
                : `${expectedArgCount}`;
              throw new InterpreterError(`Built-in function "${funcCallExpr.callee}" expects ${expectedMessage} arguments, but got ${actualArgCount}.`, funcCallExpr.lineNumber);
            }

            const evaluatedArgs = await Promise.all(funcCallExpr.args.map(arg => this.evaluate(arg)));
            try {
                return builtIn.implementation(...evaluatedArgs);
            } catch (e) {
                if (e instanceof Error) {
                    throw new InterpreterError(`Error in built-in function '${calleeName}': ${e.message}`, funcCallExpr.lineNumber);
                }
                throw e;
            }
        }

        const funcToCall = this.functions.get(calleeName);
        if (!funcToCall) {
            throw new InterpreterError(`Function "${funcCallExpr.callee}" not found.`, funcCallExpr.lineNumber);
        }
        try {
            for await (const _ of this.executeCallGenerator(funcToCall, funcCallExpr.args, funcCallExpr.lineNumber)) {
                // In a function call evaluation, we don't yield to the outer debugger, just run it.
            }
        } catch (e) {
            if (e instanceof ReturnError) {
                return e.value;
            }
            throw e;
        }
        throw new InterpreterError(`Function "${funcToCall.name}" did not return a value.`, funcCallExpr.lineNumber);
      case NodeType.ARRAY_LITERAL:
        const arrayLiteral = expr as ArrayLiteral;
        return Promise.all(arrayLiteral.elements.map(el => this.evaluate(el)));
      case NodeType.ARRAY_ACCESS:
        const accessExpr = expr as ArrayAccess;
        const array = await this.evaluate(accessExpr.array);
        const index = await this.evaluate(accessExpr.index);
        if (!Array.isArray(array)) {
            throw new InterpreterError(`Cannot access an element of a non-array variable.`, accessExpr.lineNumber);
        }
        if (typeof index !== 'number' || !Number.isInteger(index) || index < 0 || index >= array.length) {
            throw new InterpreterError(`Array index out of bounds. Index ${index} is not valid for array of size ${array.length}.`, accessExpr.lineNumber);
        }
        return array[index];
    }
  }

  private validateAndParseInput(input: string, type: string): { isValid: boolean, value: any } {
    const trimmedInput = input.trim();
    
    switch (type.toLowerCase()) {
      case 'integer':
        if (/^-?\d+$/.test(trimmedInput)) {
          return { isValid: true, value: parseInt(trimmedInput, 10) };
        }
        return { isValid: false, value: null };
      
      case 'real':
        if (/^-?\d+(\.\d+)?$/.test(trimmedInput)) {
          return { isValid: true, value: parseFloat(trimmedInput) };
        }
        return { isValid: false, value: null };

      case 'string':
        return { isValid: true, value: input };
      
      default:
        return { isValid: true, value: input };
    }
  }
}

type ExecutionMode = 'run' | 'debug';

export function interpret(
    code: string, 
    displayProvider: (values: any[]) => void, 
    inputProvider: (prompt: string) => Promise<string | null>, 
    shouldStop: () => boolean,
    mode: 'run'
): Promise<void>;
export function interpret(
    code: string, 
    displayProvider: (values: any[]) => void, 
    inputProvider: (prompt: string) => Promise<string | null>, 
    shouldStop: () => boolean,
    mode: 'debug'
): AsyncGenerator<DebuggerState, void, unknown>;
export function interpret(
    code: string, 
    displayProvider: (values: any[]) => void, 
    inputProvider: (prompt: string) => Promise<string | null>, 
    shouldStop: () => boolean,
    mode: ExecutionMode
): Promise<void> | AsyncGenerator<DebuggerState, void, unknown> {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    
    const parser = new Parser(tokens);
    const statements = parser.parse();
    
    const interpreter = new Interpreter(statements, displayProvider, inputProvider, shouldStop);
    
    if (mode === 'debug') {
        return interpreter.runGenerator();
    } else {
        return interpreter.run();
    }
}