# Deployment Notes

## Prerequisites

- Ensure you have helm v3 client installed.

```sh
$ helm version
version.BuildInfo{Version:"v3.0.1", GitCommit:"7c22ef9ce89e0ebeb7125ba2ebf7d421f3e82ffa", GitTreeState:"clean", GoVersion:"go1.13.4"}
```

- Ensure a TLS cert for your intended hostname is configured and ready, see section below.

## Rolling back the application to a previous version

* <em>Requires CLI tools `kubectl` and `helm`</em>
* <em>Requires access to Cloud Platform Kubernetes `live` cluster</em>
* <em>Requires membership of Github team `making-recall-decision`</em>

For example in the dev environment:
1. Set the Kube context with command `kubectl config use-context live.cloud-platform.service.justice.gov.uk`
2. Set the Kube namespace with command `kubectl config set-context --current --namespace make-recall-decision-dev`
3. List the charts deployed by helm with command `helm ls -a` (note: use this in preference to `helm list` which might not list everything)
4. List the deployments for this application with command `helm history make-recall-decision-ui`
5. Given the application version you wish to roll back to, find the related revision number
6. Rollback to that version with command `helm rollback make-recall-decision-ui <revision-number> --wait`

## Useful helm (v3) commands:

__Test chart template rendering:__

This will out the fully rendered kubernetes resources in raw yaml.

```sh
helm template [path to chart] --values=values-dev.yaml
```

__List releases:__

```sh
helm --namespace [namespace] list
```

__List current and previously installed application versions:__

```sh
helm --namespace [namespace] history [release name]
```

__Rollback to previous version:__

```sh
helm --namespace [namespace] rollback [release name] [revision number] --wait
```

Note: replace _revision number_ with one from listed in the `history` command)

__Example deploy command:__

The following example is `--dry-run` mode - which will allow for testing. CircleCI normally runs this command with actual secret values (from AWS secret manager), and also updated the chart's application version to match the release version:

```sh
helm upgrade [release name] [path to chart]. \
  --install --wait --force --reset-values --timeout 5m --history-max 10 \
  --dry-run \
  --namespace [namespace] \
  --values values-dev.yaml \
  --values example-secrets.yaml
```

### Ingress TLS certificate

Ensure a certificate definition exists in the cloud-platform-environments repo under the relevant namespaces folder:

e.g.

```sh
cloud-platform-environments/namespaces/live-1.cloud-platform.service.justice.gov.uk/[INSERT NAMESPACE NAME]/05-certificate.yaml
```

Ensure the certificate is created and ready for use.

The name of the kubernetes secret where the certificate is stored is used as a value to the helm chart - this is used to configured the ingress.
