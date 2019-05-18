import React, { Component } from 'react';
import fire from './Config/Fire';
import * as firebase from 'firebase';
import Workbook from 'react-excel-workbook'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AddQuiz from './AddQuiz';
import Loader from './Loader';

class Home extends Component {
    constructor(props) {
        super(props);
        this.logout = this.logout.bind(this);
        this.state = {
            loading: true,
            _attendance: false,
            marks: false,
            quiz: false,
            firstname: '',
            duration: '',
            lastname: '',
            teacherId: '',
            stream: '',
            class: '',
            countQuiz: -1,
            stream_sem: '',
            startDate: '',
            endDate: '',
            date: [],
            list: [],
            isVisible: false,
            studentList: [],
            studentKey: [],
            DBdates: [],
            attendance: [],
            excelObject: [],
            marksObject: [],
            column: [],
            _startDate: new Date(),
            _endDate: new Date(),
            jsonData: null,
            jsonKey: null,
            exist: true,
            quizExist: true,
            selectedQuiz: -1,
            message: '',
            clicked:false,
        };
    }
    startdateChange(date) {
        this.setState({
            _startDate: date
        }, () => {
            const { _startDate } = this.state;
            let year = _startDate.getFullYear();
            let month = _startDate.getMonth() + 1;
            let day = _startDate.getDate();
            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
            let date = year + "-" + month + "-" + day;
            this.setState({ startDate: date });
        });
    }
    enddateChange(date) {
        this.setState({
            _endDate: date
        }, () => {
            const { _endDate } = this.state;
            let year = _endDate.getFullYear();
            let month = _endDate.getMonth() + 1;
            let day = _endDate.getDate();
            if (day < 10) {
                day = '0' + day;
            }
            if (month < 10) {
                month = '0' + month;
            }
            let date = year + "-" + month + "-" + day;
            this.setState({ endDate: date }, () => {
                const { startDate, endDate } = this.state;
                const y1 = startDate.substring(0, 4);
                const y2 = endDate.substring(0, 4);
                const m1 = startDate.substring(5, 7);
                const m2 = endDate.substring(5, 7);
                const d1 = startDate.substring(8, 10);
                const d2 = endDate.substring(8, 10);
                let flag = 0;
                if (y2 >= y1) {
                    if (m2 >= m1) {
                        if ((m2 === m1 && d2 >= d1) || (m2 > m1)) {
                            flag = 1;
                        }
                    }
                }
                if (flag === 1) {
                    console.log("greater");
                }
                else {
                    alert("End Date can't be before Start Date, Try again")
                }
            });
        });
    }
    componentDidMount() {
        const { currentUser } = firebase.auth();
        firebase.database().ref('teacher').child(currentUser.uid)
            .once("value")
            .then(snap => {
                if (!(snap.child('teacherId').exists())) {
                    alert('only teaher login')
                    fire.auth().signOut();
                }
                else {
                    firebase
                        .database()
                        .ref('teacher/')
                        .child(currentUser.uid)
                        .once('value', snap =>
                            this.setState({
                                teacherId: snap.val().teacherId,
                                firstname: snap.val().firstname,
                                lastname: snap.val().lastname,
                                stream: snap.val().stream,
                                class: snap.val().stream_sem,
                            }, () => {
                                let studentList = [], studentKey = [];
                                firebase.database().ref('users').orderByChild('stream_sem').equalTo(this.state.class)
                                    .once("value")
                                    .then(snapshot => {
                                        studentList = Object.values(snapshot.val());
                                        studentKey = Object.keys(snapshot.val());
                                        this.setState({
                                            studentList: studentList,
                                            studentKey: studentKey
                                        })
                                    });
                                firebase.database().ref('quiz')
                                    .once("value")
                                    .then(snap => {
                                        const Exist = snap.child(this.state.class).exists();
                                        if (Exist) {
                                            firebase.database().ref(`quiz/${this.state.class}`)
                                                .once("value")
                                                .then(snap => {
                                                    const jsonDta = Object.values(snap.val());
                                                    const jsonkey = Object.keys(snap.val());
                                                    this.setState({ jsonData: jsonDta, jsonKey: jsonkey }, () => {
                                                        let flag = 0, flagQuiz = 0;
                                                        for (let i = 0; i < jsonkey.length; i++) {
                                                            if (jsonkey[i] === 'marks') {
                                                                flag = 1;
                                                            }
                                                            if (jsonkey[i] === 'quiz') {
                                                                flagQuiz = 1;
                                                            }
                                                        }
                                                        if (flag === 0) {
                                                            this.setState({ exist: false });
                                                        }
                                                        if (flagQuiz === 0) {
                                                            this.setState({ quizExist: false });
                                                        }
                                                    })
                                                })
                                        } else {
                                            this.setState({ exist: false, quizExist: false })
                                        }
                                    });
                            })
                        );
                }
            });
            setInterval(() => {this.setState({ loading: false })}, 4000);
    }
    logout() {
        fire.auth().signOut();
    }
    generate = () => {
        const { DBdates, studentKey, studentList, attendance, date } = this.state;
        let excelObject = [];
        for (let i = 0; i < studentList.length; i++) {
            const fname = studentList[i].firstname;
            const lname = studentList[i].lastname;
            let newObj = {
                key: i.toString(),
                name: fname.concat(' ').concat(lname),
                roll: studentList[i].uroll
            }
            for (let j = 0; j < date.length; j++) {
                const currentDate = date[j];
                const year = currentDate.substring(4);
                const month = currentDate.substring(0, 2);
                const day = currentDate.substring(2, 4);
                let flag = 0, pre = 0;
                for (let k = 0; k < DBdates.length; k++) {
                    if (DBdates[k] === date[j]) {
                        flag = 1;
                        let present = 0;
                        for (let l = 0; l < attendance[k].length - 1; l++) {
                            if (attendance[k][l].userId === studentKey[i]) {
                                present = 1;
                                break;
                            }
                        }
                        if (present === 1) {
                            pre = 1;
                        }
                        break;
                    }
                }
                const _date = day.concat('-').concat(month).concat('-').concat(year);
                if (flag === 0) {
                    newObj[_date] = "No Class";
                }
                else if (flag === 1 && pre === 0) {
                    newObj[_date] = "Absent";
                }
                else if (flag === 1 && pre === 1) {
                    newObj[_date] = "Present";
                }
            }
            excelObject = [...excelObject, newObj];
        }
        this.setState({ excelObject: excelObject })
        let column = ['key', 'name', 'roll'];
        for (let i = 0; i < date.length; i++) {
            const currentDate = date[i];
            const year = currentDate.substring(4);
            const month = currentDate.substring(0, 2);
            const day = currentDate.substring(2, 4);
            const _date = day.concat('-').concat(month).concat('-').concat(year);
            column = [...column, _date];
        }
        this.setState({ column: column });
    }
    resolve = () => {
        const { DBdates } = this.state;
        let attendance = [];
        for (let i = 0; i < DBdates.length; i++) {
            firebase.database().ref(`attendance/${this.state.class}/${DBdates[i]}`)
                .once("value")
                .then(snapshot => {
                    const list = Object.values(snapshot.val());
                    attendance.push(list);
                });
        }
        setInterval(() => { this.setState({ attendance: attendance }, () => { this.generate() }); }, 3000);
    }
    getDateArray = () => {
        const { startDate, endDate, list } = this.state;
        var start = new Date(startDate); //YYYY-MM-DD
        var end = new Date(endDate); //YYYY-MM-DD

        var arr = new Array();
        var dt = new Date(start);
        while (dt <= end) {
            var today = new Date(dt);
            var dd = today.getDate();
            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            today = mm + dd + yyyy;
            arr.push(today);
            dt.setDate(dt.getDate() + 1);
        }
        let dates = [];
        this.setState({ date: arr });
        firebase.database().ref('attendance').child(this.state.class)
            .once("value")
            .then(snap => {
                dates = Object.keys(snap.val());
                this.setState({ DBdates: dates })
            });
        setInterval(() => { this.resolve() }, 3000);
    }
    renderExcelButton = () => {
        const { excelObject } = this.state;
        if (excelObject.length !== 0) {
            if(this.state.clicked){
                this.setState({ clicked: false })
            }
            const p = this.state.column.map((a,index) => { return (<Workbook key={index} label={a} value={a} />) });
            return (
                <div className="row text-center" style={{ marginTop: '100px' }}>
                    <Workbook filename="Attendance.xlsx" element={<button className="btn btn-lg btn-primary">Download Excel</button>}>
                        <Workbook.Sheet data={this.state.excelObject} name="Attedance">
                            {p}
                        </Workbook.Sheet>
                    </Workbook>
                </div>
            );
        } else if(this.state.clicked) {
            return(
                <div>
                    <p>Fetching Data...</p>
                </div>
            )
        }
    }
    _handleClick(e) {
        e.preventDefault();
        this.setState({
            isVisible: !this.state.isVisible
        });
    }
    renderDropdown() {
        const { jsonData } = this.state;
        let quizList = Object.values(jsonData);
        quizList = Object.keys(quizList[1]);
        quizList = quizList.map((quiz, index) => {
            return (
                <li key={index} onClick={() => { this.setState({ selectedQuiz: index, message: quiz }) }}><a href="#">{quiz}</a></li>
            )
        })
        return (
            <ul className="dropdown">
                {quizList}
            </ul>
        );
    }
    generateMarks = (e) => {
        e.preventDefault();
        const { message, selectedQuiz, jsonData, studentKey, studentList } = this.state;
        if (selectedQuiz !== -1) {
            if (message !== '') {
                this.setState({ message: '' });
            }
            let marksList = Object.values(jsonData);
            marksList = Object.values(marksList[1])[selectedQuiz];
            marksList = Object.values(marksList);
            let marksObject = [];
            for (let i = 0; i < studentList.length; i++) {
                const fname = studentList[i].firstname;
                const lname = studentList[i].lastname;
                let newObj = {
                    Key: i.toString(),
                    Name: fname.concat(' ').concat(lname),
                    Roll: studentList[i].uroll
                }
                let pos = -1;
                for (let j = 0; j < marksList.length; j++) {
                    const marks = marksList[j];
                    if (marks.userId === studentKey[i]) {
                        pos = j;
                        break;
                    }
                }
                if (pos !== -1) {
                    const marks = marksList[pos];
                    newObj['Score'] = marks.score;
                } else {
                    newObj['Score'] = 'Absent';
                }
                marksObject = [...marksObject, newObj];
            }
            this.setState({ marksObject: marksObject });
        } else {
            this.setState({ message: 'Select A Quiz!' })
        }
    }
    renderMarksButton = () => {
        const { marksObject } = this.state;
        const column = ['Key', 'Name', 'Roll', 'Score'];
        console.log(this.state.clicked);
        if (marksObject.length !== 0) {
            const p = column.map(a => { return (<Workbook label={a} value={a} />) });
            return (
                <div className="row text-center" style={{ marginTop: '100px' }}>
                    <Workbook filename="Result.xlsx" element={<button className="btn btn-lg btn-primary">Download Excel</button>}>
                        <Workbook.Sheet data={marksObject} name="Quiz Marks">
                            {p}
                        </Workbook.Sheet>
                    </Workbook>
                </div>
            );
        } 
    }
    showQuizName = () => {
        if (this.state.exist) {
            return (
                <div className="dropdown">
                    <table style={{ width: "60%" }}>
                        <thead>
                        <tr>
                            <th>
                                <button className="btn btn-primary" type="button"
                                    onClick={(e) => this._handleClick(e)} tabIndex="1" onFocus={(e) => this._handleClick(e)}>
                                    Quiz List
                                </button>

                            </th>
                            <th>
                                <button className="btn btn-primary" type="button"
                                    onClick={(e) => this.generateMarks(e)}>
                                    Generate Excel
                                </button>
                            </th>
                        </tr>
                        <tr>
                            <th>
                                {this.state.isVisible ? this.renderDropdown() : null}
                            </th>
                            <th>
                                {this.state.message}
                            </th>
                        </tr>
                        </thead>
                    </table>
                    {this.renderMarksButton()}
                </div>
            );
        } else {
            return (
                <div>
                    <h6>No Quiz Exists</h6>
                </div>
            )
        }
    }
    renderAttendanceBody = () => {
        const { _attendance } = this.state;
        if(_attendance) {
            return (
                <div>
                    <div><hr /></div>
                    <h3>Generate Attendance Excel: </h3>
                    <form>
                        <label>Start Date:  </label>
                        <DatePicker
                            selected={this.state._startDate} onChange={this.startdateChange.bind(this)}
                        />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <label>End Date:    </label>
                        <DatePicker
                            selected={this.state._endDate} onChange={this.enddateChange.bind(this)}
                        />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <button onClick={(e)=>{e.preventDefault();this.getDateArray();this.setState({clicked:true})}}>Generate Excel</button>
                    </form>
                    <div className="row text-center" style={{ marginTop: '30px' }}>
                        {this.renderExcelButton()}
                    </div>
                    <div><hr /></div>
                </div>
            );
        }
    }
    renderQuizMarksBody = () => {
        const { marks } = this.state;
        if(marks) {
            return (
                <div>
                    <div><hr /></div>
                    <h3>Generate Quiz Result: </h3>
                    {this.showQuizName()}
                    <div><hr /></div>
                </div>
            );
        }
    }
    renderQuiz = () => {
        const { quiz } = this.state;
        if(quiz) {
            return (
                <div>
                    <div><hr /></div>
                    <AddQuiz jsonData = {this.state.jsonData} 
                        exist = {this.state.quizExist}
                        jsonKey = {this.state.jsonKey} 
                        class = {this.state.class} 
                        countQuiz = {this.state.countQuiz}/>
                    <div><hr /></div>
                </div>
            );
        }
    }
    renderBody = () => {
        return(
            <div>
                {this.renderAttendanceBody()}
                {this.renderQuizMarksBody()}
                {this.renderQuiz()}
                
            </div>
        );
    }
    displayAttendance = () => {
        const { _attendance, marks, quiz } = this.state;
        if(_attendance === false) {
            return(
                <button id="_attendance" value="true" onClick={(e)=>{e.preventDefault();this.setState({ _attendance: true, marks: false, quiz: false })}}>Show Attendance</button>
            );
        } else {
            return(
                <button id="_attendance" value="false" onClick={(e)=>{e.preventDefault();this.setState({ _attendance: false, marks: false, quiz: false })}}>Hide Attendance</button>
            );
        }
    }
    dislayQuizMArks = () => {
        const { _attendance, marks, quiz } = this.state;
        if(marks === false) {
            return(
                <button id="marks" value="false" onClick={(e)=>{e.preventDefault();this.setState({ _attendance: false, marks: true, quiz: false })}}>Show Marks</button>
            );
        } else {
            return(
                <button id="marks" value="true" onClick={(e)=>{e.preventDefault();this.setState({ _attendance: false, marks: false, quiz: false })}}>Hide Marks</button>
            );
        }
    }
    displayQuiz = () => {
        const { _attendance, marks, quiz } = this.state;
        if(quiz === false) {
            return(
                <button id="quiz" value="false" onClick={(e)=>{e.preventDefault();this.setState({ _attendance: false, marks: false, quiz: true })}}>Show Quiz</button>
            );
        } else {
            return(
                <button id="quiz" value="true" onClick={(e)=>{e.preventDefault();this.setState({ _attendance: false, marks: false, quiz: false })}}>Hide Quiz</button>
            );
        }
    }
    renderButtons = () => {
        return(
            <div style={{display: 'flex', width:'60%', flexDirection: "row", justifyContent: 'space-around'}}>
                {this.displayAttendance()}
                {this.dislayQuizMArks()}
                {this.displayQuiz()}
                <input style={{color: 'red'}} type='button' value="Logout" onClick={this.logout} />
            </div>
        );
    }
    Body = () => {
        const { firstname, lastname, teacherId } = this.state;
        if(this.state.loading) {
            return(<Loader loading={this.state.loading} />);
        }
        else {
            return (
                <div>
                    <div style={{flexDirection: "row"}}>
                        <p>Name: {firstname.concat(' ').concat(lastname)}</p>
                        <p>Teacher ID: {teacherId}</p>
                    </div>
                    {this.renderButtons()}
                    {this.renderBody()}
                </div>
            );
        }
    }
    render() {
        
        return (
            <div className="Home">
                {this.Body()}
            </div>
        );
    }
};
export default Home;