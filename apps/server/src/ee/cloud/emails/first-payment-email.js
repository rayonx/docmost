"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirstPaymentEmail = void 0;
const react_email_1 = require("react-email");
const React = require("react");
const FirstPaymentEmail = () => {
    return (React.createElement(react_email_1.Html, null,
        React.createElement(react_email_1.Head, null),
        React.createElement(react_email_1.Body, null,
            React.createElement(react_email_1.Container, null,
                React.createElement(react_email_1.Section, null,
                    React.createElement(react_email_1.Text, null, "Hey, and thanks so much for being one of our early customers!"),
                    React.createElement(react_email_1.Text, null, "I\u2019m really excited to support you and help your team get the most out of Docmost."),
                    React.createElement(react_email_1.Text, null, "Just wanted to make sure you have my email in case you ever have questions, feedback, or requests, I would be here to help."),
                    React.createElement(react_email_1.Text, null, "Please don\u2019t hesitate to reach out!."),
                    React.createElement(react_email_1.Text, null,
                        "Best,",
                        React.createElement("br", null),
                        "Philip",
                        React.createElement("br", null),
                        "Founder, Docmost Inc."))))));
};
exports.FirstPaymentEmail = FirstPaymentEmail;
exports.default = exports.FirstPaymentEmail;
//# sourceMappingURL=first-payment-email.js.map