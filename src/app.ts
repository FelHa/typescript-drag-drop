enum ProjectStatus {
  ACTIVE,
  FINISHED,
}

type Listener = (items: Project[]) => void;

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    this.projects.push(
      new Project(
        Math.random().toString(),
        title,
        description,
        numOfPeople,
        ProjectStatus.ACTIVE
      )
    );

    for (const listener of this.listeners) {
      listener([...this.projects]);
    }
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }
}

const projectState = ProjectState.getInstance();

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

    this.onSubmit();
    this.attachForm();
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
      alert('Falscher Input');
    }
  }

  @Autobind
  private submitHandler(e: Event) {
    e.preventDefault();
    const userInput = this.gatherUserInput();
    if (userInput) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputs();
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  private onSubmit() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attachForm() {
    this.hostElement.append(this.element);
  }
}

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[] = [];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.querySelector(
      '#project-list'
    ) as HTMLTemplateElement;
    this.hostElement = document.querySelector('#app') as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter((project) => {
        if (this.type === 'active')
          return project.status === ProjectStatus.ACTIVE;
        return project.status === ProjectStatus.FINISHED;
      });
      this.renderProjects();
    });

    this.attachList();
    this.renderList();
  }

  private renderList() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toLocaleUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    const listElement = document.querySelector(
      `#${this.type}-projects-list`
    ) as HTMLUListElement;
    listElement.innerHTML = '';
    for (const project of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = project.title;
      listElement.append(listItem);
    }
  }

  private attachList() {
    this.hostElement.append(this.element);
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
