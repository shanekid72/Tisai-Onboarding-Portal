export const downloadFile = (filePath: string, fileName: string) => {
  // Create a link element
  const link = document.createElement('a');
  link.href = filePath;
  link.download = fileName;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const handleMCPDownload = () => {
  downloadFile('/mcp.json', 'MCP.json');
}; 