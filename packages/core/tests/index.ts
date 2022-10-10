import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { html, renderToString } from '../src/index';

test('html', () => {
  html`<div>hello world</div>`;

  assert.is(renderToString(html`<div>hello world</div>`), `<div>hello world</div>`)
})

test.run();