
export const useListOperations = () => {
  const handleListIndent = (increase: boolean) => {
    const selection = window.getSelection();
    if (!selection) return;
    
    const listItem = selection.anchorNode?.parentElement?.closest('li');
    if (!listItem) return;
    
    const list = listItem.closest('ol, ul');
    if (!list) return;

    if (increase) {
      const previousSibling = listItem.previousElementSibling;
      if (!previousSibling) return;

      let subList = previousSibling.querySelector('ol, ul');
      if (!subList) {
        subList = document.createElement(list.tagName);
        previousSibling.appendChild(subList);
      }
      subList.appendChild(listItem);
    } else {
      const parentList = list.parentElement?.closest('ol, ul');
      if (!parentList) return;

      const parentItem = list.parentElement;
      if (!parentItem) return;

      parentList.insertBefore(listItem, parentItem.nextSibling);
      if (list.children.length === 0) {
        list.remove();
      }
    }
  };

  return { handleListIndent };
};

