import React from 'react';

export interface ReactElementDescription {
    type: string | React.ComponentType<any>,
    props?: { [key: string]: any }
}

export type Rule = {
    name: string;
    regex: RegExp;
    parse(content: string): AST;
    react(node: ASTNode): ReactElementDescription;
};

export type AST = Array<ASTNode>;
export type ASTNode = {
    type: string;
    content: string | Array<ASTNode>;
};

function parseStringContent(rule: Rule, node: ASTNode & { content: string; }): AST {
    const match = rule.regex.test(node.content);
    if (rule.name === 'Paragraph') {
        console.log('paragraph match', match, rule.regex, node.content, node.content.split('\n'));
    }
    if (match) {
        return [ { type: node.type, content: rule.parse(node.content) } ];
    } else {
        return [node];
    }
}
function parseNode(rule: Rule, node: ASTNode): AST {
    const content = node.content;
    if (typeof content === 'string') {
        return parseStringContent(rule, node as any);
    } else {
        const newContent =content
            .flatMap((node) => parseNode(rule, node));
        return [{ type: node.type, content: newContent }];
    }
}

function simplify(node: ASTNode): Array<ASTNode> {
    if (node.type === 'Text' && Array.isArray(node.content)) {
        return node.content.flatMap(simplify);
    }
    if (node.type === 'Text' && node.content.length === 0) {
        return [];
    }
    if (Array.isArray(node.content)) {
        return [ { type: node.type, content: node.content.flatMap(simplify)} ];
    }
    return [node];
}

export function parse(rules: Rule[], value: string): AST {
    console.log('lines', value.split('\n').length, rules.map((rule) => rule.name));
    const initialAST: AST = [ { type: 'Text', content: value }];
    return rules
        .reduce((ast, rule) => {
            return ast.flatMap((node) => parseNode(rule, node));
        }, initialAST)
        .flatMap(simplify);
}

function buildInternal(ruleMap: { [name: string]: Rule }, node: ASTNode, key: number): React.ReactNode {
    if (node.type === 'Text') {
        return node.content;
    }
    const type = ruleMap[node.type];
    const element = type.react(node);
    const children = typeof node.content === 'string' ? node.content : node.content.map((child, i) => buildInternal(ruleMap, child, i));
    return React.createElement(element.type, {...element.props, key}, children);
}

export function build(rules: Array<Rule>, ast: AST): React.ReactNode {
    const ruleMap = rules.reduce((acc, rule) => ({...acc, [rule.name]: rule}), {});
    const nodes = ast
        .map((node, i) => buildInternal(ruleMap, node, i));
    return React.createElement(React.Fragment, {}, nodes);
}
