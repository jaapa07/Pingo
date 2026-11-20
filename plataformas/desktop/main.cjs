/**
 * Adventures of Pingo — processo principal do Electron (PC: Windows, Linux, macOS).
 *
 * - Serve o `dist/` empacotado por um protocolo próprio (`pingo://jogo/`), com origem fixa: o
 *   Chromium trata a página como segura, `fetch` funciona e nada sai do pacote.
 * - Nenhuma rede: todo pedido que não seja `pingo:` (ou as ferramentas do próprio Chromium) é cancelado.
 * - Renderer isolado: `contextIsolation`, sem Node, `sandbox`; a única ponte é o `preload.cjs`.
 * - Save: um arquivo JSON por chave em `<dados do usuário>/saves/`, gravado de forma atômica
 *   (arquivo temporário + rename) e com a cópia anterior em `.bak`.
 * - Janela 1280×720 de conteúdo (escala inteira 4× da tela 320×180), redimensionável;
 *   F11 ou Alt+Enter alternam a tela cheia.
 */
'use strict';
const { app, BrowserWindow, Menu, dialog, ipcMain, net, protocol, session, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ESQUEMA = 'pingo';
const ORIGEM = `${ESQUEMA}://jogo`;
const NOME = 'Adventures of Pingo';
// este arquivo fica em <raiz>/plataformas/desktop/ tanto no código quanto dentro do pacote (app.asar)
const RAIZ_JOGO = path.resolve(__dirname, '..', '..', 'dist');
const ICONE = path.join(__dirname, 'icone.png');
// só o que vem do próprio pacote; estilos inline são usados pela interface (atributos style)
const CSP = [
  "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob:",
  "font-src 'self' data:", "media-src 'self' data: blob:", "connect-src 'self' data: blob:", "worker-src 'self' blob:",
  "object-src 'none'", "base-uri 'none'", "form-action 'none'", "frame-src 'none'",
].join('; ');

app.setName(NOME);
// pasta de dados própria e estável (Windows: %APPDATA%\Adventures of Pingo; Linux: ~/.config/Adventures of Pingo;
// macOS: ~/Library/Application Support/Adventures of Pingo). PINGO_DADOS troca a pasta (testes).
if (process.env.PINGO_DADOS) app.setPath('userData', path.resolve(process.env.PINGO_DADOS));
const PASTA_SAVES = () => path.join(app.getPath('userData'), 'saves');

protocol.registerSchemesAsPrivileged([
  { scheme: ESQUEMA, privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]);

/* ------------------------------ save em arquivo ------------------------------ */
const chaveValida = (k) => typeof k === 'string' && /^[a-z0-9._-]{1,64}$/i.test(k);
const arquivoDe = (k) => path.join(PASTA_SAVES(), k + '.json');

function lerSave(k) {
  if (!chaveValida(k)) return null;
  for (const f of [arquivoDe(k), arquivoDe(k) + '.bak']) {
    try { return JSON.parse(fs.readFileSync(f, 'utf8')).valor ?? null; } catch { /* ausente ou corrompido: tenta a cópia */ }
  }
  return null;
}
function gravarSave(k, v) {
  if (!chaveValida(k) || typeof v !== 'string') return;
  fs.mkdirSync(PASTA_SAVES(), { recursive: true });
  const f = arquivoDe(k), tmp = f + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify({ chave: k, quando: new Date().toISOString(), valor: v }));
  try { if (fs.existsSync(f)) fs.copyFileSync(f, f + '.bak'); } catch { /* sem cópia anterior */ }
  fs.renameSync(tmp, f);
}
function apagarSave(k) {
  if (!chaveValida(k)) return;
  for (const f of [arquivoDe(k), arquivoDe(k) + '.bak']) { try { fs.rmSync(f, { force: true }); } catch { /* já não existe */ } }
}

/* ------------------------------ janela ------------------------------ */
let janela = null;
const alternarTelaCheia = (ligar) => { if (janela) janela.setFullScreen(typeof ligar === 'boolean' ? ligar : !janela.isFullScreen()); };

function montarMenu() {
  const mac = process.platform === 'darwin';
  const modelo = [
    ...(mac ? [{ label: NOME, submenu: [{ role: 'about', label: 'Sobre ' + NOME }, { type: 'separator' }, { role: 'hide', label: 'Ocultar' }, { role: 'quit', label: 'Sair' }] }] : []),
    {
      label: 'Jogo',
      submenu: [
        { label: 'Tela cheia', accelerator: 'F11', click: () => alternarTelaCheia() },
        { label: 'Abrir pasta dos saves', click: () => { fs.mkdirSync(PASTA_SAVES(), { recursive: true }); void shell.openPath(PASTA_SAVES()); } },
        { type: 'separator' },
        { label: 'Sair', accelerator: mac ? 'Cmd+Q' : 'Ctrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: 'Ajuda',
      submenu: [{
        label: 'Sobre',
        click: () => void dialog.showMessageBox(janela, { type: 'info', title: 'Sobre', message: NOME, detail: `Versão ${app.getVersion()}\nRPG de captura em pixel art. Funciona sem internet.\nSaves em: ${PASTA_SAVES()}` }),
      }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(modelo));
}

function criarJanela() {
  janela = new BrowserWindow({
    width: 1280, height: 720, useContentSize: true, minWidth: 320, minHeight: 180,
    resizable: true, backgroundColor: '#211824', title: NOME, icon: ICONE, show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true,
      spellcheck: false, devTools: !app.isPackaged || !!process.env.PINGO_DEVTOOLS,
    },
  });
  janela.once('ready-to-show', () => janela.show());
  // nada de navegar para fora do jogo nem abrir janelas novas
  janela.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(ORIGEM + '/')) e.preventDefault(); });
  janela.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  // Alt+Enter: tela cheia (e não chega ao jogo como "Enter")
  janela.webContents.on('before-input-event', (e, ent) => {
    if (ent.type === 'keyDown' && ent.alt && (ent.key === 'Enter' || ent.code === 'Enter' || ent.code === 'NumpadEnter')) { e.preventDefault(); alternarTelaCheia(); }
  });
  janela.on('closed', () => { janela = null; });
  void janela.loadURL(ORIGEM + '/index.html');
}

/* ------------------------------ ciclo de vida ------------------------------ */
if (!app.requestSingleInstanceLock()) {
  // um só jogo aberto por vez: dois processos gravando o mesmo save se atropelariam
  app.quit();
} else {
  app.on('second-instance', () => { if (janela) { if (janela.isMinimized()) janela.restore(); janela.focus(); } });

  app.whenReady().then(() => {
    const ses = session.defaultSession;
    // protocolo do jogo: só arquivos de dentro de dist/
    protocol.handle(ESQUEMA, (req) => {
      const u = new URL(req.url);
      const rel = decodeURIComponent(u.pathname).replace(/^\/+/, '') || 'index.html';
      const alvo = path.resolve(RAIZ_JOGO, rel);
      if (u.host !== 'jogo' || (alvo !== RAIZ_JOGO && !alvo.startsWith(RAIZ_JOGO + path.sep))) return new Response('proibido', { status: 403 });
      return net.fetch(pathToFileURL(alvo).toString()).then((r) => {
        if (!/\.html?$/i.test(alvo) || !r.ok) return r;
        const h = new Headers(r.headers); h.set('Content-Security-Policy', CSP); h.set('Content-Type', 'text/html; charset=utf-8');
        return new Response(r.body, { status: r.status, headers: h });
      });
    });
    // sem rede: só o protocolo do jogo, os arquivos de dist/ que ele mesmo lê e as ferramentas internas do Chromium
    const DIST_URL = pathToFileURL(RAIZ_JOGO).toString() + '/';
    ses.webRequest.onBeforeRequest((det, cb) => {
      const ok = /^(pingo|devtools|chrome-extension|data|blob):/.test(det.url) || det.url.startsWith(DIST_URL);
      cb({ cancel: !ok });
    });
    ses.setPermissionRequestHandler((_wc, perm, cb) => cb(perm === 'fullscreen' || perm === 'clipboard-sanitized-write'));
    ses.setPermissionCheckHandler((_wc, perm) => perm === 'fullscreen' || perm === 'clipboard-sanitized-write');

    ipcMain.handle('pingo:lerSave', (_e, k) => lerSave(k));
    ipcMain.handle('pingo:gravarSave', (_e, k, v) => gravarSave(k, v));
    ipcMain.handle('pingo:apagarSave', (_e, k) => apagarSave(k));
    ipcMain.handle('pingo:salvarArquivo', async (_e, nome, conteudo) => {
      if (typeof conteudo !== 'string') return false;
      const r = await dialog.showSaveDialog(janela, {
        title: 'Exportar save', defaultPath: path.join(app.getPath('documents'), path.basename(String(nome || 'pingo.pingo'))),
        filters: [{ name: 'Save do Pingo', extensions: ['pingo'] }],
      });
      if (r.canceled || !r.filePath) return false;
      fs.writeFileSync(r.filePath, conteudo, 'utf8');
      return true;
    });
    ipcMain.handle('pingo:abrirArquivo', async () => {
      const r = await dialog.showOpenDialog(janela, { title: 'Importar save', properties: ['openFile'], filters: [{ name: 'Save do Pingo', extensions: ['pingo', 'txt'] }] });
      if (r.canceled || !r.filePaths[0]) return null;
      const f = r.filePaths[0];
      if (fs.statSync(f).size > 8 * 1024 * 1024) return null;
      return fs.readFileSync(f, 'utf8');
    });
    ipcMain.on('pingo:telaCheia', (_e, ligar) => alternarTelaCheia(!!ligar));
    ipcMain.on('pingo:sair', () => app.quit());

    montarMenu();
    criarJanela();
    app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) criarJanela(); });
  });

  app.on('window-all-closed', () => app.quit());
}
