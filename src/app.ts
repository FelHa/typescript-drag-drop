enum ProjectStatus {
  ACTIVE,
  FINISHED,
}

type Observer<T> = (items: T[]) => void;

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

abstract class State<T> {
  protected observers: Observer<T>[] = [];
  protected observables: T[] = [];

  addObserver(listenerFn: Observer<T>) {
    this.observers.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (!this.instance) this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfPeople: number) {
    this.observables.push(
      new Project(
        Math.random().toString(),
        title,
        description,
        numOfPeople,
        ProjectStatus.ACTIVE
      )
    );

    for (const listener of this.observers) {
      listener([...this.observables]);
    }
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

abstract class UIComponent<T extends HTMLElement, U extends HTMLElement> {
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

class ProjectInput extends UIComponent<HTMLDivElement, HTMLFormElement> {
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

  protected configure() {
    this.elementToRender.addEventListener('submit', this.submitHandler);
  }

  protected renderContent() {}
}

class ProjectList extends UIComponent<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[] = [];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  protected configure() {
    projectState.addObserver((projects: Project[]) => {
      this.assignedProjects = projects.filter((project) => {
        if (this.type === 'active')
          return project.status === ProjectStatus.ACTIVE;
        return project.status === ProjectStatus.FINISHED;
      });
      this.renderProjects();
    });
  }

  protected renderContent() {
    const listId = `${this.type}-projects-list`;
    this.elementToRender.querySelector('ul')!.id = listId;
    this.elementToRender.querySelector('h2')!.textContent =
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
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
