/**
 * A simple implementation of qs.parse and qs.stringify
 * Handles basic query string parsing/stringifying
 */
export function qs_parse(str: string, options: { ignoreQueryPrefix?: boolean } = {}): Record<string, any> {
  if (typeof str !== 'string') {
    return {};
  }

  let queryString = str.trim();
  
  if (options.ignoreQueryPrefix) {
    if (queryString.length > 0 && queryString.charAt(0) === '?') {
      queryString = queryString.substring(1);
    }
  }

  if (queryString === '') {
    return {};
  }

  const pairs = queryString.split('&');
  const result: Record<string, any> = {};

  for (const pair of pairs) {
    if (!pair) continue;
    
    const parts = pair.split('=');
    const key = decodeURIComponent(parts[0]);
    // If no value is present (e.g., "foo"), value is empty string or null? 
    // qs default behavior for "foo" is "foo": "" (empty string)
    const value = parts.length > 1 ? decodeURIComponent(parts.slice(1).join('=')) : '';

    result[key] = value;
  }

  return result;
}

export function qs_stringify(obj: Record<string, any>): string {
  if (!obj || typeof obj !== 'object') {
    return '';
  }

  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return '';
  }

  return keys.map(key => {
    const value = obj[key];
    if (value === undefined) {
      return '';
    }
    if (value === null) {
        return encodeURIComponent(key) + '=';
    }
    return encodeURIComponent(key) + '=' + encodeURIComponent(String(value));
  }).filter(item => item !== '').join('&');
}

// export default {
//   qs_parse: parse,
//   qs_stringify: stringify,
// };
