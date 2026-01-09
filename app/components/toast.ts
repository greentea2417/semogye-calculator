type ToastPayload = { message: string };
const EVENT = "semogye:toast";

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent<ToastPayload>(EVENT, { detail: { message } }));
}

export function getToastEventName() {
  return EVENT;
}
