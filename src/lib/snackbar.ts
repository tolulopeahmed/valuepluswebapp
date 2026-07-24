// Tiny pub-sub so plain modules (like api.ts, which isn't a component
// and can't call useContext) can trigger snackbar UI. SnackbarProvider
// is the sole subscriber — it registers itself on mount.
export type SnackbarType = "success" | "error";
type Listener = (text: string, type: SnackbarType) => void;

let listener: Listener | null = null;

export function setSnackbarListener(fn: Listener | null) {
  listener = fn;
}

export function notify(text: string, type: SnackbarType = "success") {
  listener?.(text, type);
}
