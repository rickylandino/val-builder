import '@testing-library/jest-dom';

// Polyfill for Radix UI Select in JSDOM
if (!HTMLElement.prototype.hasPointerCapture) {
	HTMLElement.prototype.hasPointerCapture = () => false;
}

// Polyfill scrollIntoView for Radix Select
if (!HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = function() {};
}
