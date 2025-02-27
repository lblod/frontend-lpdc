# LPDC (Lokale Producten- en Dienstencatalogus) - Frontend

_Note_: Documentation is structured using [The software guidebook by Simon Brown](https://leanpub.com/documenting-software-architecture).

LPDC Frontend is part of [LPDC - Digitaal loket](https://github.com/lblod/app-lpdc-digitaal-loket/tree/development). This contains general documentation. Specific documentation to be found in this project.  

## 1. Context

LPDC frontend is the frontend component.
It is written in ember-js.

### Environment variables

The [ember-proxy-service](https://github.com/mu-semtech/ember-proxy-service#configure-environment-variables-in-the-frontends-container) docker image (which we use to host the frontend) supports configuring environment variables. The following options are available for the loket image.

#### General

| Name              | Description                   |
| ----------------- | ----------------------------- |
| `EMBER_FUSIES`    | Toggle fusies                 |
| `EMBER_IPDC_URL`  | Link to the IPDC application  |
| `EMBER_LOKET_URL` | Link to the Loket application |

#### ACM/IDM

| Name                               | Description                                                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `EMBER_ACMIDM_CLIENT_ID`           | The unique client id for a specific environment                                                                                                          |
| `EMBER_ACMIDM_AUTH_URL`            | The URL where users will be redirected to when they want to log in                                                                                       |
| `EMBER_ACMIDM_AUTH_REDIRECT_URL`   | The callback URL that ACM/IDM will use after the user logs in successfully                                                                               |
| `EMBER_ACMIDM_LOGOUT_URL`          | The URL where users will be redirected to when they want to log out                                                                                      |
| `EMBER_ACMIDM_SWITCH_REDIRECT_URL` | The URL that will be used when "switching users" is enabled in ACM/IDM. After logout, users can select one of their other accounts to simplify the flow. |

> When ACM/IDM is not configured, the frontend will default to the "mock login" setup instead.
>

## 2. Functional Overview

## 3. Quality Attributes

## 4. Constraints

## 5. Principles

## 6. Software Architecture

## 7. Code

## 8. Data

## 9. Infrastructure Architecture

## 10. Deployment

We use [release-it](https://github.com/release-it/release-it/tree/main) to make a new release.

```shell
  npm run release
```

## 11. Operation and Support

## 12. Development Environment

## 13. Decision Log
