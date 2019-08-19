import React, {ChangeEvent, RefObject} from 'react';
import { NavFrontendInputProps} from 'nav-frontend-skjema';
import 'nav-frontend-skjema-style';
import {guid} from "nav-frontend-js-utils";
import classNames from 'classnames';
import './tag-input.less';

const cls = (className?: string) => classNames('tag-input', 'skjemaelement', className);
const inputClass = (width: string, focusWithin: boolean, className?: string, harFeil?: boolean) => classNames(
    'skjemaelement__input',
    { 'skjemaelement__input--focus': focusWithin },
    className,
    `input--${width.toLowerCase()}`,
    { 'skjemaelement__input--harFeil': harFeil }
);

const tagsRegex = /#(\S+)\s/g;
function matchAll(value: string, regex: RegExp): RegExpExecArray[] {
    let out: RegExpExecArray[] = [];
    let res: RegExpExecArray | null;
    while ((res = regex.exec(value)) !== null) {
        out.push(res);
    }
    return out;
}

export function parseTekst(query: string) {
    const tags = matchAll(query, tagsRegex)
        .map(([ fullMatch, group ]) => group);
    const text = query.replace(tagsRegex, '');
    return { tags, text };
}

type Props = Omit<NavFrontendInputProps, 'value' | 'name' | 'inputRef'> & {
    value: string;
    name: string;
    onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
};
interface State {
    raw: string;
    tags: string[];
    text: string;
    focusWithin: boolean;
}

function buildString(tags: string[], value: string) {
    return [tags.map(tag => `#${tag}`).join(' '), value]
        .filter((v) => v.length !== 0)
        .join(' ');
}

class TagInput extends React.Component<Props, State> {
    private readonly inputId = this.props.id || this.props.name || guid();
    private readonly ref: RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);

        const defaultValue = props.value || '';
        this.state = {
            focusWithin: false,
            raw: defaultValue,
            ...parseTekst(defaultValue)
        };
        this.ref = React.createRef();
        this.onChangeProxy = this.onChangeProxy.bind(this);
        this.onFocusProxy = this.onFocusProxy.bind(this);
        this.onBlurProxy = this.onBlurProxy.bind(this);
        this.createChangeEvent = this.createChangeEvent.bind(this);
        this.remove = this.remove.bind(this);
    }

    componentDidMount() {
        this.onChangeProxy(this.createChangeEvent(this.state.text));
    }

    onChangeProxy(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        const rawStr = buildString(this.state.tags, value);

        const state = {
            raw: rawStr,
            ...parseTekst(rawStr)
        };
        this.setState(state);
        const clonedTarget = {
            ...event.target,
            value: rawStr
        };
        const clonedEvent : React.ChangeEvent<HTMLInputElement> = {
            ...event,
            target: clonedTarget
        };
        if (this.props.onChange) {
            this.props.onChange(clonedEvent);
        }
    }

    onFocusProxy(e: React.FocusEvent<HTMLInputElement>) {
        this.setState({ focusWithin: true });
        if (this.props.onFocus) {
            this.props.onFocus(e);
        }
    }

    onBlurProxy(e: React.FocusEvent<HTMLInputElement>) {
        this.setState({ focusWithin: false });
        if (this.props.onBlur) {
            this.props.onBlur(e);
        }
    }

    createChangeEvent(value: string): ChangeEvent<HTMLInputElement> {
        return {
            target: {
                ...(this.ref.current || {}),
                value
            }
        } as unknown as ChangeEvent<HTMLInputElement>
    }

    remove(index: number) {
        this.setState({
            tags: this.state.tags.filter((_, is) => index !== is)
        }, () => this.onChangeProxy(this.createChangeEvent(this.state.text)));
    }

    render() {
        const { label, bredde = 'fullbredde', feil,  name, className, inputClassName, ...other } = this.props;
        const tags = this.state.tags
            .map((tag, i) => {
                return (
                    <button key={i} className="tag-input__tag" onClick={() => this.remove(i)} title="Remove tag">
                        <span>{tag}</span>
                        <span className="tag-input__tag-remove" aria-hidden={true}/>
                    </button>
                );
            });

        return (
            <div className={cls(className)}>
                <label className="skjemaelement__label" htmlFor={this.inputId}>{label}</label>
                <div className={inputClass(bredde, this.state.focusWithin, inputClassName, !!feil)}>
                    <div className="tag-input__tags">
                        {tags}
                    </div>
                    <input
                        {...other}
                        onFocus={this.onFocusProxy}
                        onBlur={this.onBlurProxy}
                        onChange={this.onChangeProxy}
                        type="text"
                        className="tag-input__input"
                        id={this.inputId}
                        name={name}
                        value={this.state.text}
                        ref={this.ref}
                    />
                </div>
                <div role="alert" aria-live="assertive">
                    {feil && <div className="skjemaelement__feilmelding">{feil.feilmelding}</div>}
                </div>
            </div>
        );
    }
}
export default TagInput;
