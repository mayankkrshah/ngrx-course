import {Component, OnInit} from '@angular/core';
import {CurrentThreadService} from "../services/current-thread.service";
import {Observable} from "rxjs";
import {ThreadsRestService} from "../services/threads-rest.service";
import {ParticipantService} from "../services/participant.service";

import {MessageNotificationsService} from "../services/message-notifications.service";
import {Participant} from "../../shared/model/participant";
import {ThreadDetailVM} from "../../shared/view-model/thread-detail.vm";
import {MessageVM} from "../../shared/view-model/message.vm";

@Component({
    selector: 'message-section',
    templateUrl: './message-section.component.html',
    styleUrls: ['./message-section.component.css']
})
export class MessageSectionComponent implements OnInit {

    participant: Participant;
    currentThread: ThreadDetailVM = null;


    constructor(
        private currentThreadService: CurrentThreadService,
        private threadsRestService: ThreadsRestService,
        private participantService: ParticipantService,
        private messageNotificationService: MessageNotificationsService) {

    }


    ngOnInit() {

        this.currentThreadService.thread$
            .debug('New current thread on Messages Section:')
            .subscribe(
            thread => this.currentThread = thread,
            console.error
        );

        this.participantService.user$
            .debug('New user on Messages Section:')
            .subscribe(
            participant => this.participant = participant
        );

        this.currentThreadService.thread$
            .debug('marking thread as read by user:')
            .filter(thread => !!thread)
            .mergeMap(thread => this.threadsRestService.markThreadAsReadByUser(thread.id))
            .subscribe(
                () => {},
                console.error
            );


        this.messageNotificationService.newMessagesForUser$
            .subscribe(
                message => {
                    if (message.threadId == this.currentThread.id) {
                        this.currentThread.messages.push(message);
                    }
                }
            );

    }


    onNewMessage(input:any) {

        const message = input.value;
        input.value = '';

        const newMessage: MessageVM = {
            participantName: this.participant.name,
            text: message,
            timestamp: new Date().getTime(),
            id: null,
            threadId: this.currentThread.id
        };

        this.currentThread.messages.push(newMessage);

        if (this.currentThread) {
            this.threadsRestService.saveNewMessage(this.currentThread.id, message)
                .debug('New message saved, server reponse:')
                .subscribe(
                    () => {},
                    console.error
                );
        }
    }




}











