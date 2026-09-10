/** OrbitControls can update *inside* the wheel event, before our render loop runs. */
export function bindControlInvalidation(
  controls: {
    addEventListener: (type: 'change', listener: () => void) => void
    removeEventListener: (type: 'change', listener: () => void) => void
  },
  invalidate: () => void,
) {
  controls.addEventListener('change', invalidate)
  return () => controls.removeEventListener('change', invalidate)
}
