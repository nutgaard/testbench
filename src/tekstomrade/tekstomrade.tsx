import React from 'react';
import 'nav-frontend-skjema-style';
import classNames from "classnames";
import * as Utils from './utils';
import './tekstomrade.less';
import {Rule} from "./utils";
import {HighlightRule, LinkRule, ParagraphRule} from "./rules";
export * from './rules';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: string;
    ingenFormattering?: boolean;
    rules?: Array<Rule>;
}

const cls = (className?: string) => classNames('tekstomrade', className);

class Tekstomrade extends React.Component<Props> {
    render() {
        const {className} = this.props;

        const ast = Utils.parse(this.props.rules!, this.props.children);
        const elements = Utils.build(this.props.rules!, ast);
        console.log(ast);
        console.log(elements);

        return (
            <div className={cls(className)}>
                {elements}
            </div>
        );
    }
}

(Tekstomrade as any).defaultProps = {
    rules: [ParagraphRule, HighlightRule, LinkRule]
};

export default Tekstomrade;
