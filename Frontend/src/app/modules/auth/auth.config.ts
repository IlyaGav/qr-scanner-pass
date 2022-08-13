import {KeycloakService} from "keycloak-angular";

export function initializeKeycloak(keycloak: KeycloakService) {
  return () => keycloak.init({
    config: {
      url: 'https://qr-code-scanner-access.ru:8443/',
      realm: 'qr-code-scanner-pass',
      clientId: 'angular',
    },
    initOptions: {
      // checkLoginIframe: false,
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri:
        window.location.origin + '/assets/silent-check-sso.html'
    }
  });
}

