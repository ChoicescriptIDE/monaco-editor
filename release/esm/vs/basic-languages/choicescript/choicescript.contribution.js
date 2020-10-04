import { registerLanguage, registerTheme } from '../_.contribution.js';
import { csDark, csLight } from './choicescript.themes.js';
registerTheme('cs-dark', csDark);
registerTheme('cs-light', csLight);
registerLanguage({
    id: 'choicescript',
    extensions: ['.txt'],
    aliases: ['ChoiceScript', 'cs'],
    loader: function () { return import('./choicescript.js'); }
});
