import * as React from 'react';
interface WorkspaceInfo {
    name: string;
    url: string;
}
interface Props {
    workspaces: WorkspaceInfo[];
    signupUrl: string;
}
export declare const FindWorkspacesEmail: ({ workspaces, signupUrl }: Props) => React.JSX.Element;
export default FindWorkspacesEmail;
