/*
 * Copyright © 2019 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { logger } from "@atomist/automation-client";
import * as k8s from "@kubernetes/client-node";
import * as http from "http";
import * as stringify from "json-stringify-safe";
import * as _ from "lodash";
import { DeepPartial } from "ts-essentials";
import { errMsg } from "../support/error";
import { logRetry } from "../support/retry";
import { applicationLabels } from "./labels";
import { metadataTemplate } from "./metadata";
import {
    appName,
    KubernetesApplication,
    KubernetesDeleteResourceRequest,
    KubernetesResourceRequest,
    KubernetesSdm,
} from "./request";

export interface UpsertIngressResponse {
    response: http.IncomingMessage;
    body: k8s.V1beta1Ingress;
}

/**
 * If `req.path` is truthy, create or patch an ingress for a
 * Kubernetes application.  Any provided `req.ingressSpec` is merged
 * using [[ingressTemplate]] before creating/patching.
 *
 * @param req Kuberenetes resource request
 * @return Response from Kubernetes API is ingress is created or patched,
 *         `void` otherwise.
 */
export async function upsertIngress(req: KubernetesResourceRequest): Promise<UpsertIngressResponse | void> {
    const slug = appName(req);
    if (!req.path) {
        logger.debug(`Path not provided, will not upsert ingress ${slug}`);
        return;
    }
    const spec = await ingressTemplate(req);
    try {
        await req.clients.ext.readNamespacedIngress(req.name, req.ns);
    } catch (e) {
        logger.debug(`Failed to read ingress ${slug}, creating: ${errMsg(e)}`);
        logger.debug(`Creating ingress ${slug} using '${stringify(spec)}'`);
        return logRetry(() => req.clients.ext.createNamespacedIngress(req.ns, spec), `create ingress ${slug}`);
    }
    logger.debug(`Ingress ${slug} exists, patching using '${stringify(spec)}'`);
    return logRetry(() => req.clients.ext.patchNamespacedIngress(req.name, req.ns, spec), `patch ingress ${slug}`);
}

/**
 * Delete an ingress if it exists.  If the resource does not exist, do
 * nothing.
 *
 * @param req Kuberenetes delete request
 */
export async function deleteIngress(req: KubernetesDeleteResourceRequest): Promise<void> {
    const slug = appName(req);
    try {
        await req.clients.ext.readNamespacedIngress(req.name, req.ns);
    } catch (e) {
        logger.debug(`Ingress ${slug} does not exist: ${errMsg(e)}`);
        return;
    }
    await logRetry(() => req.clients.ext.deleteNamespacedIngress(req.name, req.ns), `delete ingress ${slug}`);
    return;
}

/**
 * Create an ingress HTTP path.
 *
 * @param req ingress request
 * @return ingress HTTP path
 */
function httpIngressPath(req: KubernetesApplication): k8s.V1beta1HTTPIngressPath {
    const httpPath: k8s.V1beta1HTTPIngressPath = {
        path: req.path,
        backend: {
            serviceName: req.name,
            servicePort: "http",
        },
    };
    return httpPath;
}

/**
 * Create the ingress for a deployment namespace.  If the
 * request has an `ingressSpec`, it is merged into the spec created
 * by this function using `lodash.merge(default, req.ingressSpec)`.
 *
 * @param req Kubernestes application
 * @return ingress spec with single rule
 */
export async function ingressTemplate(req: KubernetesApplication & KubernetesSdm): Promise<k8s.V1beta1Ingress> {
    const labels = applicationLabels(req);
    const metadata = metadataTemplate({
        name: req.name,
        labels,
    });
    const httpPath = httpIngressPath(req);
    const rule: k8s.V1beta1IngressRule = {
        http: {
            paths: [httpPath],
        },
    } as any;
    if (req.host) {
        rule.host = req.host;
    }
    // avoid https://github.com/kubernetes-client/javascript/issues/52
    const i: DeepPartial<k8s.V1beta1Ingress> = {
        kind: "Ingress",
        apiVersion: "extensions/v1beta1",
        metadata,
        spec: {
            rules: [rule],
        },
    };
    if (req.tlsSecret) {
        i.spec.tls = [
            {
                secretName: req.tlsSecret,
            } as any,
        ];
        if (req.host) {
            i.spec.tls[0].hosts = [req.host];
        }
    }
    if (req.ingressSpec) {
        _.merge(i, req.ingressSpec);
    }
    return i as k8s.V1beta1Ingress;
}
