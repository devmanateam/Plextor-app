import { Component, OnInit } from '@angular/core';
import { Events, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { LanguageService } from '../../../services/language/language.service';
import { UserInterfaceService } from '../../../services/user-interface/user-interface.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Calendar, CalendarDay, CanvasRect, CoachingReview, Rect, Time, CoachingSession, UserProfile } from '../../../interface/interface';
import { UtilsService } from '../../../services/utils/utils.service';
import { CallModalPage } from '../../modals/call-modal/call-modal.page';
import { Zoom } from '@ionic-native/zoom/ngx';

@Component({
    selector: 'app-contacts',
    templateUrl: './contacts.page.html',
    styleUrls: ['./contacts.page.scss'],
})
export class ContactsPage implements OnInit {

    zoomToken = '';
    zoomAccessToken = '';
    userId = '';
    timelineData: any[];
    sessionScheduleOpened: boolean;
    sessionGuideOpened: boolean;
    sessions: UserProfile[];
    currentDate: string;
    calendar: Calendar;
    selectedDay: CalendarDay;
    count: number;

    constructor(
        private http: HttpClient,
        private events: Events,
        private navController: NavController,
        private modalController: ModalController,
        private language: LanguageService,
        private ui: UserInterfaceService,
        private utils: UtilsService,
        private callNumber: CallNumber,
        private zoomService: Zoom, private toastCtrl: ToastController
    ) {
    }

    async ngOnInit() {
    }


    async ionViewWillEnter() {
        this.ui.pageContainerScrollToTop(document.getElementsByClassName('page-container')[0] as HTMLDivElement);
        this.timelineData = [
            this.language.getWordByLanguage('howWorkStepDescription1'),
            this.language.getWordByLanguage('howWorkStepDescription2'),
            this.language.getWordByLanguage('howWorkStepDescription3'),
            this.language.getWordByLanguage('howWorkStepDescription4'),
        ];
        this.sessionScheduleOpened = true;
        this.sessionGuideOpened = true;
        this.currentDate = '';
        this.calendar = null;
        this.selectedDay = null;

        await this.getCalendarDates();
        await this.getUpcomingSessions();
    }

    checkScroll(e) {
        if (this.ui.watchPageControllerScrolled(e.target)) {
            this.events.publish('page-not-scrolled');
        } else {
            this.events.publish('page-scrolled');
        }
    }

    toggleSessionScheduleOpened() {
        this.sessionScheduleOpened = !this.sessionScheduleOpened;
    }

    toggleSessionGuideOpened() {
        this.sessionGuideOpened = !this.sessionGuideOpened;
    }

    // getUpcomingSessions() {
    //     this.utils.showLoading().then(loading => {
    //         const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
    //         this.http.get(environment.coachingApi + 'sessions', {
    //             params: { ...deviceInfo }
    //         }).subscribe((response: any) => {
    //             this.sessions = response.data;
    //             console.log('session ===> ', this.sessions);
    //             this.showNotification();
    //             loading.dismiss();
    //         });
    //     });
    // }

    async getUpcomingSessions() {
        this.utils.showLoading().then(loading => {
            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            this.http.post(environment.coachingApi + 'getComingSessions', {
                deviceInfo: deviceInfo,
                oneDay: true,
                year: this.calendar.year,
                month: this.calendar.month,
                day: this.selectedDay.day,
            }).subscribe((response: any) => {
                console.log(">>>>>>>>>>>upcoming sessions:", response);

                this.sessions = response;
                this.count = response.length;
                loading.dismiss();
            });
        });
    }

    async getCalendarDates(direction?: string) {
        const result = await this.utils.showLoading({
            message: 'Loading Calendar...'
        }).then(async (loading) => {
            await this.sendCalendarRequest(direction).then(async (calendar: Calendar) => {
                this.calendar = calendar;
                this.selectedDay = this.calendar.today as CalendarDay;
                this.currentDate = this.calendar.year + '-' + this.calendar.month + '-' + this.calendar.today.day;
                await loading.dismiss();
            });
        });
        await this.getUpcomingSessions();
    }

    async selectDay(weekIndex: number, dayIndex: number) {
        const prevSelected = this.calendar.days[this.selectedDay.week][this.selectedDay.weekday] as CalendarDay;
        const curSelected = this.calendar.days[weekIndex][dayIndex] as CalendarDay;
        if (curSelected.upcoming || !curSelected.enable) {
            this.utils.showToast('You cannot select this day').then(() => {
            });
        } else {
            prevSelected.selected = 0;
            curSelected.selected = 1;
            this.selectedDay = curSelected;
        }
        await this.getUpcomingSessions();
    }

    getTime(timestamp) {
        return timestamp.substring(11, 16);
    }

    callNow(session) {
        console.log("session:", session);
        const options = {
            no_driving_mode: true,
            no_invite: true,
            no_meeting_end_message: true,
            no_titlebar: false,
            no_bottom_toolbar: false,
            no_dial_in_via_phone: true,
            no_dial_out_to_phone: true,
            no_disconnect_audio: true,
            no_share: true,
            no_audio: true,
            no_video: true,
            no_meeting_error_message: true
        };
        let meetingNumber = session.meetingid;
        alert("meeting number:" + JSON.stringify(session));
        // let meetingNumber = '364-499-973';
        let meetingPassword = '';
        let displayName = session.name;
        // Call join meeting method.
        // this.zoomService.startMeeting(meetingNumber, options).then((success) => {
        //     console.log(success);
        //     this.presentToast(success);
        // }).catch((error) => {
        //     console.log(error);
        //     this.presentToast(error);
        // });
        // this.zoomService.startMeetingWithZAK(meetingNumber,
        //     displayName, this.zoomToken, this.zoomAccessToken, this.userId, options).then((success) => {
        //         console.log(success);
        //         this.presentToast(success);
        //     }).catch((error) => {
        //         console.log(error);
        //         this.presentToast(error);
        //     });
        this.zoomService.joinMeeting(meetingNumber, meetingPassword, displayName, options)
            .then((success) => {
                console.log(success);
                this.presentToast(success);
            }).catch((error) => {
                console.log(error);
                this.presentToast(error);
            });

    }

    async presentToast(text) {
        const toast = await this.toastCtrl.create({
            message: text,
            duration: 10000,
            position: 'top'
        });
        toast.present();
    }
    async sendCalendarRequest(direction: string): Promise<Calendar> {
        return new Promise(resolve => {
            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            const params = { ...deviceInfo };
            if (this.currentDate !== '') {
                params.date = this.currentDate;
            }
            if (direction) {
                params.direction = direction;
            }
            this.http.get(environment.coachingApi + 'calendar', {
                params
            }).subscribe(async (calendar: any) => {
                resolve(calendar.calendar);
            });
        });
    }

    milliseconds(date?: string) {
        return new Date(date).getTime();
    }
}
