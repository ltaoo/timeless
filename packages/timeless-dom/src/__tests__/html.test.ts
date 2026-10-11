import {afterEach,describe,expect,it,vi} from "vitest";
import {Html,View,ref} from "@timeless/timeless";
import {DOMHtml} from "@/host/html";
describe("fixed semantic components",()=>{
 afterEach(()=>vi.unstubAllGlobals());
 it.each([["H2","h2"],["Span","span"],["Button","button"],["Input","input"],["Details","details"]])("creates %s independently of View",(name,tag)=>{
  const attrs:Record<string,string>={};
  const element={nodeType:1,style:{cssText:""},setAttribute:(k:string,v:string)=>{attrs[k]=v},removeAttribute:(k:string)=>{delete attrs[k]},addEventListener:vi.fn(),removeEventListener:vi.fn(),appendChild:vi.fn()};
  const createElement=vi.fn(()=>element);
  vi.stubGlobal("document",{createElement,createDocumentFragment:()=>({appendChild(){}})});
  const label=ref("Before");const content=(Html as any)[name]({attributes:{"aria-label":label}});
  expect(content.t).toBe("html:"+tag);expect(View({}).state).not.toHaveProperty("as");
  const host=DOMHtml({build:vi.fn(),elm:content});content.$elm=host;host.render();
  expect(createElement).toHaveBeenCalledWith(tag);expect(attrs["aria-label"]).toBe("Before");
  label.set("After");expect(attrs["aria-label"]).toBe("After");
  content.destroy();label.set("Detached");expect(attrs["aria-label"]).toBe("After");
 });
});
