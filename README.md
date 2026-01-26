# LPDC (Lokale Producten- en Dienstencatalogus) - Frontend

LPDC Frontend is part of [LPDC - Digitaal loket](https://github.com/lblod/app-lpdc-digitaal-loket/tree/development). This contains general documentation. Specific documentation to be found in this project.

## Environment variables

The [ember-proxy-service](https://github.com/mu-semtech/ember-proxy-service#configure-environment-variables-in-the-frontends-container) docker image (which we use to host the frontend) supports configuring environment variables. The following options are available for the loket image.

### General

| Name              | Description                   |
| ----------------- | ----------------------------- |
| `EMBER_FUSIES`    | Toggle fusies                 |
| `EMBER_IPDC_URL`  | Link to the IPDC application  |
| `EMBER_LOKET_URL` | Link to the Loket application |

### ACM/IDM

| Name                               | Description                                                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EMBER_ACMIDM_CLIENT_ID`           | The unique client id for a specific environment                                                                                                          |
| `EMBER_ACMIDM_AUTH_URL`            | The URL where users will be redirected to when they want to log in                                                                                       |
| `EMBER_ACMIDM_AUTH_REDIRECT_URL`   | The callback URL that ACM/IDM will use after the user logs in successfully                                                                               |
| `EMBER_ACMIDM_LOGOUT_URL`          | The URL where users will be redirected to when they want to log out                                                                                      |
| `EMBER_ACMIDM_SWITCH_REDIRECT_URL` | The URL that will be used when "switching users" is enabled in ACM/IDM. After logout, users can select one of their other accounts to simplify the flow. |
| `EMBER_ADMIN_ROLE`                 | The name of the ACM/IDM admin role as configured in ACM. This role gets administrator privileges and can use impersonation.                              |
| `EMBER_ANNOUNCEMENT_MESSAGE`                 | A text that will be displayed in an announcement banner, eg. to announce down-time                               |

> When ACM/IDM is not configured, the frontend will default to the "mock login" setup instead.
>

## Releases

We use [release-it](https://github.com/release-it/release-it/tree/main) to make a new release.

```shell
  npm run release
```
