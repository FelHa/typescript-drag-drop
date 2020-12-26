import { UIComponent } from './ui-component';
import { ProjectItem } from './project-item';
import { ProjectState } from '../state/project-state';
import { DropTarget } from '../models/drag-drop';
import { ProjectStatus } from '../models/project-status';
import { Project } from '../models/project';
import { Autobind } from '../decorators/autobind';

export class ProjectList
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
    ProjectState.getInstance().addObserver((projects: Project[]) => {
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

    ProjectState.getInstance().moveProject(
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
