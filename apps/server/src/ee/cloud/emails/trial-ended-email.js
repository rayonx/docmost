"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrialEndedEmail = void 0;
const react_email_1 = require("react-email");
const React = require("react");
const styles_1 = require("../../../integrations/transactional/css/styles");
const partials_1 = require("../../../integrations/transactional/partials/partials");
const TrialEndedEmail = ({ billingLink, workspaceName }) => {
    return (React.createElement(partials_1.MailBody, null,
        React.createElement(react_email_1.Section, { style: styles_1.content },
            React.createElement(react_email_1.Text, { style: styles_1.paragraph }, "Hi there,"),
            React.createElement(react_email_1.Text, { style: styles_1.paragraph },
                "Your Docmost free trial for ",
                workspaceName,
                " has come to an end."),
            React.createElement(react_email_1.Text, { style: styles_1.paragraph }, "To continue using Docmost for your wiki and documentation, please upgrade to a paid plan.")),
        React.createElement(partials_1.EmailButton, { href: billingLink }, "Upgrade now"),
        React.createElement(react_email_1.Section, { style: styles_1.content },
            React.createElement(react_email_1.Text, { style: styles_1.paragraph }, "PS: If you would like to extend your trial, please reply this email."))));
};
exports.TrialEndedEmail = TrialEndedEmail;
exports.default = exports.TrialEndedEmail;
//# sourceMappingURL=trial-ended-email.js.map