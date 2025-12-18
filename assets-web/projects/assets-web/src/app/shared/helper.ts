import { mdColors } from '../pages/overview/donut/colors';

export const placeCaretAtEnd = el => {
  el.focus();
  if (typeof window.getSelection != 'undefined' && typeof document.createRange != 'undefined') {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  } else if (typeof document.body['createTextRange'] != 'undefined') {
    const textRange = document.body['createTextRange']();
    textRange.moveToElementText(el);
    textRange.collapse(false);
    textRange.select();
  }
};

export const getCurrencyFormat = (currency: string): string => (currency === 'BTC' ? '0.0-6' : '0.0-2');

export const getColor = (str: string): string => {
  const num = [...str].reduce((acc, curr) => {
    acc += curr.charCodeAt(0);
    return acc;
  }, 0);

  const index = Math.floor(num % mdColors.length);
  return mdColors[index];
};
