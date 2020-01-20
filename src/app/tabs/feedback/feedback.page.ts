import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
})
export class FeedbackPage implements OnInit {

  feedbackForm: FormGroup;
  constructor() {

    this.feedbackForm = this.getFeedbackFormFormGroup();
  }

  ngOnInit() {
  }

  getFeedbackFormFormGroup() {
    return new FormGroup({
      coach: new FormControl('', Validators.required),
      client: new FormControl('', Validators.required),
      session_date: new FormControl('', Validators.required),
      status: new FormControl(''),
      duration: new FormControl(''),
      rating: new FormControl(0),
      comment: new FormControl(''),
      session_required: new FormControl('')
    });
  }

  changeShareType() {
    
  }
}
