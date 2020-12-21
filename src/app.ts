interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(input: Validatable) {
  let isValid = true;
  if (input.required) {
    isValid = isValid && input.value.toString().trim().length !== 0;
  }
  if (input.minLength && typeof input.value === 'string') {
    isValid = isValid && input.value.trim().length > input.minLength;
  }
  if (input.maxLength && typeof input.value === 'string') {
    isValid = isValid && input.value.trim().length < input.maxLength;
  }
  if (input.min && typeof input.value === 'number') {
    isValid = isValid && input.value > input.min;
  }
  if (input.max && typeof input.value === 'number') {
    isValid = isValid && input.value < input.max;
  }
  return isValid;
}

function Autobind(
  _target: any,
  _methodName: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  return {
    configurable: true,
    enumerable: false,
    get() {
      return descriptor.value.bind(this);
    },
  };
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.querySelector(
      '#project-input'
    ) as HTMLTemplateElement;
    this.hostElement = document.querySelector('#app') as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = +this.peopleInputElement.value;

    if (
      validate({ value: enteredTitle, required: true, minLength: 5 }) &&
      validate({ value: enteredDescription, required: true, minLength: 5 }) &&
      validate({ value: enteredPeople, required: true, min: 1 })
    ) {
      return [enteredTitle, enteredDescription, enteredPeople];
    } else {
      alert('Falscher Input');
    }
  }

  @Autobind
  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherUserInput();
    if (userInput) {
      const [title, desc, people] = userInput;
      console.log(title, desc, people);
      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  private configure() {
    this.element.addEventListener('submit', this.submitHandler.bind(this));
  }

  private attach() {
    this.hostElement.append(this.element);
  }
}

const projectInput = new ProjectInput();
