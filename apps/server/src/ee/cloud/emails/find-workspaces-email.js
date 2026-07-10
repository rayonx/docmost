"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindWorkspacesEmail = void 0;
const react_email_1 = require("react-email");
const React = require("react");
const styles_1 = require("../../../integrations/transactional/css/styles");
const partials_1 = require("../../../integrations/transactional/partials/partials");
const FindWorkspacesEmail = ({ workspaces, signupUrl }) => {
    if (workspaces.length === 0) {
        return (React.createElement(partials_1.MailBody, null,
            React.createElement(react_email_1.Section, { style: styles_1.content },
                React.createElement(react_email_1.Text, { style: styles_1.paragraph }, "Hi,"),
                React.createElement(react_email_1.Text, { style: styles_1.paragraph }, "We could not find any workspaces associated with your email address."),
                React.createElement(react_email_1.Text, { style: styles_1.paragraph },
                    "If you believe this is an error, please check if you signed up with a different email address. You can also create a new workspace at",
                    ' ',
                    React.createElement(react_email_1.Link, { href: signupUrl }, signupUrl),
                    "."))));
    }
    return (React.createElement(partials_1.MailBody, null,
        React.createElement(react_email_1.Section, { style: styles_1.content },
            React.createElement(react_email_1.Text, { style: styles_1.paragraph }, "Hi,"),
            React.createElement(react_email_1.Text, { style: styles_1.paragraph }, "Here are the workspaces associated with your email address:"),
            workspaces.map((ws, i) => (React.createElement(react_email_1.Text, { key: i, style: styles_1.paragraph },
                React.createElement(react_email_1.Link, { href: ws.url }, ws.name),
                " \u2014 ",
                ws.url))))));
};
exports.FindWorkspacesEmail = FindWorkspacesEmail;
exports.default = exports.FindWorkspacesEmail;
//# sourceMappingURL=find-workspaces-email.js.map