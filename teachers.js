class Teacher {
    constructor(name) {
        this.name = name;
        this.sessions = [];
    }

    addSession(level, description) {
        this.sessions.push(new Session(level, description));
    }
}

class Session {
    constructor(level, description) {
       this.level = level;
       this.description = description;
    }
}

class TeacherListing {
    static url = 'https://crudcrud.com/api/4fad652792dd45849f26a96d6aa07be2/teachers';

    static getAllTeachers() {
        return $.get(this.url);
    }

    static getTeacher(id) {
        return $.get(this.url + `/${id}`);
    }

    static createTeacher(teacher) {
        return $.ajax({
            url: this.url,
            dataType: 'json',
            data: JSON.stringify(teacher),
            contentType: 'application/json',
            type: 'POST'
        });
    }

    static updateTeacher(teacher) {
        return $.ajax({
            url: this.url + `/${teacher._id}`,
            dataType: 'json',
            data: JSON.stringify({'teacher' : teacher.teacher,
            'session' : teacher.sessions}),
            contentType: 'application/json',
            type: 'PUT'
        });
    }

    static deleteTeacher(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

class DOMManager {
    static teachers;

    static getAllTeachers() {
        TeacherListing.getAllTeachers().then(teachers => this.render(teachers));
    }

    static createTeacher(name) {
        
        TeacherListing.createTeacher(new Teacher(name))
            .then(() => {
                return TeacherListing.getAllTeachers();
        })
            .then((teachers) => this.render(teachers));
    }

    static deleteTeacher(id) {
        TeacherListing.deleteTeacher(id)
            .then(() => {
               return TeacherListing.getAllTeachers(); 
            })
            .then((teachers) => this.render(teachers));
    }

    static addSession(id) {
        for (let teacher of this.teachers) {
            if (teacher._id == id) {
                teacher.sessions.push(new Session($(`#${teacher._id}-session-level`).val(), $(`#${teacher._id}-session-description`).val()));
                TeacherListing.updateTeacher(teacher)
                    .then(() => {
                        return TeacherListing.getAllTeachers();
                    })
                    .then((teachers) => this.render(teachers));
            }
        }
    }

    static deleteSession(teacherId, sessionId) {
        for (let teacher of this.teachers) {
            if (teacher._id == teacherId) {
                for (let session of teacher.sessions) {
                    if (session._id == sessionId) {
                        teacher.sessions.splice(teacher.sessions.indexOf(session), 1);
                        TeacherListing.updateTeacher(teacher)
                            .then(() => {
                                return TeacherListing.getAllTeachers();
                            })
                            .then((teachers) => this.render(teachers));
                    }
                }
            }
        }
    }

    static render(teachers) {
        this.teachers = teachers;
        $('#app').empty();
        for (let teacher of teachers) {
            $('#app').prepend(
                `<div id="${teacher._id}" class="card">
                    <div class="card-header">
                        <h3>${teacher.name}</h3>
                        <button class="btn btn-danger" onclick="DOMManager.deleteTeacher('${teacher._id}')">Remove</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${teacher._id}-session-level" class="form-control" placeholder="class level">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${teacher._id}-session-description" class="form-control" placeholder="class description">
                                </div>
                            </div><br>
                            <button id="${teacher._id}-new-session" onclick="DOMManager.addSession('${teacher._id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            for (let session of teacher.sessions) {
                $(`#${teacher._id}`).find('.card-body').append(
                    `<p>
                        <span id="level-${session._id}"><strong>Level: </strong> ${session.level}</span>
                        <span id="description-${session._id}"><strong>Description: </strong> ${session.description}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deleteSession('${teacher._id}', '${session._id}')">Delete Session</button>
                    </p>`
                );
            }
        }
    }
}

$('#add-new-teacher').click(() => {
    // console.log(teacher + " " + 'posted here?')
    DOMManager.createTeacher($('#teacher-name').val());
    $('#teacher-name').val('');
});

DOMManager.getAllTeachers();