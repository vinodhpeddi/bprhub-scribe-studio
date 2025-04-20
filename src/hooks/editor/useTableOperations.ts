
export const useTableOperations = () => {
  const insertTable = (isLayout: boolean = false) => {
    const tableHtml = `
      <table class="${isLayout ? 'layout-table' : ''}" style="${isLayout ? 'border-collapse: collapse; width: 100%;' : ''}">
        <tr>
          <td style="${isLayout ? 'border: none; padding: 8px;' : ''}">&nbsp;</td>
          <td style="${isLayout ? 'border: none; padding: 8px;' : ''}">&nbsp;</td>
        </tr>
        <tr>
          <td style="${isLayout ? 'border: none; padding: 8px;' : ''}">&nbsp;</td>
          <td style="${isLayout ? 'border: none; padding: 8px;' : ''}">&nbsp;</td>
        </tr>
      </table><p></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
  };

  return { insertTable };
};
