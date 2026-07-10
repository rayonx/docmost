"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeEmail = void 0;
const react_email_1 = require("react-email");
const React = require("react");
const WelcomeEmail = ({ userName }) => {
    return (React.createElement(react_email_1.Html, null,
        React.createElement(react_email_1.Head, null),
        React.createElement(react_email_1.Body, null,
            React.createElement(react_email_1.Container, null,
                React.createElement(react_email_1.Section, null,
                    React.createElement(react_email_1.Text, null,
                        "Hi ",
                        userName,
                        ","),
                    React.createElement(react_email_1.Text, null, "Thanks for signing up. I'm really excited to have you on board."),
                    React.createElement(react_email_1.Text, null,
                        "Here are some features we have in store for you:",
                        React.createElement("br", null),
                        "- AI assistant",
                        React.createElement("br", null),
                        "- Real-time editor",
                        React.createElement("br", null),
                        "- Integrated diagrams",
                        React.createElement("br", null),
                        "- Inline comments",
                        React.createElement("br", null),
                        "- Version history",
                        React.createElement("br", null),
                        "- Granular permissions",
                        React.createElement("br", null),
                        "- Public wiki",
                        React.createElement("br", null),
                        "- Team spaces and more."),
                    React.createElement(react_email_1.Text, null,
                        React.createElement("b", null, "Need On-Premises?"),
                        " Our self-hosted enterprise edition offers complete data control for GDPR, ITAR, FedRAMP, and other compliance requirements. Reply to this email or",
                        React.createElement(react_email_1.Link, { href: "https://docmost.com/contact-sales?ref=w-email" },
                            ' ',
                            "Contact us"),
                        ' ',
                        "to learn more."),
                    React.createElement(react_email_1.Text, null,
                        React.createElement("b", null, "Quick question:"),
                        " how did you hear about us? I'd genuinely love to know."),
                    React.createElement(react_email_1.Text, null, "And if you ever have questions, feedback, or feature ideas, I\u2019m all ears. Just reach out anytime."),
                    React.createElement(react_email_1.Text, null,
                        "Best,",
                        React.createElement("br", null),
                        "Philip",
                        React.createElement("br", null),
                        "Founder, Docmost Inc."))))));
};
exports.WelcomeEmail = WelcomeEmail;
exports.default = exports.WelcomeEmail;
//# sourceMappingURL=welcome-email.js.map