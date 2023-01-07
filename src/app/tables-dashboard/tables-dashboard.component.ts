import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message.model';
import { MessagesService } from './../_services/messages.service';

@Component({
  selector: 'app-tables-dashboard',
  templateUrl: './tables-dashboard.component.html',
  styleUrls: ['./tables-dashboard.component.scss']
})
export class TablesDashboardComponent implements OnInit {
  message: Message = {
    channelId: 'a31f78766da04f9e95ce52a85cf13bdd',
    to: '14123549611',
    type: 'text',
    content: {
      text: 'Your table is ready, please come take a seat!'
    }
  };

  constructor(
    public messagesService: MessagesService,
  ) { 

  }

  ngOnInit(): void {
  }

  test(){
    console.log("sending message");
    this.messagesService.createMessage(this.message);
    console.log("Hopefully it sent");
  }

}
