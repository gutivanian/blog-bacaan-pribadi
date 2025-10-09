// lib/highlightUtils.js

/**
 * Get XPath for a DOM node
 */
export function getXPath(node) {
  if (node.id) {
    return `//*[@id="${node.id}"]`;
  }
  
  const paths = [];
  for (; node && node.nodeType === Node.ELEMENT_NODE; node = node.parentNode) {
    let index = 0;
    let sibling = node.previousSibling;
    
    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) {
        index++;
      }
      sibling = sibling.previousSibling;
    }
    
    const tagName = node.nodeName.toLowerCase();
    const pathIndex = index ? `[${index + 1}]` : '';
    paths.unshift(`${tagName}${pathIndex}`);
  }
  
  return paths.length ? `/${paths.join('/')}` : '';
}

/**
 * Get node from XPath
 */
export function getNodeFromXPath(xpath, context = document) {
  try {
    const result = document.evaluate(
      xpath,
      context,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue;
  } catch (error) {
    console.error('Error evaluating XPath:', error);
    return null;
  }
}

/**
 * Get text offset within a container node
 */
export function getTextOffset(container, node, offset) {
  let textOffset = 0;
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let currentNode;
  while ((currentNode = walker.nextNode())) {
    if (currentNode === node) {
      return textOffset + offset;
    }
    textOffset += currentNode.textContent.length;
  }
  
  return textOffset;
}

/**
 * Get position from text offset
 */
export function getPositionFromOffset(container, offset) {
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let currentOffset = 0;
  let currentNode;
  
  while ((currentNode = walker.nextNode())) {
    const nodeLength = currentNode.textContent.length;
    if (currentOffset + nodeLength >= offset) {
      return {
        node: currentNode,
        offset: offset - currentOffset
      };
    }
    currentOffset += nodeLength;
  }
  
  return null;
}

/**
 * Apply highlight to DOM
 */
export function applyHighlight(highlight, container) {
  const { start_offset, end_offset, color, id } = highlight;
  
  const startPos = getPositionFromOffset(container, start_offset);
  const endPos = getPositionFromOffset(container, end_offset);
  
  if (!startPos || !endPos) {
    console.error('Could not find positions for highlight');
    return null;
  }
  
  const range = document.createRange();
  range.setStart(startPos.node, startPos.offset);
  range.setEnd(endPos.node, endPos.offset);
  
  // Create highlight span
  const highlightSpan = document.createElement('mark');
  highlightSpan.className = `highlight highlight-${color}`;
  highlightSpan.dataset.highlightId = id;
  highlightSpan.style.backgroundColor = getHighlightColor(color);
  highlightSpan.style.cursor = 'pointer';
  highlightSpan.style.transition = 'background-color 0.2s';
  
  try {
    range.surroundContents(highlightSpan);
    return highlightSpan;
  } catch (error) {
    console.error('Error applying highlight:', error);
    return null;
  }
}

/**
 * Remove highlight from DOM
 */
export function removeHighlight(highlightId, container) {
  const highlightElement = container.querySelector(`[data-highlight-id="${highlightId}"]`);
  if (highlightElement) {
    const parent = highlightElement.parentNode;
    while (highlightElement.firstChild) {
      parent.insertBefore(highlightElement.firstChild, highlightElement);
    }
    parent.removeChild(highlightElement);
    parent.normalize(); // Merge adjacent text nodes
  }
}

/**
 * Get highlight color
 */
export function getHighlightColor(colorName) {
  const colors = {
    yellow: 'rgba(255, 255, 0, 0.3)',
    green: 'rgba(0, 255, 0, 0.3)',
    blue: 'rgba(0, 191, 255, 0.3)',
    pink: 'rgba(255, 192, 203, 0.3)',
    orange: 'rgba(255, 165, 0, 0.3)',
  };
  return colors[colorName] || colors.yellow;
}

/**
 * Get color label
 */
export function getColorLabel(colorName) {
  const labels = {
    yellow: '🟡 Kuning',
    green: '🟢 Hijau',
    blue: '🔵 Biru',
    pink: '🩷 Pink',
    orange: '🟠 Orange',
  };
  return labels[colorName] || labels.yellow;
}