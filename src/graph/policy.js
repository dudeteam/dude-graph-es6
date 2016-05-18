import forOwn from "lodash-es/forOwn";
import forEach from "lodash-es/forEach";

let PolicyLabels = {
    "VALUE": 1,
    "SINGLE_CONNECTION": 2,
    "MULTIPLE_CONNECTIONS": 4,
    "CONVERSION": 8
};

export default class PointPolicy {

    /**
     * @returns {number}
     */
    static get NONE() { return 0; }

    /**
     * @returns {number}
     */
    static get VALUE() { return PolicyLabels.VALUE; }

    /**
     * @returns {number}
     */
    static get SINGLE_CONNECTION() { return PolicyLabels.SINGLE_CONNECTION; }

    /**
     * @returns {number}
     */
    static get MULTIPLE_CONNECTIONS() { return PolicyLabels.MULTIPLE_CONNECTIONS; }

    /**
     * @returns {number}
     */
    static get CONVERSION() { return PolicyLabels.CONVERSION; }

    /**
     * @returns {number}
     */
    static get DEFAULT() { return PointPolicy.VALUE | PointPolicy.SINGLE_CONNECTION | PointPolicy.CONVERSION; }

    /**
     * @param {number} policy - the policy to serialize
     * @returns {Array<string>}
     */
    static serialize(policy) {
        var labels = [];
        forOwn(PolicyLabels, (policyLabelValue, policyLabel) => {
            if ((policyLabelValue & policy) !== 0) {
                labels.push(policyLabel);
            }
        });
        return labels;
    }

    /**
     * @param {Array<string>} policyLabels - the policy labels to deserialize
     * @returns {number}
     */
    static deserialize(policyLabels) {
        var policy = 0;
        forEach(policyLabels, (policyLabel) => {
            var labelPolicyValue = PolicyLabels[policyLabel];
            if (typeof labelPolicyValue === "undefined") {
                throw new Error("`" + policyLabel + "` is not a valid point policy");
            }
            policy |= labelPolicyValue;
        });
        return policy;
    }

    /**
     * @param {number} policy - the
     * @param {number} checkPolicy - the
     * @returns {boolean}
     */
    static has(policy, checkPolicy) {
        return (policy & checkPolicy) !== 0;
    }

}
