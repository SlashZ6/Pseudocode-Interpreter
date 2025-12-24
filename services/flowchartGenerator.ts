import { Lexer, Parser } from './interpreter';
import {
    Statement,
    NodeType,
    ModuleStatement,
    VariableDeclaration,
    Assignment,
    DisplayStatement,
    InputStatement,
    IfStatement,
    WhileStatement,
    ForStatement,
    Expression,
    BinaryExpression,
    Identifier,
    Literal,
    UnaryExpression,
    Grouping,
    FunctionCall,
    DoUntilStatement,
    DoWhileStatement,
    CallStatement,
    InterpreterError,
    ReturnStatement,
    FunctionDeclaration,
    ArrayAccess,
} from './interpreterTypes';

// --- Data Structures ---

export interface FlowchartNode {
    id: string;
    type: 'start' | 'end' | 'process' | 'io' | 'decision';
    label: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
}

export interface FlowchartEdge {
    from: string;
    to: string;
    label?: string;
}

export interface FlowchartData {
    nodes: FlowchartNode[];
    edges: FlowchartEdge[];
}

// --- Sizing Constants ---
const CHAR_WIDTH = 8; // Estimated average character width for sizing
const LINE_HEIGHT = 18; // Estimated line height for sizing
const HORIZONTAL_PADDING = 30;
const VERTICAL_PADDING = 20;
const MIN_NODE_WIDTH = 120;
const MIN_NODE_HEIGHT = 50;
const IO_SKEW = 20; // Must match the visual skew in FlowchartPanel.tsx
const DUMMY_NODE_SIZE = 0.1;

// --- AST Visitor for Flowchart Generation ---

class FlowchartAstVisitor {
    private nodes: FlowchartNode[] = [];
    private edges: FlowchartEdge[] = [];
    private nodeCounter = 0;
    private currentSubroutineEndNodeId: string | null = null;

    private createNode(type: FlowchartNode['type'], label: string, options: { width?: number; height?: number } = {}): FlowchartNode {
        const node: FlowchartNode = {
            id: `node-${this.nodeCounter++}`,
            type,
            label,
            width: options.width,
            height: options.height,
        };

        // If dimensions aren't provided (i.e., not a dummy node), calculate them.
        if (options.width === undefined || options.height === undefined) {
            const lines = label.split('\n');
            const maxLength = lines.reduce((max, line) => Math.max(max, line.length), 0);

            let width = Math.max(MIN_NODE_WIDTH, maxLength * CHAR_WIDTH + HORIZONTAL_PADDING);
            let height = Math.max(MIN_NODE_HEIGHT, lines.length * LINE_HEIGHT + VERTICAL_PADDING);
            
            // Adjust size for specific shapes to better contain text
            if (type === 'decision') {
                width += 40; // Diamonds need more horizontal space for the same text
            } else if (type === 'io') {
                width += IO_SKEW; // Parallelograms have skewed sides
            }

            node.width = width;
            node.height = height;
        }

        this.nodes.push(node);
        return node;
    }

    private addEdge(from: string, to: string, label?: string) {
        if (!from || !to) return;
        this.edges.push({ from, to, label });
    }

    private expressionToString(expr: Expression): string {
        switch(expr.type) {
            case NodeType.LITERAL:
                return typeof (expr as Literal).value === 'string' ? `"${(expr as Literal).value}"` : String((expr as Literal).value);
            case NodeType.IDENTIFIER:
                return (expr as Identifier).name;
            case NodeType.ARRAY_ACCESS:
                const aa = expr as ArrayAccess;
                return `${this.expressionToString(aa.array)}[${this.expressionToString(aa.index)}]`;
            case NodeType.BINARY_EXPRESSION:
                const be = expr as BinaryExpression;
                return `${this.expressionToString(be.left)} ${be.operator} ${this.expressionToString(be.right)}`;
            case NodeType.UNARY_EXPRESSION:
                const ue = expr as UnaryExpression;
                return `${ue.operator} ${this.expressionToString(ue.right)}`;
            case NodeType.GROUPING:
                return `(${this.expressionToString((expr as Grouping).expression)})`;
            case NodeType.FUNCTION_CALL:
                const fc = expr as FunctionCall;
                const args = fc.args.map(arg => this.expressionToString(arg)).join(', ');
                return `Call ${fc.callee}(${args})`;
            default:
                return "expr";
        }
    }

    build(ast: Statement[]): FlowchartData {
        const modules = ast.filter(s => s.type === NodeType.MODULE_STATEMENT) as ModuleStatement[];
        const functions = ast.filter(s => s.type === NodeType.FUNCTION_DECLARATION) as FunctionDeclaration[];
        const topLevelStatements = ast.filter(s => s.type !== NodeType.MODULE_STATEMENT && s.type !== NodeType.FUNCTION_DECLARATION);

        if (modules.length === 0 && functions.length === 0 && topLevelStatements.length === 0) {
            return { nodes: [], edges: [] };
        }

        // Determine and generate flowchart for the main execution path
        const mainModule = modules.find(m => m.name.toLowerCase() === 'main');
        if (mainModule) {
            const startNode = this.createNode('start', 'Start Main');
            const lastNodeId = this.visitBlock(mainModule.body, startNode.id);
            if (lastNodeId) {
                const endNode = this.createNode('end', 'End Main');
                this.addEdge(lastNodeId, endNode.id);
            }
        } else if (modules.length > 0) {
            throw new InterpreterError("A 'main' module is required to generate a flowchart when modules are defined.", 1);
        } else if (topLevelStatements.length > 0) {
            const startNode = this.createNode('start', 'Start');
            const lastNodeId = this.visitBlock(topLevelStatements, startNode.id);
            if (lastNodeId) {
                const endNode = this.createNode('end', 'End');
                this.addEdge(lastNodeId, endNode.id);
            }
        }

        // Generate flowcharts for all other modules
        const otherModules = modules.filter(m => m.name.toLowerCase() !== 'main');
        for (const mod of otherModules) {
            const startNode = this.createNode('start', `Start ${mod.name}`);
            const lastNodeId = this.visitBlock(mod.body, startNode.id);
             if (lastNodeId) {
                const endNode = this.createNode('end', `End ${mod.name}`);
                this.addEdge(lastNodeId, endNode.id);
            }
        }

        // Generate flowcharts for all functions
        for (const func of functions) {
            const startNode = this.createNode('start', `Start Function ${func.name}`);
            const endNode = this.createNode('end', `End Function ${func.name}`);
            this.currentSubroutineEndNodeId = endNode.id;
            const lastNodeId = this.visitBlock(func.body, startNode.id);
            if (lastNodeId) { // Connect the end of the main path if it doesn't have a return
                this.addEdge(lastNodeId, endNode.id);
            }
            this.currentSubroutineEndNodeId = null;
        }

        return { nodes: this.nodes, edges: this.edges };
    }

    private visitBlock(statements: Statement[], entryId: string, entryLabel?: string): string {
        let currentId = entryId;
        for (const stmt of statements) {
            if (!currentId) break; // Path was terminated by a return statement
            const nextId = this.visit(stmt, currentId, entryLabel);
            currentId = nextId;
            entryLabel = undefined; // Label only applies to the first edge
        }
        return currentId;
    }

    private visit(stmt: Statement, incomingId: string, edgeLabel?: string): string {
        switch (stmt.type) {
            case NodeType.VARIABLE_DECLARATION: {
                const s = stmt as VariableDeclaration;
                const labels = s.declarations.map(d => {
                    const sizeStr = d.size ? `[${this.expressionToString(d.size)}]` : '';
                    return `Declare ${s.dataType} ${d.identifier}${sizeStr}`;
                });
                const node = this.createNode('process', labels.join('\n'));
                this.addEdge(incomingId, node.id, edgeLabel);
                return node.id;
            }
            case NodeType.ASSIGNMENT: {
                const s = stmt as Assignment;
                const node = this.createNode('process', `Set ${this.expressionToString(s.lvalue)} = ${this.expressionToString(s.value)}`);
                this.addEdge(incomingId, node.id, edgeLabel);
                return node.id;
            }
            case NodeType.DISPLAY_STATEMENT: {
                const s = stmt as DisplayStatement;
                const valueStr = s.values.map(v => v.type === NodeType.TAP_MARKER ? '"    "' : this.expressionToString(v as Expression)).join(', ');
                const node = this.createNode('io', `Display ${valueStr}`);
                this.addEdge(incomingId, node.id, edgeLabel);
                return node.id;
            }
            case NodeType.INPUT_STATEMENT: {
                const s = stmt as InputStatement;
                const node = this.createNode('io', `Input ${s.identifier}`);
                this.addEdge(incomingId, node.id, edgeLabel);
                return node.id;
            }
             case NodeType.IF_STATEMENT: {
                const s = stmt as IfStatement;
                const conditionNode = this.createNode('decision', this.expressionToString(s.condition));
                this.addEdge(incomingId, conditionNode.id, edgeLabel);

                const trueBranchEndId = this.visitBlock(s.thenBranch, conditionNode.id, 'True');

                let falseBranchEndId: string | undefined;
                if (s.elseBranch && s.elseBranch.length > 0) {
                    falseBranchEndId = this.visitBlock(s.elseBranch, conditionNode.id, 'False');
                } else {
                    falseBranchEndId = conditionNode.id;
                }
                
                const mergeNode = this.createNode('process', '', { width: DUMMY_NODE_SIZE, height: DUMMY_NODE_SIZE });
                
                this.addEdge(trueBranchEndId, mergeNode.id);
                this.addEdge(falseBranchEndId, mergeNode.id, !s.elseBranch || s.elseBranch.length === 0 ? 'False' : undefined);

                return mergeNode.id;
            }
            case NodeType.WHILE_STATEMENT: {
                const s = stmt as WhileStatement;
                const conditionNode = this.createNode('decision', this.expressionToString(s.condition));
                this.addEdge(incomingId, conditionNode.id, edgeLabel);

                const loopBodyEndId = this.visitBlock(s.body, conditionNode.id, 'True');
                this.addEdge(loopBodyEndId, conditionNode.id); // Loop back

                return conditionNode.id; // Exit point is the 'False' branch of the condition
            }
            case NodeType.DO_WHILE_STATEMENT: {
                 const s = stmt as DoWhileStatement;
                 const bodyStartNode = this.createNode('process', '', { width: DUMMY_NODE_SIZE, height: DUMMY_NODE_SIZE });
                 this.addEdge(incomingId, bodyStartNode.id, edgeLabel);

                 const bodyEndId = this.visitBlock(s.body, bodyStartNode.id);
                 const conditionNode = this.createNode('decision', this.expressionToString(s.condition));
                 this.addEdge(bodyEndId, conditionNode.id);
                 this.addEdge(conditionNode.id, bodyStartNode.id, 'True'); // Loop back to body start

                 return conditionNode.id; // Exit point is 'False' branch
            }
            case NodeType.DO_UNTIL_STATEMENT: {
                 const s = stmt as DoUntilStatement;
                 const bodyStartNode = this.createNode('process', '', { width: DUMMY_NODE_SIZE, height: DUMMY_NODE_SIZE });
                 
                 this.addEdge(incomingId, bodyStartNode.id, edgeLabel);
                 
                 const bodyEndId = this.visitBlock(s.body, bodyStartNode.id);
                 const conditionNode = this.createNode('decision', this.expressionToString(s.condition));
                 this.addEdge(bodyEndId, conditionNode.id);
                 this.addEdge(conditionNode.id, bodyStartNode.id, 'False'); // Loop back
                 
                 return conditionNode.id; // Exit point is 'True' branch
            }
            case NodeType.FOR_STATEMENT: {
                const s = stmt as ForStatement;
                const initNode = this.createNode('process', `Set ${s.identifier} = ${this.expressionToString(s.start)}`);
                this.addEdge(incomingId, initNode.id, edgeLabel);

                const conditionNode = this.createNode('decision', `${s.identifier} <= ${this.expressionToString(s.end)}`);
                this.addEdge(initNode.id, conditionNode.id);

                const incrementNode = this.createNode('process', `Set ${s.identifier} = ${s.identifier} + 1`);
                
                const loopBodyEndId = this.visitBlock(s.body, conditionNode.id, 'True');
                this.addEdge(loopBodyEndId, incrementNode.id);
                this.addEdge(incrementNode.id, conditionNode.id); // Loop back

                return conditionNode.id; // Exit point is the 'False' branch of the condition
            }
            case NodeType.CALL_STATEMENT: {
                const s = stmt as CallStatement;
                const node = this.createNode('process', `Call Module:\n${s.name}`);
                this.addEdge(incomingId, node.id, edgeLabel);
                return node.id;
            }
            case NodeType.RETURN_STATEMENT: {
                const s = stmt as ReturnStatement;
                const returnLabel = `Return ${this.expressionToString(s.value)}`;
                const node = this.createNode('process', returnLabel);
                this.addEdge(incomingId, node.id, edgeLabel);
                if (this.currentSubroutineEndNodeId) {
                    this.addEdge(node.id, this.currentSubroutineEndNodeId);
                }
                return ''; // Terminate this path
            }
            case NodeType.MODULE_STATEMENT:
            case NodeType.FUNCTION_DECLARATION:
                 return incomingId;
            default:
                const unhandledNode = this.createNode('process', `// Unsupported: ${stmt.type}`);
                this.addEdge(incomingId, unhandledNode.id, edgeLabel);
                return unhandledNode.id;
        }
    }
}

export function generateFlowchartData(code: string): FlowchartData {
    const lexer = new Lexer(code);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    const ast = parser.parse();

    const visitor = new FlowchartAstVisitor();
    return visitor.build(ast);
}
