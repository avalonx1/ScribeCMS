/**
 * Checklist & Task-list Helper for Google Keep-style Sticky Notes
 * Supports hybrid notes (free text + checklist items + free text)
 */

/**
 * Check if content contains any checklist items (- [ ] or - [x])
 */
export function hasChecklist(content) {
  if (!content) return false;
  return /^\s*[-*]?\s*\[[ xX]\]/m.test(content);
}

/**
 * Parses note content into structured lines for rendering
 */
export function parseNoteContent(content) {
  if (!content) return [];
  const lines = content.split('\n');
  return lines.map((line, index) => {
    const match = line.match(/^(\s*[-*]?\s*)\[([ xX])\]\s*(.*)$/);
    if (match) {
      return {
        type: 'todo',
        checked: match[2].toLowerCase() === 'x',
        prefix: match[1],
        text: match[3],
        lineIndex: index,
        originalLine: line
      };
    }
    return {
      type: 'text',
      text: line,
      lineIndex: index,
      originalLine: line
    };
  });
}

/**
 * Get checklist statistics (e.g. 2 of 5 completed)
 */
export function getChecklistStats(content) {
  const items = parseNoteContent(content).filter(item => item.type === 'todo');
  const total = items.length;
  const completed = items.filter(item => item.checked).length;
  return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

/**
 * Toggles a checklist item at a specific line index in the markdown text
 */
export function toggleChecklistAtLine(content, lineIndex) {
  if (!content) return content;
  const lines = content.split('\n');
  if (lineIndex < 0 || lineIndex >= lines.length) return content;

  const line = lines[lineIndex];
  const match = line.match(/^(\s*[-*]?\s*)\[([ xX])\](\s*.*)$/);
  if (match) {
    const isChecked = match[2].toLowerCase() === 'x';
    const newCheckbox = isChecked ? '[ ]' : '[x]';
    lines[lineIndex] = `${match[1]}${newCheckbox}${match[3]}`;
  }
  return lines.join('\n');
}

/**
 * Inserts a checklist item at cursor position or appends to content
 */
export function insertChecklist(content = '', cursorStart, cursorEnd) {
  if (cursorStart !== undefined && cursorEnd !== undefined) {
    const before = content.substring(0, cursorStart);
    const after = content.substring(cursorEnd);
    
    const prefix = (before.length === 0 || before.endsWith('\n')) ? '- [ ] ' : '\n- [ ] ';
    const newContent = before + prefix + after;
    const newCursor = before.length + prefix.length;
    return { content: newContent, cursor: newCursor };
  }

  const prefix = (content.length === 0 || content.endsWith('\n')) ? '- [ ] ' : '\n- [ ] ';
  return { content: content + prefix, cursor: content.length + prefix.length };
}

/**
 * Handles smart Enter key press inside a textarea
 * Automatically creates next checklist item on Enter, or removes on empty item
 */
export function handleSmartEnter(e, content, setContent) {
  if (e.key !== 'Enter' || e.shiftKey) return false;

  const target = e.target;
  const start = target.selectionStart;
  const beforeCursor = content.substring(0, start);
  const afterCursor = content.substring(start);

  const lastNewlineIndex = beforeCursor.lastIndexOf('\n');
  const currentLine = lastNewlineIndex === -1 ? beforeCursor : beforeCursor.substring(lastNewlineIndex + 1);

  const match = currentLine.match(/^(\s*[-*]?\s*\[[ xX]\])\s*(.*)$/);
  if (match) {
    e.preventDefault();
    const itemContent = match[2].trim();

    if (itemContent.length > 0) {
      // Continue next checklist item
      const insertion = '\n- [ ] ';
      const newContent = beforeCursor + insertion + afterCursor;
      setContent(newContent);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + insertion.length;
      }, 0);
      return true;
    } else {
      // Empty checklist item: cancel checklist format and make empty line
      const lineStart = lastNewlineIndex === -1 ? 0 : lastNewlineIndex + 1;
      const newBefore = content.substring(0, lineStart);
      const newContent = newBefore + afterCursor;
      setContent(newContent);

      setTimeout(() => {
        target.selectionStart = target.selectionEnd = lineStart;
      }, 0);
      return true;
    }
  }

  return false;
}
