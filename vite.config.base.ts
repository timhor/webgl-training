import { defineConfig, type UserConfig, type Plugin } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';

const redirectToDir = ({ root }: { root: string }): Plugin => ({
  name: 'redirect-to-dir',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      if (req.url === '/') {
        res.writeHead(302, {
          Location: `/${root}/`,
        });
        res.end();
        return;
      }

      return next();
    });
  },
});

export function defineViteConfig(
  rootDirectory: string,
  config?: UserConfig
): UserConfig {
  return defineConfig({
    ...config,
    plugins: [
      redirectToDir({ root: rootDirectory }),
      EnvironmentPlugin(
        {
          APP_ROOT: rootDirectory,
        },
        { defineOn: 'import.meta.env' }
      ),
      ...(config?.plugins ?? []),
    ],
    build: {
      ...config?.build,
      emptyOutDir: true,
      rollupOptions: {
        ...config?.build?.rollupOptions,
        input: {
          app: `./${rootDirectory}/index.html`,
        },
      },
    },
  });
}
