interface CustomEventMap {
  "auth:sign_in": CustomEvent<any>;
  "auth:sign_out": CustomEvent<any>;
}
declare global {
  interface Document { //adds definition to Document, but you can do the same with HTMLElement
      addEventListener<K extends keyof CustomEventMap>(type: K,
         listener: (this: Document, ev: CustomEventMap[K]) => void): void;
      dispatchEvent<K extends keyof CustomEventMap>(ev: CustomEventMap[K]): void;
      removeEventListener<K extends keyof CustomEventMap>(type: K,
        listener: (this: Document, ev: CustomEventMap[K]) => void): void;
  }
}
export { }; //keep that for TS compiler.
