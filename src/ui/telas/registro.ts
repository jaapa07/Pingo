/** Registro das telas de menu e do HUD do mapa (importado pelo main.ts na inicialização). */
import '../../styles/telas.css';
import { registrarTela } from '../telas';
import { criarEquipe } from './equipe';
import { criarResumo } from './resumo';

registrarTela('equipe', criarEquipe);
registrarTela('resumo', criarResumo);
import { criarMochila } from './mochila';
import { criarMenu } from './menu';
import { criarDiario } from './diario';
registrarTela('mochila', criarMochila);
registrarTela('menu', criarMenu);
registrarTela('diario', criarDiario);
import { criarViveiro } from './viveiro';
import { criarInsignias } from './insignias';
import { criarPerfil } from './perfil';
import { criarLoja } from './loja';
import { criarPcQuarto } from './pc-quarto';
registrarTela('viveiro', criarViveiro);
registrarTela('insignias', criarInsignias);
registrarTela('perfil', criarPerfil);
registrarTela('loja', criarLoja);
registrarTela('pc-quarto', criarPcQuarto);
import { criarMapaMundi } from './mapa-mundi';
import { criarCreditos } from './creditos';
registrarTela('mapa-mundi', criarMapaMundi);
registrarTela('creditos', criarCreditos);
import { criarRadio } from './radio';
import { criarFoto } from './foto';
import { criarCinematica } from './cinematica';
import { iniciarHud } from '../hud';
registrarTela('cinematica', criarCinematica);
registrarTela('radio', criarRadio);
registrarTela('foto', criarFoto);
iniciarHud();
/** Gincana de Criaturas e Safári do pós-Liga (spec 10A itens 32 e 33): telas e comandos de roteiro */
import './gincana';
import './gincana-safari';
