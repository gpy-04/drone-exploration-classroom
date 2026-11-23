import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
const local=createRequire(import.meta.url),fallback=path.join(process.env.CODEX_HOME||path.join(os.homedir(),'.codex'),'skills','teardown','package.json');
export function dependency(name){try{return local(name);}catch(error){if(fs.existsSync(fallback))return createRequire(fallback)(name);throw new Error('请先在本项目运行 npm install，安装开发工具。',{cause:error});}}
export function moduleDirectories(){return [path.join(import.meta.dirname,'node_modules'),path.join(path.dirname(fallback),'node_modules')];}
