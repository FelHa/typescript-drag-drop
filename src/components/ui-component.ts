export abstract class UIComponent<
  T extends HTMLElement,
  U extends HTMLElement
> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  elementToRender: U;

  constructor(
    private templateId: string,
    private hostId: string,
    private elementToRenderId: string
  ) {
    this.templateElement = document.querySelector(
      `#${this.templateId}`
    ) as HTMLTemplateElement;
    this.hostElement = document.querySelector(`#${this.hostId}`) as T;
    this.elementToRender = document.importNode(
      this.templateElement.content,
      true
    ).firstElementChild as U;

    if (elementToRenderId) this.elementToRender.id = this.elementToRenderId;

    this.attachElementToRender();
  }

  private attachElementToRender() {
    this.hostElement.append(this.elementToRender);
  }

  protected abstract configure(): void;
  protected abstract renderContent(): void;
}
