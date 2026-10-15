import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { Loading } from './services/loading';
import { ToastContainer } from './components/toast-container/toast-container'; 
@Component({
  imports: [RouterOutlet, Header, Footer, ToastContainer],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('262CC3S2BAngularTawsFrontend');
  readonly loading = inject(Loading);
}
