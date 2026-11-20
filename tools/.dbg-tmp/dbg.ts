import { caranguejim } from '../models/criaturas/035-caranguejim';
import * as THREE from 'three';
const rig = caranguejim.build();
const b = rig.bones as any;
rig.root?.updateMatrixWorld?.(true);
for (const n of ['corpo','pinca_e','garra_e','dedo_e','pedunculo_e','olho_e']) { const v = new THREE.Vector3(); b[n]?.getWorldPosition(v); console.log(n, v.toArray().map(x=>x.toFixed(2)), b[n]?.rotation.toArray().slice(0,3).map((x:number)=>x.toFixed(2))); }
