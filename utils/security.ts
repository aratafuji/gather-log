import DOMPurify from 'dompurify';

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input);
}

export function validateInput(input: string, maxLength: number = 500): boolean {
  return input.length > 0 && input.length <= maxLength;
}

