// vitest.setup.ts
if (!global.PointerEvent) {
  class PointerEvent extends MouseEvent {
    public pointerId: number;
    public pointerType: string;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId || 0;
      this.pointerType = params.pointerType || "";
    }
  }
  // @ts-ignore
  global.PointerEvent = PointerEvent;
}
