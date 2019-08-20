import React from 'react';
import './application.css';
import TagInput, { parseTekst } from "./tag-input/tag-input";
import useFieldState from "./use-fieldstate";
import Tekstomrade, {HighlightRule, LinkRule, ParagraphRule, createDynamicHighligtingRule} from "./tekstomrade/tekstomrade";
import NavFrontendTekstomrade from 'nav-frontend-tekstomrade';

const content = `
Dette er en paragraf.
Dette er en annen.
Og her har vi en lenke; www.nav.no
Noe som *skal* highlightes; *highlightme*
Kanskje til og med en *lenke* som skal highlightes: *www.nav.no*
`.trim();

function Application() {
    const state = useFieldState('');
    const value = parseTekst(state.input.value);
    const dynamicRule = createDynamicHighligtingRule(value.text.split(' '));
    return (
        <div className="application">
            <h1>Hei</h1>
            <TagInput label="Label" {...state.input} name="test"/>
            <hr/>
            <pre>{JSON.stringify(value, null, 2)}</pre>
            <hr />
            <hr />
            <NavFrontendTekstomrade>{content}</NavFrontendTekstomrade>
            <hr />
            <Tekstomrade rules={[ParagraphRule, HighlightRule, dynamicRule, LinkRule]}>{content}</Tekstomrade>
        </div>
    );
}

export default Application;
