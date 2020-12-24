interface Draggable {
  dragStartHandler(e: DragEvent): void;
  dragEndHandler(e: DragEvent): void;
}

interface DropTarget {
  dragOverHandler(e: DragEvent): void;
  dropHandler(e: DragEvent): void;
  dragLeaveHandler(e: DragEvent): void;
}

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

  private updateObervers() {
    for (const observer of this.observers) {
      observer([...this.observables]);
    }
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
    this.updateObervers();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.observables.find(
      (project) => project.id === projectId
    );
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateObervers();
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
class ProjectItem
  extends UIComponent<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  private project: Project;

  get persons() {
    if (this.project.people === 1) return '1 Person';
    return `${this.project.people} Persons`;
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  protected configure() {
    this.elementToRender.addEventListener('dragstart', this.dragStartHandler);
  }

  protected renderContent() {
    this.elementToRender.querySelector('h2')!.textContent = this.project.title;
    this.elementToRender.querySelector(
      'h3'
    )!.textContent = `${this.persons} assigned`;
    this.elementToRender.querySelector(
      'p'
    )!.textContent = this.project.description;
  }

  @Autobind
  dragStartHandler(e: DragEvent) {
    e.dataTransfer!.setData('text/plain', this.project.id);
    e.dataTransfer!.effectAllowed = 'move';
  }

  @Autobind
  dragEndHandler(_e: DragEvent) {}
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
      alert('Input not valide!');
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

class ProjectList
  extends UIComponent<HTMLDivElement, HTMLElement>
  implements DropTarget {
  assignedProjects: Project[] = [];
  containerList: HTMLUListElement;

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', `${type}-projects`);
    this.containerList = this.elementToRender.querySelector(
      'ul'
    ) as HTMLUListElement;
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

    this.elementToRender.addEventListener('dragover', this.dragOverHandler);
    this.elementToRender.addEventListener('dragleave', this.dragLeaveHandler);
    this.elementToRender.addEventListener('drop', this.dropHandler);
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
      new ProjectItem(this.containerList.id, project);
    }
  }

  @Autobind
  dragOverHandler(e: DragEvent) {
    if (e.dataTransfer?.types[0] === 'text/plain') {
      e.preventDefault(); // default = drop not allowed
      const list = this.elementToRender.querySelector('ul') as HTMLUListElement;
      list.classList.add('droppable');
    }
  }

  @Autobind
  dropHandler(e: DragEvent) {
    const projectId = e.dataTransfer!.getData('text/plain');

    projectState.moveProject(
      projectId,
      this.type === 'active' ? ProjectStatus.ACTIVE : ProjectStatus.FINISHED
    );

    const list = this.elementToRender.querySelector('ul') as HTMLUListElement;
    list.classList.remove('droppable');
  }

  @Autobind
  dragLeaveHandler(_e: DragEvent) {
    const list = this.elementToRender.querySelector('ul') as HTMLUListElement;
    list.classList.remove('droppable');
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
