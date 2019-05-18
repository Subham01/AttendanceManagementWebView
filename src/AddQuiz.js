import React, { Component } from 'react';
import * as firebase from 'firebase';
import Modal from "react-responsive-modal";
import Loader from './Loader';

export default class AddQuiz extends Component {
    state = {
        loading: true,
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctoption: '',
        duration: '',
        questionList: [],
        countQuiz: -1,
        count: 1,
        quizFlag: false,
        jdata: null,
        qno: 0,
        editSelect: -1,
        open: false,
    }
    componentDidMount() {
        let jdata;
        let quizFlg = 0;
        const { jsonData, exist, jsonKey } = this.props;
        console.log(exist);
        if (exist) {
            for (let i = 0; i < jsonKey.length; i++) {
                if (jsonKey[i] === 'quiz') {
                    quizFlg = 1;
                    break;
                }
            }
        }
        if (quizFlg === 1) {
            if (jsonData.length === 3) {
                jdata = jsonData[2].quiz1;
            }
            else {
                jdata = jsonData[1].quiz1;
            }
            this.setState({ loading: false, jdata: jdata, quizFlag: true });
        } else {
            this.setState({ loading: false })
        }
    }
    onOpenModal = () => {
        this.setState({ open: true });
    };

    onCloseModal = () => {
        this.setState({ open: false });
    };
    getQuizNumber = () => {
        console.log("class " + this.props.class)
        firebase.database().ref(`quiz/${this.props.class}`)
            .once("value")
            .then(snap => {
                const Exist = snap.child('countQuiz').exists()
                if (Exist === false) {
                    firebase.database().ref(`quiz/${this.props.class}`)
                        .set({ countQuiz: 0 })
                        .then(this.setState({ countQuiz: 0 }))
                }
                else {
                    this.setState({ countQuiz: snap.val().countQuiz })
                }
            })
    };

    handleChange = (e) => {
        this.setState({ [e.target.id]: e.target.value });
    }
    addQuestion = (e) => {
        if (this.state.countQuiz === -1) {
            this.getQuizNumber();
        }
        e.preventDefault();
        const { question, option1, option2, option3, option4, correctoption, editSelect, duration } = this.state;
        if(!duration) {
            alert('Duration Of exam missing!');
        }
        if(question && option1 && option2 && option3 && option4 && correctoption) {
            const options = {
                options1: option1,
                options2: option2,
                options3: option3,
                options4: option4,
            }
            const newQuestion = {
                correctoption: correctoption,
                options: options,
                question: question
            };
            if(editSelect !== -1) {
                const ques = "question" + editSelect;
                const _question = {};
                _question[ques] = newQuestion;
                let questionList = this.state.questionList;
                questionList[editSelect] = _question;
                this.setState({ questionList: questionList, editSelect: -1, question: '', option1: '', option2: '', option3: '', option4: '', correctoption: '' });
            } else {
                const ques = "question" + this.state.count;
                this.setState({ count: this.state.count + 1 });
                const _question = {};
                _question[ques] = newQuestion;
                let questionList = this.state.questionList;
                questionList = [...questionList, _question];
                this.setState({ questionList: questionList, question: '', option1: '', option2: '', option3: '', option4: '', correctoption: '' });
            }
            let radioButton = document.getElementsByName("option");
            for(let i=0;i<radioButton.length;i++)
                radioButton[i].checked = false;
        } else {
            alert('Feild missing')
        }
    };
    correctAnswere = (event) => {
        this.setState({ correctoption: event.target.value })
    };
    submitQuestion = (e) => {
        e.preventDefault();
        const { questionList, duration } = this.state;
        firebase.database().ref(`quiz/${this.props.class}`)
            .update({ countQuiz: this.state.countQuiz + 1 })
        firebase.database().ref(`quiz/${this.props.class}/quiz`)
            .set({ quiz1: questionList, duration: duration }, () => this.setState({ duration: '' }))
            .then(window.location.reload())
    };
    quizForm = () => {
        return (
            <div>
                <label>Enter Time Duration:</label>&nbsp;&nbsp;&nbsp;&nbsp;
                <input className="input-question" value={this.state.duration} placeholder="Minutes"
                    onChange={this.handleChange.bind(this)} id="duration" type="text" /><br /><br />
                <form>
                    <label>Question: </label>
                    <input className="input-question" value={this.state.question}
                        onChange={this.handleChange.bind(this)} id="question" type="text" required /><br />
                    <label>Option 1: </label>
                    <input className="input-style" value={this.state.option1}
                        onChange={this.handleChange.bind(this)} id="option1" type="text" required /><br />
                    <label>Option 2: </label>
                    <input className="input-style" value={this.state.option2}
                        onChange={this.handleChange.bind(this)} id="option2" type="text" required /><br />
                    <label>Option 3: </label>
                    <input className="input-style" value={this.state.option3}
                        onChange={this.handleChange.bind(this)} id="option3" type="text" required /><br />
                    <label>Option 4: </label>
                    <input className="input-style" value={this.state.option4}
                        onChange={this.handleChange.bind(this)} id="option4" type="text" required /><br />
                    <label>
                        Correct Option:
                    </label>
                    <div onChange={this.correctAnswere.bind(this)}>
                        <input type="radio" value="options1" name="option" id="option" />Option 1
                        <input type="radio" value="options2" name="option" id="option"/>Option 2
                        <input type="radio" value="options3" name="option" id="option"/>Option 3
                        <input type="radio" value="options4" name="option" id="option"/>Option 4
                    </div>
                    <br />
                    <button onClick={this.addQuestion.bind(this)}>Add</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <button onClick={this.onOpenModal}>Submit</button>
                    <Modal open={this.state.open} onClose={this.onCloseModal} center>
                        {this.displayQuiz()}
                        <button onClick={this.submitQuestion.bind(this)} style={{color:'green'}}>Submit</button>
                    </Modal>
                </form>
            </div>
        );
    }
    editSelected = (index) => {
        let questionList = Object.values(this.state.questionList);
        const questionOBj = questionList[index];
        const question = Object.values(questionOBj)[0].question;
        const correctoption = Object.values(questionOBj)[0].correctoption;
        const options = Object.values(questionOBj)[0].options;
        const option1 = options.options1;
        const option2 = options.options2;
        const option3 = options.options3;
        const option4 = options.options4;
        this.setState({ question, option1, option2, option3, option4, correctoption });
        let radioButton = document.getElementsByName("option");
        const i = correctoption.substr(correctoption.length - 1)
        radioButton[i-1].checked = true;
    }
    displayQuiz = () => {
        if(this.state.questionList.length !== 0) {
            let questionList = Object.values(this.state.questionList);
            const question = questionList.map((ques, index) => {
                const _question = Object.values(ques)[0];
                const options = _question.options;
                const option = Object.keys(options).map(function (k) {
                    return (<div key={k} style={{ margin: 10 }}>
                        <div style={{ borderWidth: 0.5, }}>
                            <p>{k.substr(k.length - 1)}. {options[k]}</p>
                        </div>
                    </div>)
                });
                return(
                    <div key={index}>
                        <p>Q{index+1}. {_question.question}</p>
                        {option}
                        <p>correct Answere: {_question.options[_question.correctoption]}</p>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <button onClick={(e)=>{e.preventDefault();this.setState({ editSelect: index,open:false });this.editSelected(index)}}>Edit Question</button>
                        <div><hr /></div>
                    </div>
                );
            });
            let time = "";
            if(this.state.duration === '') {
                time = "Not SELECTED";
            } else {
                time = this.state.duration + "min";
            }
            return(
                <div>
                    <h3>List of Questions</h3>
                    <p>Duration: {time}</p>
                    <div>
                        {question}
                    </div>
                </div>
            );
        } else {
            return(
                <div>
                    <h3>No Question Added</h3>
                </div>
            );
        }
    }
    newQuiz = () => {
        return (
            <div>
                {this.quizForm()}
                {this.displayQuiz()}
            </div>
        );
    }
    next = (e) => {
        e.preventDefault();
        const { qno, jdata } = this.state;
        if (qno + 1 < jdata.length) {
            this.setState({ qno: qno + 1 });
        } else {
            alert('You have reached END!');
        }

    }
    prev = (e) => {
        e.preventDefault();
        const { qno } = this.state;
        if (qno - 1 >= 0) {
            this.setState({ qno: qno - 1 });
        } else {
            alert('You have reached BEGINNING!');
        }

    }
    showQuestion = () => {
        const { jdata, qno } = this.state;
        const question = Object.values(jdata[qno])[0].question;
        const options = Object.values(jdata[qno])[0].options;
        const correctoption = Object.values(jdata[qno])[0].correctoption;
        const option = Object.keys(options).map(function (k) {
            return (<div key={k} style={{ margin: 10 }}>
                <div style={{ borderWidth: 0.5, }}>
                    <p>{k.substr(k.length - 1)}. {options[k]}</p>
                </div>
            </div>)
        });
        return (
            <div>
                <div>
                    <h3>
                        Q{this.state.qno + 1}. {question}
                    </h3>
                    <div>
                        {option}
                        <div style={{ flexDirection: "row" }}>
                            <pre>
                                Correct Option: {options[correctoption]}
                            </pre>
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', width: '100%', flexDirection: "row", justifyContent: 'space-between', }}>
                    <button onClick={(e) => this.prev(e)}>Previous</button>
                    <button onClick={(e) => this.next(e)}>Next</button>
                </div>
            </div>
        );
    }
    Body = () => {
        if (this.state.loading) {
            return <Loader loading={this.state.loading} />;
        }
        else {
            if (this.state.quizFlag) {
                return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            {this.showQuestion()}
                        </div>
                        <p>Only One Quiz at a time, End this Quiz to start a new one.</p>
                    </div>
                );
            } else {
                return (
                    <div>
                        {this.newQuiz()}
                    </div>
                );
            }
        }
    }
    render() {
        return (
            <div style={{textAlign: 'center'}}>
                {this.Body()}
            </div>
        );
    }
}