import type { RenderTask, SerializableRenderTask } from "./renderer";
import { isObservable, Observable } from "rxjs";
import type { Serializable } from "./types";

import { map, merge, firstValueFrom } from "rxjs";

const templateSignal = ':';

export const html = <T = any>(
    strings: TemplateStringsArray, 
    ...keys: Array<T | Observable<T>>
): Observable<T extends Serializable ? SerializableRenderTask : RenderTask> => {

  const observables: Observable<any>[] = [];
  
  const initialHTML = rawTemplate(strings, ...keys.map((key, index) => {
    const selector = `data-rxhtml-${index}`;


    /**
     * Cases:
     * 
     * 1. Observable bound to an attribute/property/event
     * 2. Static value bound to an attribute/property/event
     * 3. Observable<RenderTask> bound to children
     * 4. Array<Observable<RenderTask>> bound to children
     */

    if (isObservable(key)) {
      const [attributeType, attributeName] = parseAttribute(strings[index]);
      const task = (key as Observable<any>).pipe(
        map(val => {
          return {
            name: attributeName,
            action: attributeType,
            selector: `[${selector}]`,
            value: val
          }
        })
      )
      observables.push(task);
    }

    return `"" ${selector}="true"`;
  })).trim();

  const initialTask: RenderTask = {
    name: 'innerHTML',
    action: 'PROPERTY',
    selector: '',
    value: initialHTML
  }

  return merge([initialTask], ...observables);
}

/**
 * Mirrors the default template literal function
 */
const rawTemplate = (strings: TemplateStringsArray, ...keys: any[]) => String.raw({ raw: strings }, ...keys);

/**
 * Determine attribute type and name
 */
const parseAttribute = (templatePartial: string) => {
  const rawName = templatePartial.trim().split(' ').at(-1).slice(0, -1);

  // TODO: add CHILDREN option
  if (rawName.startsWith(`on${templateSignal}`)) {
    return ['EVENT', rawName.slice(templateSignal.length + 2)];
  } else if (rawName.startsWith(templateSignal)) {
    return ['PROPERTY', rawName.slice(templateSignal.length)];
  } else {
    return ['ATTRIBUTE', rawName];
  }
}

export const renderToString = (obs: Observable<RenderTask>): Promise<string> => {
  return firstValueFrom(obs).then(res => res.value);
}
