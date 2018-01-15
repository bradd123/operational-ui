/// <reference types="react" />
import * as React from "react";
export interface IProps {
    css?: {};
    className?: string;
    children?: React.ReactNode;
    __isRecordSummary?: boolean;
}
declare const _default: ((props: IProps) => JSX.Element) & {
    defaultProps: {
        __isRecordSummary: boolean;
    };
};
export default _default;
