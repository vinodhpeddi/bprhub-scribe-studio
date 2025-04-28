
/**
 * Helper functions for DOM operations related to the editor model
 */

// Helper function to find the closest block element
export function findBlockElement(node: Node): HTMLElement | null {
  let current: Node | null = node;
  
  while (current && current.nodeType !== Node.ELEMENT_NODE) {
    current = current.parentNode;
  }
  
  if (!current) return null;
  
  let element = current as HTMLElement;
  
  while (element && !element.getAttribute('data-block-id')) {
    if (element.parentElement) {
      element = element.parentElement;
    } else {
      return null;
    }
  }
  
  return element;
}

// Add any additional DOM-related helper functions here
