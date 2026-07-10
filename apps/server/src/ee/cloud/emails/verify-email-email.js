"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyEmailEmail = void 0;
const react_email_1 = require("react-email");
const React = require("react");
const styles_1 = require("../../../integrations/transactional/css/styles");
const partials_1 = require("../../../integrations/transactional/partials/partials");
const VerifyEmailEmail = ({ username, verifyLink }) => {
    return (React.createElement(partials_1.MailBody, null,
        React.createElement(react_email_1.Section, { style: styles_1.content },
            React.createElement(react_email_1.Text, { style: styles_1.paragraph },
                "Hi ",
                username,
                ","),
            React.createElement(react_email_1.Text, { style: styles_1.paragraph }, "Please verify your email address to get started with your workspace."),
            React.createElement(partials_1.EmailButton, { href: verifyLink }, "Verify email"),
            React.createElement(react_email_1.Text, { style: styles_1.paragraph },
                "Or copy and paste this link into your browser:",
                ' ',
                React.createElement(react_email_1.Link, { href: verifyLink }, verifyLink)),
            React.createElement(react_email_1.Text, { style: styles_1.paragraph }, "This link is valid for 2 hours."),
            React.createElement(react_email_1.Text, { style: styles_1.paragraph }, "If you did not create an account, please ignore this email."))));
};
exports.VerifyEmailEmail = VerifyEmailEmail;
exports.default = exports.VerifyEmailEmail;
//# sourceMappingURL=verify-email-email.js.map