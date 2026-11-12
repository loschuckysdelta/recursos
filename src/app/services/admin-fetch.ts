import { environment } from '../../environments/environment';

let key = '';
let pending: Promise<string> | undefined;

function askForKey(): Promise<string> {
  if (pending) return pending;
  pending = new Promise<string>((resolve, reject) => {
    const dialog = document.createElement('dialog');
    dialog.setAttribute('aria-label', 'Acceso administrativo');
    dialog.innerHTML = `<form method="dialog"><label>Clave de acceso al panel
      <input type="password" required autocomplete="off" autofocus></label>
      <button value="enter">Acceder</button>
      <button value="cancel" formnovalidate>Cancelar</button></form>`;
    const input = dialog.querySelector('input')!;
    dialog.addEventListener('close', () => {
      const entered = input.value.trim();
      dialog.remove();
      pending = undefined;
      if (dialog.returnValue !== 'enter' || !entered) {
        reject(new Error('Se necesita la clave del panel.'));
        return;
      }
      key = entered;
      resolve(key);
    }, {once: true});
    document.body.append(dialog);
    dialog.showModal();
  });
  return pending;
}

export async function adminFetch(path: string, options: RequestInit = {}) {
  if (!path.startsWith('/admin/')) throw new Error('Ruta administrativa inválida.');
  if (environment.useLocalAdminProxy) return fetch('/api' + path, options);
  const url = new URL(environment.apiBackend.replace(/\/$/, '') + path);
  if (url.protocol !== 'https:') throw new Error('La API del panel requiere HTTPS.');
  const supplied = key || await askForKey();
  const headers = new Headers(options.headers);
  headers.set('x-panel-users-key', supplied);
  const response = await fetch(url, { ...options, headers, redirect: 'error', cache: 'no-store' });
  if (response.status === 403) {
    if (key === supplied) key = '';
    throw new Error('Acceso denegado. Verifica la clave del panel y vuelve a intentar.');
  }
  return response;
}
