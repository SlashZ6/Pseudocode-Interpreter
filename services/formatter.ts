// --- Code Formatter ---

const INDENT_KEYWORDS = /^\s*(Module|Function|If|Do|While|For)\b/i;
const OUTDENT_KEYWORDS = /^\s*(End Module|End Function|End If|End While|End For|Until)\b/i;
const ELSE_KEYWORD = /^\s*Else\b/i;
const INDENTATION = '   '; // 3 spaces

/**
 * Formats a string of pseudocode with proper indentation.
 * @param code The raw pseudocode string.
 * @returns The formatted code string.
 */
export function formatCode(code: string): string {
    const lines = code.split('\n');
    let indentLevel = 0;
    const formattedLines: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
            formattedLines.push('');
            continue;
        }

        if (OUTDENT_KEYWORDS.test(trimmedLine) || ELSE_KEYWORD.test(trimmedLine)) {
            indentLevel = Math.max(0, indentLevel - 1);
        }

        const indentedLine = INDENTATION.repeat(indentLevel) + trimmedLine;
        formattedLines.push(indentedLine);

        if (INDENT_KEYWORDS.test(trimmedLine) || ELSE_KEYWORD.test(trimmedLine)) {
            indentLevel++;
        }
    }

    return formattedLines.join('\n');
}
