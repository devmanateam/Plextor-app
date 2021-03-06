import { Component, ViewChild } from '@angular/core';
import { LanguageService } from '../../../services/language/language.service';
import { IonSlides, NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UtilsService } from '../../../services/utils/utils.service';
import { AuthService } from '../../../services/auth/auth.service';
import { SurveyQuestion, LastQuestion, UserData } from '../../../interface/interface';

@Component({
    selector: 'app-survey-question',
    templateUrl: './survey-question.page.html',
    styleUrls: ['./survey-question.page.scss'],
})
export class SurveyQuestionPage {

    @ViewChild('slides', null) slides: IonSlides;

    bottomTitles = {
        french: 'Vos réponses resteront entièrement confidentielles',
        english: 'Your answers will remain entirely confidential'
    };
    buttonTitle = {
        french: 'Voir mon score',
        english: 'View my score'
    };

    type: number;
    title: string;
    questions: SurveyQuestion[];
    answers: string[];
    hasScore: string[];
    scores: number[];
    currentIndex: number;
    lastAnswers: boolean[];
    lastQuestion: LastQuestion;

    ratingweekoverall: number = 0;
    ratingenergylevel: number = 0;
    ratingmotivationlevel: number = 0;
    ratingworkload: number = 0;
    ratingstresslevel: number = 0;

    currentUser: UserData;
    constructor(
        private http: HttpClient,
        private navController: NavController,
        private language: LanguageService,
        private utils: UtilsService, private auth: AuthService
    ) {
    }

    async ngOnInit() {

        this.auth.currentUser().then((currentUser: UserData) => {
            this.currentUser = currentUser;
        })

        this.lastQuestion = {
            question: 'In the past month, have any of the following made it hard for you to work effectively (you can choose multiple options)',
            answers: [
                'Lacking resources to do the job',
                'Uncertainty if my job is secure',
            ]
        };
        this.type = Number(localStorage.getItem('surveyType'));
        if (this.type === 0) {
            this.title = 'wellnessCheck';
        } else if (this.type === 1) {
            this.title = 'stressCheck';
        } else if (this.type === 2) {
            this.title = 'WeeklyWellbeing';
        }
        this.hasScore = ['', '', '', '', ''];
        this.scores = [0, 0, 0, 0, 0];
        this.currentIndex = 0;
        await this.getQuestions();
        await this.getAnswers();
        if (!this.type) await this.getLastQuestion();
    }

    async ionViewWillEnter() {
    }

    answerLastQuestion(e, index) {
        this.lastAnswers[index] = e.detail.checked;
    }

    setScore(index: number, score: number) {
        this.hasScore[index] = 'has-score';
        this.scores[index] = 4 - score;
    }

    async slideChanged() {
        this.currentIndex = await this.slides.getActiveIndex();
    }

    async slideMove(index) {
        this.currentIndex = index;
        await this.slides.slideTo(index);
    }

    nextQuestion() {
        this.slideMove(this.currentIndex + 1);
    }

    prevQuestion() {
        this.slideMove(this.currentIndex - 1);
    }

    calcScore() {
        const score = this.scores.reduce((a, b) => a + b, 0);
        const percent = score * 5;
        localStorage.setItem('surveyPercent', percent + '');
        return { score, percent };
    }

    navigateToWeeklySurveyScore() {
        const score = this.calcScore();
        this.utils.showLoading().then(loading => {
            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            const params = {
                // deviceInfo,
                user_id: this.currentUser.id,
                question1: this.ratingweekoverall,
                question2: this.ratingenergylevel,
                question3: this.ratingmotivationlevel,
                question4: this.ratingworkload,
                question5: this.ratingstresslevel
            };
            this.http.post(environment.surveyApi + 'set_weekly_survey', { ...params }).subscribe((res) => {
                console.log(">>>>>>>>>>>success", res);
                this.utils.showToast('Your email address is required').then(async () => {
                    
                });
                loading.dismiss().then(async () => {
                    await this.navController.navigateRoot('/tabs/surveys');
                });
            });
        });
    }

    navigateToSurveyScore() {
        const score = this.calcScore();
        this.utils.showLoading().then(loading => {
            const deviceInfo = JSON.parse(localStorage.getItem('deviceInfo'));
            const params = { deviceInfo, survey_type: this.type, score };
            this.http.post(environment.surveyApi + 'set_score', { ...params }).subscribe(() => {
                if (!this.type) {
                    const body = { deviceInfo, answers: this.lastAnswers.join() };
                    this.http.post(environment.surveyApi + 'save_survey_answers', { ...body }).subscribe(() => { });
                }
                loading.dismiss().then(async () => {
                    await this.navController.navigateForward('/survey-score');
                });
            });
        });
    }

    async getQuestions() {
        const surverys = ['wellness', 'stress'];
        await this.http.get(environment.surveyApi + 'questions', { params: { type: surverys[this.type] } }).toPromise().then((response: any) => {
            this.questions = response;
        });
    }

    async getAnswers() {
        const surverys = ['wellness', 'stress'];
        await this.http.get(environment.surveyApi + 'answers', {}).toPromise().then((response: any) => {
            this.answers = response;
        });
    }

    async getLastQuestion() {
        await this.http.get(environment.surveyApi + 'lastQuestion', { params: { language: this.language.getCurrentLanguage() } }).toPromise().then((response: any) => {
            this.lastQuestion = response;
            this.lastAnswers = [];
            for (var answer of response.answers) {
                this.lastAnswers.push(false);
            }
        });
    }

}
