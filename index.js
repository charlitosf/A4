require('dotenv').config();
const axios = require('axios')

const seconds = process.env.SECONDS || 0;
const minutes = process.env.MINUTES || 0;
const hours = process.env.HOURS || 6;
const days = process.env.DAYS || 0;

const DAYS_MARGIN = parseInt(process.env.DAYS_MARGIN) || 3;
const citaDays = process.env.APPOINTMENT_DAYS.split(' ').map((day) => parseInt(day));

const START_RIGHT_AWAY = process.env.START_RIGHT_AWAY == 'true';

let interval;
if (days <= 1)
    interval = (days * 86400 + hours * 3600 + minutes * 60 + seconds * 1) * 1000
else
    interval = (86400 + hours * 3600 + minutes * 60 + seconds) * 1000

const nWeekDaysAfter = function(todayWeekDay, weekDaysBefore) {
    const res = todayWeekDay + weekDaysBefore;
    if (res <= 6)
        return res;
    return res - 7;
}

Date.prototype.addDays = function(_days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + _days);
    return date;
}

const headers = {
    'Content-Type': 'application/vnd.oracle.adf.action+json'
}

let alreadyRequested = false;
let time = interval / 1000; // Seconds
let timeUnit;
if (time > 100) {
    time /= 60; // Minutes
    if (time > 100) {
        time /= 60; // Hours
        if (time > 48) {
            time /= 24; // Days
            timeUnit = 'days';
        } else timeUnit = 'hours';
    } else timeUnit = 'minutes';
} else timeUnit = 'seconds';

const getAppointment = function() {
    const today = new Date();
    const todayWeekDay = today.getDay(); // 0 -> Sun, 1 -> Mon, ..., 6 -> Sat
    const weekDayInNDays = nWeekDaysAfter(todayWeekDay, DAYS_MARGIN);
    const inNDays = today.addDays(DAYS_MARGIN);
    if (citaDays.includes(weekDayInNDays)) {
        if (!alreadyRequested) {
            const reqBody = `{"name":"insertarCitaPrevia","parameters":[{"servicio":"D"},{"cola":"A"},{"fecha":"${inNDays.getDate()}-${inNDays.getMonth() + 1}-${inNDays.getFullYear()}"},{"hora":"${process.env.APPOINTMENT_TIME}"},{"documento":"${process.env.APPOINTMENT_ID}"},{"ip":"0.0.0.0"},{"nombre":"${process.env.APPOINTMENT_NAME}"},{"apellido1":"${process.env.APPOINTMENT_SURNAME1}"},{"apellido2":"${process.env.APPOINTMENT_SURNAME2}"},{"tipo":"1"},{"telefono":"${process.env.APPOINTMENT_PHONE}"},{"email":"${process.env.APPOINTMENT_EMAIL}"},{"impuestos":"N"},{"motivo":"Entrenamiento"},{"procedencia":"NULO"}]}`
            axios.post('https://webservices.alicante.es/WsCitaPreviaPublic-RESTWebService-context-root/rest/1/ScCitaVo1', reqBody, { headers: headers })
                .then((res) => {
                    if (res.stats === 200 && res.data.result === "Cita insertada")
                        console.log("Cita pedida, todo correcto (?)");
                    else
                        console.log(res.data);
                })
                .catch((error) => console.log(error));
            alreadyRequested = true;
        } else {
            console.log("Ya se ha pedido la cita");
        }
    } else {
        alreadyRequested = false;
        console.log("No es necesario pedir cita");
    }

}

console.log(`Requests starting every ${time} ${timeUnit}`)
if (START_RIGHT_AWAY) getAppointment();
setInterval(getAppointment, interval);