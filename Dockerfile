FROM dirigiblelabs/dirigible:latest

COPY platform target/dirigible/repository/root/registry/public/platform

ENV DIRIGIBLE_HOME_URL=/services/web/portal/dashboard.html

ENV DIRIGIBLE_MULTI_TENANT_MODE=false
ENV DIRIGIBLE_KEYCLOAK_ENABLED=true

EXPOSE 8080
