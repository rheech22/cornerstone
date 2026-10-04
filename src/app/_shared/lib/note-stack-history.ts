// Stacked `?n=` panels live only in the client, so the note stack listens for this
// alongside `popstate` when something outside it changes the stack URL.
export const NOTE_STACK_HISTORY_EVENT = 'note-stack:history';

export const pushNoteStackHistory = (url: string) => {
  window.history.pushState(null, '', url);
  window.dispatchEvent(new Event(NOTE_STACK_HISTORY_EVENT));
};
