import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Http, Headers, RequestOptions } from '@angular/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  topicText: String = 'notify';

  constructor(private http: Http) {}

  onSendNotification(form: NgForm) {
    console.log(form.value);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const options = new RequestOptions({headers: headers});

    const data = form.value;
    this.http.post('http://localhost:8000/send-notification', JSON.stringify(data), options).subscribe(() => {
      form.reset();
      console.log('Notification sent successfully');
    }, (err) => {
      console.log(err);
    });

  }

}
