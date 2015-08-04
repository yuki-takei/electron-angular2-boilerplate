import 'reflect-metadata';
import 'es6-shim';

import {Component, View, bootstrap} from 'angular2/angular2';

// Annotation section
@Component({
  selector: 'my-app'
})
@View({
  template: '<h1>Hello {{ name }}</h1>'
})
// Component controller
class MyAppComponent {
  name: string;
  constructor() {
    this.name = 'Alice';
  }
}

bootstrap(MyAppComponent);
