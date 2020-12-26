import { Autobind } from '../decorators/autobind';
import { ProjectState } from '../state/project-state';
import { validate } from '../utils/validate';
import { UIComponent } from './ui-component';

export class ProjectInput extends UIComponent<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', 'user-input');

    this.titleInputElement = this.elementToRender.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.elementToRender.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.elementToRender.querySelector(
      '#people'
    ) as HTMLInputElement;

    this.configure();
    this.renderContent();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = +this.peopleInputElement.value;

    if (
      validate({ value: enteredTitle, required: true, minLength: 3 }) &&
      validate({ value: enteredDescription, required: true, minLength: 5 }) &&
      validate({ value: enteredPeople, required: true, min: 1 })
    ) {
      return [enteredTitle, enteredDescription, enteredPeople];
    } else {
      alert('Input not valide!');
    }
  }

  @Autobind
  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherUserInput();
    if (userInput) {
      const [title, desc, people] = userInput;

      ProjectState.getInstance().addProject(title, desc, people);

      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  protected configure() {
    this.elementToRender.addEventListener('submit', this.submitHandler);
  }

  protected renderContent() {}
}
