import {ASTNode, ReactElementDescription, Rule} from "./utils";
import Lenke from "nav-frontend-lenker";

export const ParagraphRule: Rule = {
    name: 'Paragraph',
    regex: /\n/,
    parse(source: string) {
        console.log('paragraph rule', source.split(this.regex).length);
        return source.split(this.regex)
            .map((line) => ({ type: this.name, content: line }));
    },
    react(): ReactElementDescription {
        return {
            type: 'p',
            props: { className: 'typo-normal blokk-xs' }
        };
    }
};

export const HighlightRule: Rule = {
    name: 'Highlight',
    regex: /(\*\S+\*)/,
    parse(source: string) {
        return source
            .split(this.regex)
            .map((fragment) => {
                const match = this.regex.exec(fragment);
                if (match) {
                    return { type: this.name, content: match[1].slice(1).slice(0, -1) };
                } else {
                    return { type: 'Text', content: fragment };
                }
            });
    },
    react(node: ASTNode): ReactElementDescription {
        return {
            type: 'em'
        };
    }
};

export function createDynamicHighligtingRule(query: string): Rule {
    return {
        name: 'DynamicHighliht',
        regex: new RegExp(`(\\b\\S*(?:${query})\\S*\\b)`, 'i'),
        parse(content: string) {
            if (query === '') {
                return [{ type: 'Text', content: content }];
            }
            return content
                .split(this.regex)
                .map((fragment) => {
                    const match = this.regex.exec(fragment);
                    if (match) {
                        return { type: this.name, content: match[1] };
                    } else {
                        return { type: 'Text', content: fragment };
                    }
                });
        },
        react(node: ASTNode): ReactElementDescription {
            return {
                type: 'strong',
                props: { style: { backgroundColor: 'red' }}
            }
        }
    };
}

export const LinkRule: Rule = {
    name: 'Link',
    regex: /((?:[\w-]+:\/\/?|www(?:-\w+)?\.)[^\s()<>]+\w)/,
    parse(source: string) {
        return source
            .split(this.regex)
            .map((fragment) => {
                const match = this.regex.exec(fragment);
                if (match) {
                    return { type: this.name, content: match[1] }
                } else {
                    return { type: 'Text', content: fragment };
                }
            })
    },
    react(node: ASTNode): ReactElementDescription {
        return {
            type: Lenke,
            props: { href: node.content }
        };
    }
};
