import { writable } from 'svelte/store';

export const activeSection = writable('hero');

export function gotoSection(id) {
  if (typeof document === 'undefined') return;
  activeSection.set(id);
  const el = document.getElementById(id);
  if (el) {
    window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' });
  }
}
