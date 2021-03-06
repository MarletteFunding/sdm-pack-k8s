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

import * as assert from "power-assert";
import { errMsg } from "../../lib/support/error";

describe("support/error", () => {

    describe("errMsg", () => {

        it("should handle undefined", () => {
            const m = errMsg(undefined);
            assert(m === undefined);
        });

        it("should handle null", () => {
            // tslint:disable-next-line:no-null-keyword
            const m = errMsg(null);
            assert(m === "null");
        });

        it("should handle an Error", () => {
            const r = new Error("Blitzen Trapper");
            const m = errMsg(r);
            const e = "Blitzen Trapper";
            assert(m === e);
        });

        it("should handle a Kubernetes API error", () => {
            /* tslint:disable:max-line-length no-null-keyword */
            const r = {
                response: {
                    statusCode: 422,
                    body: {
                        kind: "Status",
                        apiVersion: "v1",
                        metadata: {},
                        status: "Failure",
                        message: "RESPONSE!!!Namespace \"local\" is invalid: metadata.labels: Invalid value: \"@atomist/sdm-pack-k8s:1.1.0-k8s.20190125173349\": a valid label must be an empty string or consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character (e.g. 'MyValue',  or 'my_value',  or '12345', regex used for validation is '(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?')",
                        reason: "Invalid",
                        details: {
                            name: "local",
                            kind: "Namespace",
                            causes: [
                                {
                                    reason: "FieldValueInvalid",
                                    message: "Invalid value: \"@atomist/sdm-pack-k8s:1.1.0-k8s.20190125173349\": a valid label must be an empty string or consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character (e.g. 'MyValue',  or 'my_value',  or '12345', regex used for validation is '(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?')",
                                    field: "metadata.labels",
                                },
                            ],
                        },
                        code: 422,
                    },
                    headers: {
                        "content-type": "application/json",
                        "date": "Fri, 25 Jan 2019 17:47:55 GMT",
                        "content-length": "960",
                        "connection": "close",
                    },
                    request: {
                        uri: {
                            protocol: "https:",
                            slashes: true,
                            auth: null,
                            host: "192.168.99.100:8443",
                            port: "8443",
                            hostname: "192.168.99.100",
                            hash: null,
                            search: null,
                            query: null,
                            pathname: "/api/v1/namespaces",
                            path: "/api/v1/namespaces",
                            href: "https://192.168.99.100:8443/api/v1/namespaces",
                        },
                        method: "POST",
                        headers: {
                            "authorization": "",
                            "accept": "application/json",
                            "content-type": "application/json",
                            "content-length": 225,
                        },
                    },
                },
                body: {
                    kind: "Status",
                    apiVersion: "v1",
                    metadata: {},
                    status: "Failure",
                    message: "Namespace \"local\" is invalid: metadata.labels: Invalid value: \"@atomist/sdm-pack-k8s:1.1.0-k8s.20190125173349\": a valid label must be an empty string or consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character (e.g. 'MyValue',  or 'my_value',  or '12345', regex used for validation is '(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?')",
                    reason: "Invalid",
                    details: {
                        name: "local",
                        kind: "Namespace",
                        causes: [
                            {
                                reason: "FieldValueInvalid",
                                message: "Invalid value: \"@atomist/sdm-pack-k8s:1.1.0-k8s.20190125173349\": a valid label must be an empty string or consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character (e.g. 'MyValue',  or 'my_value',  or '12345', regex used for validation is '(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?')",
                                field: "metadata.labels",
                            },
                        ],
                    },
                    code: 422,
                },
                attemptNumber: 1,
                retriesLeft: 5,
            } as any;
            /* tslint:enable:max-line-length no-null-keyword */
            const m = errMsg(r);
            assert(m === r.body.message);
        });

        it("should stringify something without a message", () => {
            const r = {
                blitzenTrapper: "Furr",
            };
            const m = errMsg(r);
            const e = JSON.stringify(r);
            assert(m === e);
        });

        it("should handle an array", () => {
            const r = ["Blitzen", "Trapper", "Furr"];
            const m = errMsg(r);
            const e = JSON.stringify(r);
            assert(m === e);
        });

        it("should handle a string", () => {
            const r = "Blitzen Trapper";
            const m = errMsg(r);
            assert(m === r);
        });

        it("should return the response.body.message", () => {
            const r = {
                response: {
                    body: {
                        message: "Blitzen Trapper",
                    },
                },
            };
            const m = errMsg(r);
            assert(m === "Blitzen Trapper");
        });

    });

});
