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
import {
    applicationLabels,
    matchLabels,
    safeLabelValue,
} from "../../lib/kubernetes/labels";

describe("kubernetes/labels", () => {

    describe("safeLabelValue", () => {

        const validation = /^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/;

        it("should not change a valid value", () => {
            const v = "Kat3Bu5h-Cloudbusting.5";
            const s = safeLabelValue(v);
            assert(validation.test(s));
            assert(s === v);
        });

        it("should not change an empty value", () => {
            const v = "";
            const s = safeLabelValue(v);
            assert(validation.test(s));
            assert(s === v);
        });

        it("should fix an invalid value", () => {
            const v = "@atomist/sdm-pack-k8s:1.1.0-k8s.20190125173349?";
            const s = safeLabelValue(v);
            const e = "atomist_sdm-pack-k8s_1.1.0-k8s.20190125173349";
            assert(validation.test(s));
            assert(s === e);
        });

        it("should fix consecutive invalid characters", () => {
            const v = "@atomist/sdm-pack-k8s:?*1.1.0-k8s.20190125173349?";
            const s = safeLabelValue(v);
            const e = "atomist_sdm-pack-k8s_1.1.0-k8s.20190125173349";
            assert(validation.test(s));
            assert(s === e);
        });

    });

    describe("matchLabels", () => {

        it("should return the proper match labels", () => {
            const r = {
                name: "cloudbusting",
                workspaceId: "KAT3BU5H",
            };
            const m = matchLabels(r);
            const e = {
                "app.kubernetes.io/name": "cloudbusting",
                "atomist.com/workspaceId": "KAT3BU5H",
            };
            assert.deepStrictEqual(m, e);
        });

    });

    describe("labels", () => {

        it("should return the proper labels", () => {
            const r = {
                name: "cloudbusting",
                workspaceId: "KAT3BU5H",
                version: "5.1.0",
                sdmFulfiller: "EMI",
            };
            const l = applicationLabels(r);
            const e = {
                "app.kubernetes.io/name": "cloudbusting",
                "atomist.com/workspaceId": "KAT3BU5H",
                "app.kubernetes.io/version": "5.1.0",
                "app.kubernetes.io/part-of": "cloudbusting",
                "app.kubernetes.io/managed-by": "EMI",
            };
            assert.deepStrictEqual(l, e);
        });

        it("should return optional labels", () => {
            const r = {
                name: "cloudbusting",
                workspaceId: "KAT3BU5H",
                version: "5.1.0",
                sdmFulfiller: "EMI",
                component: "song",
                instance: "Fifth",
            };
            const l = applicationLabels(r);
            const e = {
                "app.kubernetes.io/name": "cloudbusting",
                "atomist.com/workspaceId": "KAT3BU5H",
                "app.kubernetes.io/version": "5.1.0",
                "app.kubernetes.io/part-of": "cloudbusting",
                "app.kubernetes.io/managed-by": "EMI",
                "app.kubernetes.io/component": "song",
                "app.kubernetes.io/instance": "Fifth",
            };
            assert.deepStrictEqual(l, e);
        });

        it("should return a superset of the match labels", () => {
            const r = {
                name: "cloudbusting",
                workspaceId: "KAT3BU5H",
                version: "5.1.0",
                sdmFulfiller: "EMI",
            };
            const l = applicationLabels(r);
            const m = matchLabels(r);
            Object.keys(m).forEach(k => {
                assert(Object.keys(l).includes(k));
                assert(l[k] === m[k]);
            });
        });

        it("should make the fulfiller a valid label value", () => {
            const r = {
                name: "cloudbusting",
                workspaceId: "KAT3BU5H",
                version: "5.1.0",
                sdmFulfiller: "@emi/Wickham-Farm::Welling,England_",
            };
            const l = applicationLabels(r);
            const e = {
                "app.kubernetes.io/name": "cloudbusting",
                "atomist.com/workspaceId": "KAT3BU5H",
                "app.kubernetes.io/version": "5.1.0",
                "app.kubernetes.io/part-of": "cloudbusting",
                "app.kubernetes.io/managed-by": "emi_Wickham-Farm_Welling_England",
            };
            assert.deepStrictEqual(l, e);
        });

    });

});
