const packageJson = require('../../../../package.json');

export const environment = {
  appName: 'Chartfolio',
  envName: 'DEV',
  production: false,
  test: false,
  i18nPrefix: '',
  apiUrl: 'http://localhost:3000/api',
  authUrl: 'http://localhost:3000/auth',
  versions: {
    app: packageJson.version,
    angular: packageJson.dependencies['@angular/core'],
    ngrx: packageJson.dependencies['@ngrx/store'],
    material: packageJson.dependencies['@angular/material'],
    bootstrap: packageJson.dependencies.bootstrap,
    rxjs: packageJson.dependencies.rxjs,
    ngxtranslate: packageJson.dependencies['@ngx-translate/core'],
    angularCli: packageJson.devDependencies['@angular/cli'],
    typescript: packageJson.devDependencies['typescript'],
    cypress: packageJson.devDependencies['cypress']
  }
};
