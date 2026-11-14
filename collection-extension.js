// Deep exhibits and source-only registration records have different scopes.
import {additions as eastWorks,catalog as eastRegister} from './collection-east.js';
import {additions as mogaoWorks,catalog as mogaoRegister} from './collection-mogao.js';
import {additions as maijiWorks,catalog as maijiRegister} from './collection-maiji.js';
import {print} from './collection-documents.js';
import {additions as westHighlights} from './collection-highlights-west.js';
import {additions as eastHighlights} from './collection-highlights-east.js';
import {additions as maijiHighlights} from './collection-highlights-maiji.js';
import {editionWorks} from './assets/collection-edition/index.js';
export const additions=[...eastWorks,...mogaoWorks,...maijiWorks,print,...[...westHighlights,...eastHighlights,...maijiHighlights].map(s=>({...s,newAcquisition:true})),...editionWorks];
export const catalog=[...eastRegister,...mogaoRegister,...maijiRegister];
