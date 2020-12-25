import { Observer } from '../models/observer.js';

export abstract class State<T> {
  protected observers: Observer<T>[] = [];
  protected observables: T[] = [];

  addObserver(observer: Observer<T>) {
    this.observers.push(observer);
  }
}
