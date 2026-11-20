/**
 * Ponte entre o jogo (renderer isolado) e o processo principal. Expõe só `window.pingoDesktop`,
 * com a interface `PonteDesktop` de `src/core/plataforma.ts`; nenhum módulo do Node chega à página.
 */
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pingoDesktop', {
  lerSave: (chave) => ipcRenderer.invoke('pingo:lerSave', String(chave)),
  gravarSave: (chave, valor) => ipcRenderer.invoke('pingo:gravarSave', String(chave), String(valor)),
  apagarSave: (chave) => ipcRenderer.invoke('pingo:apagarSave', String(chave)),
  salvarArquivo: (nome, conteudo) => ipcRenderer.invoke('pingo:salvarArquivo', String(nome), String(conteudo)),
  abrirArquivo: () => ipcRenderer.invoke('pingo:abrirArquivo'),
  telaCheia: (ligar) => ipcRenderer.send('pingo:telaCheia', !!ligar),
  sair: () => ipcRenderer.send('pingo:sair'),
});
