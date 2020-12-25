import { State } from './state.js';
import { Project } from '../models/project.js';
import { ProjectStatus } from '../models/project-status.js';

export class ProjectState extends State<Project> {
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
