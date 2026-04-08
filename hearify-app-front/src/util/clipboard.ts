import { successToast } from '@src/toasts/toasts.tsx';

export async function setClipboardText(text: string): Promise<boolean> {
  try {
    // Check if the Clipboard API is supported
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported');
    }

    await navigator.clipboard.writeText(text);

    return true;
  } catch (error) {
    console.error('Error copying text to clipboard:', error);
    return false;
  }
}
