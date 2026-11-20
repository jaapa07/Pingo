// substituto de node:fs no navegador: tools/equilibrio-referencia.ts só usa readdirSync em carregarDados (não chamado na página)
export const readdirSync = () => [];
