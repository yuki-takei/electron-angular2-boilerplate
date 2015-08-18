import 'reflect-metadata';
import 'es6-shim';
import 'less';

import {Component, View, bootstrap} from 'angular2/angular2';
import 'angular-material';

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
