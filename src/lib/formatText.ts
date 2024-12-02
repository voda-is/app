function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function formatResponse(response: string): string {
  const formattedParts: string[] = [];
  
  // Remove asterisks and trim
  const cleanResponse = response.replace(/\*/g, '').trim();
  let startPos = 0;
  let inQuotes = false;
  
  // Process the string character by character
  for (let i = 0; i < cleanResponse.length; i++) {
    if (cleanResponse[i] === '"') {
      if (inQuotes) {
        // Include the closing quote in the current segment
        const text = cleanResponse.slice(startPos, i + 1).trim();
        if (text) {
          formattedParts.push(`<b>${escapeHtml(text)}</b>`);
        }
        startPos = i + 1;
      } else {
        // Handle text before the opening quote
        const text = cleanResponse.slice(startPos, i).trim();
        if (text) {
          formattedParts.push(`<i class="text-gray-300">${escapeHtml(text)}</i>`);
        }
        startPos = i;
      }
      inQuotes = !inQuotes;
    }
  }
  
  // Handle remaining text
  const remaining = cleanResponse.slice(startPos).trim();
  if (remaining) {
    formattedParts.push(`<i class="text-gray-300">${escapeHtml(remaining)}</i>`);
  }
  
  return formattedParts.join('\n\n');
}

export function replacePlaceholders(text: string, characterName: string, userName: string): string {
  return text.replace(/{{char}}/g, characterName).replace(/{{user}}/g, userName);
} 