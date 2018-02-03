import { helper } from '@ember/component/helper';

const GRAF_MARKER = '\n\n';

export function lede([ body ]) {
  if (typeof body === 'string') {
    let grafs = body.trim().split(GRAF_MARKER);
    grafs.shift();
    return grafs.join('\n');
  }
  return '';
}

export default helper(lede);