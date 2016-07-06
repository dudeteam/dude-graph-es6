import forOwn from "lodash-es/forOwn";
import forEach from "lodash-es/forEach";

const PolicyLabels = {
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
     * Serializes the specified policy to the corresponding policy labels
     * @param {number} policy - specifies the policy
     * @returns {Array<string>}
     */
    static serialize(policy) {
        const labels = [];
        forOwn(PolicyLabels, (policyLabelValue, policyLabel) => {
            if ((policyLabelValue & policy) !== 0) {
                labels.push(policyLabel);
            }
        });
        return labels;
    }

    /**
     * Deserializes the specified policy labels to the corresponding policy
     * @param {Array<string>} policyLabels - specifies the policy labels
     * @returns {number}
     */
    static deserialize(policyLabels) {
        let policy = 0;
        forEach(policyLabels, (policyLabel) => {
            const labelPolicyValue = PolicyLabels[policyLabel];
            if (typeof labelPolicyValue === "undefined") {
                throw new Error("`" + policyLabel + "` is not a valid point policy");
            }
            policy |= labelPolicyValue;
        });
        return policy;
    }

    /**
     * Returns whether the specified policy corresponds to the specified check policy
     * @param {number} policy - specifies the policy
     * @param {number} checkPolicy - specifies the check policy
     * @returns {boolean}
     */
    static has(policy, checkPolicy) {
        return (policy & checkPolicy) !== 0;
    }

}
