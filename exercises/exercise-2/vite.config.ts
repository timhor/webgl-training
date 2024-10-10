import path from 'node:path';

import { defineViteConfig } from '../../vite.config.base';

export default defineViteConfig(path.relative(process.cwd(), __dirname));
