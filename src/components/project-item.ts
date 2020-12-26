import { Autobind } from '../decorators/autobind';
import { Draggable } from '../models/drag-drop';
import { Project } from '../models/project';
import { UIComponent } from './ui-component';

export class ProjectItem
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
